'use strict';

var path = require('path');
var fs = require('fs');
var https = require('https');
var os = require('os');

const BRANCH_PREFIX = "refs/heads/";
const BRANCH_DEFAULT = "default";
const INPUT_PREFIX = "INPUT_";
const DIRECTORY = "dist";
async function run() {
    let branch = getInput("branch");
    if (branch === undefined || branch === "")
        branch = BRANCH_DEFAULT;
    else
        branch = branch.replace(BRANCH_PREFIX, "");
    process.stdout.write(`Branch: ${branch}${os.EOL}`);
    const token = getInput("token");
    if (token === undefined)
        throw new Error("Missing input: token");
    const modules = await getModules(DIRECTORY);
    const code = {
        branch: branch,
        modules: Object.fromEntries(modules)
    };
    deploy(token, code);
}
function getInput(inputName) {
    const key = inputName
        .replace(/ /g, '_') // Replace spaces with underscores
        .toUpperCase();
    return process.env[INPUT_PREFIX + key];
}
async function getModules(path$1, prefix = "", modules = null) {
    const directory = await fs.promises.opendir(path$1);
    process.stdout.write(`Directory: ${directory.path}${os.EOL}`);
    modules !== null && modules !== void 0 ? modules : (modules = new Map());
    for await (const entry of directory) {
        process.stdout.write(`Entry: ${entry.name}${os.EOL}`);
        const entryPath = path.join(directory.path, entry.name);
        if (entry.isFile() && entry.name.endsWith(".js")) {
            const module = prefix + entry.name.replace(/\.js$/i, "");
            const contents = await fs.promises.readFile(entryPath, 'utf-8');
            modules.set(module, contents);
        }
        else if (entry.isDirectory()) {
            getModules(entryPath, prefix + entry.name + ".", modules);
        }
    }
    return modules;
}
function deploy(token, data) {
    const request = https.request({
        hostname: "screeps.com",
        port: 443,
        path: "/api/user/code",
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "X-Token": token,
            "X-Username": token
        }
    });
    request.write(JSON.stringify(data), result => {
        if (result instanceof Error)
            throw result;
    });
    request.end();
}
run();
