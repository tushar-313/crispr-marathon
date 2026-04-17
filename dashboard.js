const express = require('express');
const fs = require('fs');
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
        const address = server.address();
        const activePort = address && typeof address === 'object' ? address.port : port;
        console.log(`Vault Live on http://0.0.0.0:${activePort}`);
    });

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE' && !process.env.PORT && port === DEFAULT_PORT) {
            console.warn(`Port ${DEFAULT_PORT} is in use, falling back to an available port.`);
            startServer(0);
            return;
        }

        throw error;
    });
}

startServer(PORT);
