import * as https from "https";

const inputPrefix = "INPUT_";
// Replace spaces with underscores and convert to upper case.
const tokenVariable = "token".replace(/ /g, '_').toUpperCase();

const token = process.env[inputPrefix + tokenVariable];
if (token === undefined) throw new Error("Missing token.");

console.log(token);

const data = {
  branch: "test",
  modules: {
    main: "require(\"hello\");",
    hello: "console.log(\"Hello World!\"); /*" + token + "*/"
  }
};

const request = https.request({
  hostname: "screeps.com",
  port: 443,
  path: "/api/user/code",
  method: "POST",
  auth: token,
  headers: {
    "Content-Type": "application/json; charset=utf-8"
  }
});

function callback(result: Error | null | undefined) {
  console.log(result);
}

request.write(JSON.stringify(data), callback);
request.end();