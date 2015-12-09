/*
 *  Generic give weixinAccount and openid cookie middleware, should after cookie-parser and after body-parser
 */
var WeixinPub = require("../../lib/Weixin");
var config = require("../config");
var qs = require("querystring");

var weixinable = module.exports = exports = function (options) {

    var opts = options || {};
    var name = opts.name || opts.key || "weixinAccount";
    var wxPub = new WeixinPub(config.weixinApp.appID, config.weixinApp.appsecret);

    return function (req, res, next) {

        if (req.cookies && req.cookies[name]) {

            req[name] = JSON.parse(req.cookies[name]);
            return next();

        } else {

            //没有获取到openid时必须要先跳转授权页面，拿到openid要res.cookie() 去把浏览器的cookie中的openid的cookie给设置了， 请实现
            // 跳转页面才是真正的逻辑
            if (req.query["code"]) {

                wxPub.doWhatByUserinfo(req.query["code"], function (err, userInfo) {

                    if (err) {
                        return next(err);
                    }

                    res.cookie(name, JSON.stringify(userInfo), {maxAge: 315360000 * 1000, path: '/', httpOnly: true});
                    req[name] = userInfo;
                    return next();

                });

            } else {

                var queryStr = qs.stringify(req.query);
                var toURL = config.wxOauthCallbackBaseURL + req.path + (queryStr ? ("?" + queryStr) : "");
                return res.redirect(wxPub.createOauthUrlForCode(toURL));

            }

        }
    };

};