var Promise = require("bluebird");
var request = require("request");

var constants = require("./Constants.js");
var errorCode = require("./ErrorCode.js");
var remoteAPI = Promise.promisifyAll(request);

var common = module.exports = exports = {

    Consts : constants
    , ErrCode : errorCode, RemoteAPI: remoteAPI
};