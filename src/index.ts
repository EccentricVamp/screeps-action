import * as https from "https";
import * as core from "@actions/core";

const token = core.getInput("token");
console.log(token);

const data = {
  branch: 'test',
  modules: {
    main: 'require("hello");',
    hello: 'console.log("Hello World!");'
  }
};

const request = https.request({
  hostname: 'screeps.com',
  port: 443,
  path: '/api/user/code',
  method: 'POST',
  auth: token,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
});

request.write(JSON.stringify(data));
request.end();