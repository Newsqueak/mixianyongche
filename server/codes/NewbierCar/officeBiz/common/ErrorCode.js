var http = require("http");
var extend = require("util")._extend;


var customErrCode = {
    customSuccess: 0,
    customFailure: 1
};

http.STATUS_CODES = extend(http.STATUS_CODES, {
    0: "custom successful response",
    1: "custom failed response"
});

module.exports = customErrCode;
