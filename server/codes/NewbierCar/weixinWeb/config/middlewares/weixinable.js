/*
 *  Generic give weixinAccount and openid cookie middleware, should after cookie-parser and after body-parser
 */
var WeixinPub = require("../../lib/Weixin");
var config = require("../config");

var weixinable = module.exports = exports = function (options) {

    var opts = options || {};
    var name = opts.name || opts.key || "weixinAccount";
    var wxPub = new WeixinPub(config.weixinApp.appID, config.weixinApp.appsecret);

    return function (req, res, next) {

        if (req.cookies && req.cookies[name]) {

            return next();

        } else {

            //没有获取到openid时必须要先跳转授权页面，拿到openid要res.cookie() 去把浏览器的cookie中的openid的cookie给设置了， 请实现
            // 跳转页面才是真正的逻辑，实现时去掉下面的return next()
            if (req.query["code"]) {

                return next();


            } else {
                //console.log(req.protocol, req.hostname, req.path, req.port);
                console.log(req.headers["Host"]);
                console.log("222222222222222222222222222222222222222222222222222222");
                return res.redirect(wxPub.createOauthUrlForCode(req.url));

            }

        }
    };

};