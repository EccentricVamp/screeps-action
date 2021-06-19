import * as https from "https";
import * as path from "path";
import { promises as fsPromises } from "fs";

const BRANCH_PREFIX = "refs/heads/";
const BRANCH_DEFAULT = "default";
const INPUT_PREFIX = "INPUT_";

function input(inputName: string): string | undefined {
  const key = inputName
    .replace(/ /g, '_') // Replace spaces with underscores
    .toUpperCase();

  return process.env[INPUT_PREFIX + key];
}

let branch = input("branch");
if (branch === undefined) branch = BRANCH_DEFAULT;
else branch = branch.replace(BRANCH_PREFIX, "");

const token = input("token");
if (token === undefined) throw new Error ("Missing input: token");

const modules = new Map<string, string>()
const root = "dist";
const directory = await fsPromises.opendir(root);
for await (const entry of directory) {
  if (entry.isFile() && entry.name.endsWith(".js")) {
    const entryPath = path.join(directory.path, entry.name);
    const contents = await fsPromises.readFile(entryPath, 'utf8');

    // Trim ".js" from the end
    const name = entry.name.replace(/\.js$/i, "");
    
    modules.set(name, contents);
  }
}

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
  if (result instanceof Error) throw result;
});
request.end();

