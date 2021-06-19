import * as https from "https";
import * as path from "path";
import * as os from "os";
import {
  Dir as Directory,
  opendir as openDirectory,
  readFile
} from "fs";

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
if (branch === undefined || branch === "") branch = BRANCH_DEFAULT;
else branch = branch.replace(BRANCH_PREFIX, "");
process.stdout.write(`Branch: ${branch}${os.EOL}`);

const token = "b87011c5-a6aa-4625-ad00-84c3659b519c"; //input("token");
if (token === undefined) throw new Error ("Missing input: token");

const root = "dist";
openDirectory(root, (error, directory) => {
  if (error !== null) console.error(error);
  else getModules("", directory);
});

function getModules(
  prefix: string,
  directory: Directory
) {
  process.stdout.write(`Directory: ${directory.path}${os.EOL}`)
  const modules = new Map<string, string>();

  let entry;
  while ((entry = directory.readSync()) !== null) {
    process.stdout.write(`Entry: ${entry.name}${os.EOL}`)

    if (entry.isFile() && entry.name.endsWith(".js")) {
      const entryPath = path.join(directory.path, entry.name);
      const module = prefix + entry.name.replace(/\.js$/i, "");
      
      readFile(entryPath, 'utf8', (error, contents) => {
        if (error !== null) console.error(error);
        else modules.set(module, contents);
      });
    }
  }
  directory.closeSync();
  deploy(modules);
}

function deploy(modules: any) {
  const data = {
    branch: branch,
    modules: modules
  };

  process.stdout.write(`Modules: ${JSON.stringify(data.modules)}${os.EOL}`);

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
}

