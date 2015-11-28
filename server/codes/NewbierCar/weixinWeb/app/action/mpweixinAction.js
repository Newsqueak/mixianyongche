var utils = require("../../lib/utils");
var common = require("../../common");
var config = require("../../config/config");
var crypto = require("crypto");

var checkSignature = function (signature, timestamp, nonce) {

    var token = config.weixinApp.token;
    var tmpArr = [token, timestamp + "", nonce + ""];
    tmpArr.sort();
    var tmpStr = tmpArr.join("");
    tmpStr = crypto.createHash("sha1").update(tmpStr).digest("hex");

    if (tmpStr == signature) {
        return true;
    } else {
        return false;
    }

};

exports.mpweixinService = function (req, res, next) {

    var sig = req.query["signature"];
    var time = req.query["timestamp"];
    var nonce = req.query["nonce"];

    if (checkSignature(sig, time, nonce)) {
        return res.status(200).end(req.query["echostr"]);
    } else {
        return res.status(200).end("failed");
    }

};
