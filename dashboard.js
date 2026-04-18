const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');
const si = require('systeminformation');

const app = express();
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const DEFAULT_PORT = 8000;
const PORT = Number(process.env.PORT) || DEFAULT_PORT;
const PAYLOAD_EXTENSIONS = new Set(['.txt', '.md']);

function getPayloadFiles() {
    return fs
        .readdirSync(ROOT_DIR)
        .filter((fileName) => PAYLOAD_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
        .sort((left, right) => left.localeCompare(right));
}

function isSafePayloadName(fileName) {
    return fileName === path.basename(fileName) && PAYLOAD_EXTENSIONS.has(path.extname(fileName).toLowerCase());
}

function isSafeAssetName(fileName) {
    return fileName === path.basename(fileName) && path.extname(fileName).toLowerCase() === '.pdf';
}

function getIndexFilePath() {
    return path.join(PUBLIC_DIR, 'index.html');
}

function getServerFilePath() {
    return path.join(PUBLIC_DIR, 'server.html');
}

function getPreferredHostIp() {
    const interfaces = os.networkInterfaces();

    for (const entries of Object.values(interfaces)) {
        for (const entry of entries || []) {
            if (entry && entry.family === 'IPv4' && !entry.internal) {
                return entry.address;
            }
        }
    }

    return '127.0.0.1';
}

function roundNumber(value, digits = 1) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
        return null;
    }

    const factor = 10 ** digits;
    return Math.round(numericValue * factor) / factor;
}

function pickPrimaryVolume(volumes) {
    if (!Array.isArray(volumes) || !volumes.length) {
        return null;
    }

    return volumes.find((volume) => volume.mount === '/')
        || volumes.find((volume) => volume.mount === '/System/Volumes/Data')
        || volumes.find((volume) => volume.mount && volume.mount !== 'tmpfs')
        || volumes[0];
}

function pickPrimaryInterface(interfaces) {
    if (!Array.isArray(interfaces) || !interfaces.length) {
        return null;
    }

    return interfaces.find((network) => network.ip4 && network.ip4 !== '127.0.0.1' && !network.internal)
        || interfaces.find((network) => network.ip4)
        || interfaces[0];
}

function pickTemperature(temperature) {
    if (!temperature) {
        return null;
    }

    if (Number.isFinite(temperature.main) && temperature.main > 0) {
        return roundNumber(temperature.main, 1);
    }

    if (Array.isArray(temperature.cores)) {
        const values = temperature.cores.filter((value) => Number.isFinite(value) && value > 0);
        if (values.length) {
            return roundNumber(values.reduce((sum, value) => sum + value, 0) / values.length, 1);
        }
    }

    return null;
}

async function safeCollect(task, fallback) {
    try {
        return await task;
    } catch {
        return fallback;
    }
}

async function collectSystemSnapshot() {
    const [cpu, load, memory, volumes, temperature, osInfo, timeInfo, networkInterfaces, networkStats] = await Promise.all([
        safeCollect(si.cpu(), {}),
        safeCollect(si.currentLoad(), {}),
        safeCollect(si.mem(), {}),
        safeCollect(si.fsSize(), []),
        safeCollect(si.cpuTemperature(), {}),
        safeCollect(si.osInfo(), {}),
        safeCollect(si.time(), {}),
        safeCollect(si.networkInterfaces(), []),
        safeCollect(si.networkStats(), []),
    ]);

    const primaryVolume = pickPrimaryVolume(volumes);
    const primaryInterface = pickPrimaryInterface(networkInterfaces);
    const primaryInterfaceStats = primaryInterface
        ? networkStats.find((network) => network.iface === primaryInterface.iface)
        : null;

    const loadAverages = os.loadavg().map((value) => roundNumber(value, 2));
    const temperatureValue = pickTemperature(temperature);
    const memoryUsage = Number.isFinite(memory.total) && memory.total > 0
        ? roundNumber((memory.used / memory.total) * 100, 1)
        : null;

    return {
        sampledAt: new Date().toISOString(),
        host: {
            hostname: os.hostname(),
            fqdn: osInfo.fqdn || os.hostname(),
            platform: os.platform(),
            type: os.type(),
            release: os.release(),
            architecture: os.arch(),
            kernel: osInfo.kernel || os.release(),
            distro: osInfo.distro || osInfo.platform || 'n/a',
            uptimeSeconds: os.uptime(),
        },
        cpu: {
            manufacturer: cpu.manufacturer || 'n/a',
            brand: cpu.brand || 'n/a',
            vendor: cpu.vendor || 'n/a',
            family: cpu.family || 'n/a',
            physicalCores: cpu.physicalCores || cpu.cores || null,
            logicalCores: cpu.cores || null,
            speedGHz: roundNumber(load.currentLoadSpeed || cpu.speed || cpu.speedmax || cpu.speedmin || null, 2),
            usagePercent: roundNumber(load.currentLoad, 1),
            userPercent: roundNumber(load.currentLoadUser, 1),
            systemPercent: roundNumber(load.currentLoadSystem, 1),
            idlePercent: roundNumber(load.currentLoadIdle, 1),
            loadPercent: roundNumber(load.currentLoad, 1),
            averages: loadAverages,
        },
        memory: {
            total: memory.total || null,
            used: memory.used || null,
            free: memory.free || null,
            available: memory.available || null,
            active: memory.active || null,
            swapTotal: memory.swaptotal || null,
            swapUsed: memory.swapused || null,
            usagePercent: memoryUsage,
        },
        storage: {
            primary: primaryVolume ? {
                mount: primaryVolume.mount || 'n/a',
                fileSystem: primaryVolume.fs || 'n/a',
                type: primaryVolume.type || 'n/a',
                size: primaryVolume.size || null,
                used: primaryVolume.used || null,
                available: primaryVolume.available || null,
                usagePercent: Number.isFinite(primaryVolume.use) ? roundNumber(primaryVolume.use, 1) : null,
            } : null,
            volumes: volumes.slice(0, 8).map((volume) => ({
                mount: volume.mount || 'n/a',
                fileSystem: volume.fs || 'n/a',
                type: volume.type || 'n/a',
                size: volume.size || null,
                used: volume.used || null,
                available: volume.available || null,
                usagePercent: Number.isFinite(volume.use) ? roundNumber(volume.use, 1) : null,
            })),
        },
        temperature: {
            current: temperatureValue,
            max: Number.isFinite(temperature.max) ? roundNumber(temperature.max, 1) : null,
            cores: Array.isArray(temperature.cores)
                ? temperature.cores.filter((value) => Number.isFinite(value)).map((value) => roundNumber(value, 1))
                : [],
            sockets: Array.isArray(temperature.sockets)
                ? temperature.sockets.filter((value) => Number.isFinite(value)).map((value) => roundNumber(value, 1))
                : [],
        },
        network: {
            primary: primaryInterface ? {
                iface: primaryInterface.iface || 'n/a',
                ip4: primaryInterface.ip4 || 'n/a',
                ip6: primaryInterface.ip6 || 'n/a',
                mac: primaryInterface.mac || 'n/a',
                type: primaryInterface.type || 'n/a',
                speed: primaryInterface.speed || null,
                operstate: primaryInterface.operstate || 'n/a',
                internal: Boolean(primaryInterface.internal),
            } : null,
            primaryStats: primaryInterfaceStats ? {
                rxBytes: primaryInterfaceStats.rx_bytes || 0,
                txBytes: primaryInterfaceStats.tx_bytes || 0,
                rxPackets: primaryInterfaceStats.rx_packets || 0,
                txPackets: primaryInterfaceStats.tx_packets || 0,
                rxErrors: primaryInterfaceStats.rx_errors || 0,
                txErrors: primaryInterfaceStats.tx_errors || 0,
            } : null,
            interfaces: networkInterfaces.slice(0, 8).map((network) => ({
                iface: network.iface || 'n/a',
                type: network.type || 'n/a',
                ip4: network.ip4 || 'n/a',
                ip6: network.ip6 || 'n/a',
                mac: network.mac || 'n/a',
                speed: network.speed || null,
                operstate: network.operstate || 'n/a',
                internal: Boolean(network.internal),
            })),
        },
        process: {
            pid: process.pid,
            nodeVersion: process.version,
            uptimeSeconds: process.uptime(),
            rss: process.memoryUsage().rss,
            heapUsed: process.memoryUsage().heapUsed,
            heapTotal: process.memoryUsage().heapTotal,
            cwd: process.cwd(),
        },
        time: {
            current: timeInfo.current || new Date().toISOString(),
            uptimeSeconds: timeInfo.uptime || os.uptime(),
            timezone: timeInfo.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'n/a',
            bootTime: timeInfo.bootTime || null,
        },
    };
}

app.use(express.static(PUBLIC_DIR, {
    extensions: ['html'],
    maxAge: 0,
}));

app.get('/api/files', (req, res) => {
    const files = getPayloadFiles().map((fileName) => {
        const filePath = path.join(ROOT_DIR, fileName);
        const stats = fs.statSync(filePath);

        return {
            name: fileName,
            extension: path.extname(fileName).slice(1).toLowerCase(),
            size: stats.size,
            modifiedAt: stats.mtime.toISOString(),
        };
    });

    res.json({
        count: files.length,
        files,
    });
});

app.get('/api/files/:name', (req, res) => {
    const fileName = req.params.name;

    if (!isSafePayloadName(fileName)) {
        res.status(400).json({ error: 'invalid file name' });
        return;
    }

    const files = getPayloadFiles();
    if (!files.includes(fileName)) {
        res.status(404).json({ error: 'file not found' });
        return;
    }

    const filePath = path.join(ROOT_DIR, fileName);
    const stats = fs.statSync(filePath);
    const content = fs.readFileSync(filePath, 'utf8');

    res.json({
        name: fileName,
        extension: path.extname(fileName).slice(1).toLowerCase(),
        size: stats.size,
        modifiedAt: stats.mtime.toISOString(),
        content,
    });
});

app.get('/assets/:name', (req, res) => {
    const fileName = req.params.name;

    if (!isSafeAssetName(fileName)) {
        res.status(400).json({ error: 'invalid asset name' });
        return;
    }

    const filePath = path.join(ROOT_DIR, fileName);
    if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: 'asset not found' });
        return;
    }

    res.sendFile(filePath);
});

app.get(['/healthz', '/api/healthz'], (req, res) => {
    res.json({ ok: true, service: 'crispr-marathon' });
});

app.get('/api/system', async (req, res) => {
    try {
        const snapshot = await collectSystemSnapshot();
        res.json(snapshot);
    } catch (error) {
        res.status(500).json({
            error: 'failed to collect system telemetry',
            detail: error instanceof Error ? error.message : 'unknown error',
        });
    }
});

app.get(['/server', '/server.html'], (req, res) => {
    res.sendFile(getServerFilePath());
});

app.get('*', (req, res) => {
    res.sendFile(getIndexFilePath());
});

function startServer(port) {
    const server = app.listen(port, '0.0.0.0', () => {
        const hostIp = getPreferredHostIp();
        console.log(`server live on http://${hostIp}:${port}/`);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE' && port === DEFAULT_PORT) {
            console.error(`Port ${DEFAULT_PORT} is already in use. Stop the other process and restart.`);
            process.exit(1);
        }

        throw error;
    });
}

startServer(PORT);
