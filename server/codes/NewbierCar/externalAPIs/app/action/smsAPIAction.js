var utils = require("../../lib/utils");
var common = require("../../common");
var config = require("../../config/config");
var crypto = require("crypto");
var qs = require("querystring");

exports.sendMsg = function (req, res, next) {

    var countryCode = req.body["country_code"];
    var phone = req.body["phone"];
    var msg = req.body["msg"];

    if (countryCode && phone && msg) {

        var timestamp = new Date().getTime();
        var dtime = Math.round(timestamp / 1000.0);
        var queryObj = {
            username: config.smsOptions.username,
            pwd: crypto.createHash("md5").update(config.smsOptions.username + config.smsOptions.password + dtime).digest("hex"),
            mobiles: phone,
            msg: common.Consts.SMS.title.mxyc + msg,
            code: 9999,
            dt: dtime
        };

        common.RemoteAPI.get(config.smsOptions.url + "?" + qs.stringify(queryObj), function (e, r, result) {

            if (e) {
                return next(e);
            }

            if (result == "0") {
                return res.json({
                    code: 0
                });
            } else {
                return res.json(common.ErrCode.customFailure[result]);
            }

        });

    } else {
        res.json(common.ErrCode.customFailure.lackParams);
    }

};

