var utils = require("../../lib/utils");
var common = require("../../common");
var config = require("../../config/config");
var crypto = require("crypto");
var qs = require("querystring");
var quartz = null;
var repeatPeriod = 3 * 60 * 1000;
var captchaPool = {}; //容易内存泄漏的主，要换成redis

exports.emitting = function (req, res, next) {


    var countryCode = req.body["country_code"];
    var phone = req.body["phone"];

    if (countryCode && phone) {

        var captcha = Math.random().toString().substring(2, 7);
        var timestamp = new Date().getTime();
        var dtime = Math.round(timestamp / 1000.0);
        var queryObj = {
            username: config.smsOptions.username,
            pwd: crypto.createHash("md5").update(config.smsOptions.username + config.smsOptions.password + dtime).digest("hex"),
            mobiles: phone,
            msg: common.Consts.SMS.title.mxyc + common.Consts.SMS.template.mxyc.replace("{captcha}", captcha),
            code: 8888,
            dt: dtime
        };

        captchaPool[countryCode + ")" + phone] = {c: captcha, t: timestamp};

        if (!quartz) {
            quartz = setInterval(function () {
                var timeNow = new Date().getTime();
                var obj = null;
                for (key in captchaPool) {
                    obj = captchaPool[key];
                    if (timeNow - obj.t > 2 * 60 * 1000) {
                        delete captchaPool[key];
                    }
                }
            }, repeatPeriod);
        }

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


exports.verifying = function (req, res, next) {

    var countryCode = req.body["country_code"];
    var phone = req.body["phone"];
    var captcha = req.body["captcha"];

    if (countryCode && phone && captcha) {
        var phoneKey = countryCode + ")" + phone;
        var rstObj = captchaPool[phoneKey];
        if (rstObj) {
            var timeNow = new Date().getTime();
            if (timeNow - rstObj.t >= 2 * 60 * 1000) {
                res.json(common.ErrCode.customFailure.captchaTimeout);
            } else if (captcha === rstObj.c) {
                res.json({
                    code: 0
                });
            } else {
                res.json(common.ErrCode.customFailure.captchaWrong);
            }

            delete captchaPool[phoneKey];

        } else {
            res.json(common.ErrCode.customFailure.captchaTimeout);
        }
    } else {
        res.json(common.ErrCode.customFailure.lackParams);
    }

};
