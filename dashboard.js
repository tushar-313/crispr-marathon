const express = require('express');
const fs = require('fs');
const os = require('os');
const path = require('path');

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
