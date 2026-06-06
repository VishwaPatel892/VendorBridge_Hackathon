const fs = require('fs');
const path = require('path');
const deps = new Set();
function walk(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(file => {
        const p = path.join(dir, file);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else if (p.endsWith('.js')) {
            const code = fs.readFileSync(p, 'utf8');
            const matches = [...code.matchAll(/require\(['"]([^.\/][^'"]*)['"]\)/g)];
            matches.forEach(m => {
                const pkg = m[1].startsWith('@') ? m[1].split('/').slice(0,2).join('/') : m[1].split('/')[0];
                if (pkg !== 'path' && pkg !== 'fs' && pkg !== 'crypto' && pkg !== 'http' && pkg !== 'util' && pkg !== 'events' && pkg !== 'stream' && pkg !== 'os') {
                    deps.add(pkg);
                }
            });
        }
    });
}
walk('dist');
console.log(Array.from(deps).sort().join(' '));
