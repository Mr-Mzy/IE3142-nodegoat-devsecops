const nunjucks = require("nunjucks");
const fs = require("fs");
const path = require("path");

const root = path.resolve("app/views");
const env = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(root),
    { autoescape: true }
);

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return walk(full);
        return entry.name.endsWith(".html") ? [full] : [];
    });
}

let failed = 0;

for (const file of walk(root)) {
    const name = path.relative(root, file).replace(/\\/g, "/");
    try {
        env.getTemplate(name, true);
        console.log("OK: " + name);
    } catch (err) {
        failed++;
        console.error("FAIL: " + name + " — " + err.message);
    }
}

console.log(`\nTemplate compilation: ${failed} failure(s).`);
process.exitCode = failed ? 1 : 0;
