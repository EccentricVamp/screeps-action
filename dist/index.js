'use strict';

var https = require('https');
var path = require('path');
var os = require('os');
var fs = require('fs');

const BRANCH_PREFIX = "refs/heads/";
const BRANCH_DEFAULT = "default";
const INPUT_PREFIX = "INPUT_";
function input(inputName) {
    const key = inputName
        .replace(/ /g, '_') // Replace spaces with underscores
        .toUpperCase();
    return process.env[INPUT_PREFIX + key];
}
let branch = input("branch");
if (branch === undefined)
    branch = BRANCH_DEFAULT;
else
    branch = branch.replace(BRANCH_PREFIX, "");
const token = "b87011c5-a6aa-4625-ad00-84c3659b519c"; //input("token");
const modules = new Map();
const root = "dist";
fs.opendir(root, (error, directory) => {
    if (error !== null)
        console.error(error);
    else
        getModules("", directory);
});
function getModules(prefix, directory) {
    process.stdout.write(`Directory: ${directory.path}${os.EOL}`);
    let entry;
    while ((entry = directory.readSync()) !== null) {
        process.stdout.write(`Entry: ${entry.name}${os.EOL}`);
        if (entry.isFile() && entry.name.endsWith(".js")) {
            const entryPath = path.join(directory.path, entry.name);
            const name = `${prefix}.${entry.name.replace(/\.js$/i, "")}`;
            fs.readFile(entryPath, 'utf8', (error, contents) => {
                if (error !== null)
                    console.error(error);
                else {
                    process.stdout.write(`Contents: ${contents}${os.EOL}`);
                    modules.set(name, contents);
                }
            });
        }
    }
    directory.closeSync();
    deploy(modules);
}
function deploy(modules) {
    const data = {
        branch: branch,
        modules: modules
    };
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
