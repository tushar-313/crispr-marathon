const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 8000;

app.get('/', (req, res) => {
    const files = fs.readdirSync('./').filter(f => f.endsWith('.txt') || f.endsWith('.md'));
    const selectedFile = req.query.file;
    let displayContent = "Select a file to decrypt...";
    if (selectedFile && files.includes(selectedFile)) {
        displayContent = fs.readFileSync(path.join(__dirname, selectedFile), 'utf8');
    }
    let html = `<html><head><style>
        body { font-family: 'Courier New', monospace; background: #050505; color: #00ff41; padding: 20px; }
        .container { max-width: 900px; margin: auto; border: 1px solid #00ff41; padding: 30px; }
        .file-link { color: #ff00ff; border: 1px solid #ff00ff; padding: 5px; text-decoration: none; margin-right: 10px; display: inline-block; margin-bottom: 10px; }
        .viewer { background: #111; padding: 20px; border-left: 5px solid #00ff41; white-space: pre-wrap; color: #eee; }
    </style></head><body><div class="container"><h1>CRISPR_VAULT_2026</h1><div class="file-browser">
    ${files.map(f => `<a class="file-link" href="/?file=${f}">${f}</a>`).join('')}
    </div><div class="viewer">${displayContent}</div></div></body></html>`;
    res.send(html);
});
app.listen(PORT, '0.0.0.0', () => console.log("Vault Live."));
