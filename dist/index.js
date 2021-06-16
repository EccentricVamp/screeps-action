'use strict';

var https = require('https');

const inputPrefix = "INPUT_";
// Replace spaces with underscores and convert to upper case.
const tokenVariable = "token".replace(/ /g, '_').toUpperCase();
const token = process.env[inputPrefix + tokenVariable];
if (token === undefined)
    throw new Error("Missing token.");
const data = {
    branch: "default",
    modules: {
        main: "require(\"hello\");",
        hello: "console.log(\"Hello World!\");"
    }
};
const request = https.request({
    hostname: "screeps.com",
    port: 443,
    path: "/api/user/code",
    method: "POST",
    headers: {
        "Content-Type": "application/json; charset=utf-8",
        'X-Token': token,
        'X-Username': token
    }
});
request.write(JSON.stringify(data), throwOnError);
request.end();
function throwOnError(result) {
    if (result instanceof Error)
        throw result;
}
