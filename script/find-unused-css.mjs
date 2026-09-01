import fs from 'fs';
import path from 'path';

const root = path.resolve('app');

function walk(dir, acc = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walk(p, acc);
        else acc.push(p);
    }
    return acc;
}

const files = walk(root);
const jsxFiles = files.filter((f) => /\.(js|jsx)$/.test(f));
const cssFiles = files.filter((f) => /\.module\.css$/.test(f));
const jsxText = jsxFiles.map((f) => fs.readFileSync(f, 'utf8')).join('\n');

function classNames(cssFile) {
    const t = fs.readFileSync(cssFile, 'utf8');
    const names = new Set();
    for (const m of t.matchAll(/(?:^|[,}\s])\.([A-Za-z_][\w-]*)/g)) {
        names.add(m[1]);
    }
    return [...names];
}

for (const c of cssFiles) {
    const names = classNames(c);
    const unused = names.filter((n) => {
        const re = new RegExp(`(?:styles|sharedStyles|authStyles|signupStyles|logostyle|expansionStyles|groupStyles|homeStyles)\\.${n}\\b`);
        const bracket = new RegExp(`(?:styles|sharedStyles)\\[['\"]${n}['\"]\\]`);
        return !re.test(jsxText) && !bracket.test(jsxText);
    });
    if (unused.length) {
        console.log(`\n== ${path.relative(root, c)} unused (${unused.length}/${names.length})`);
        console.log(unused.join(', '));
    }
}
