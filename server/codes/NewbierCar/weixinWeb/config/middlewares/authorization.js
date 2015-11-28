/*
 *  Generic require login routing middleware, should after cookie-parser
 */

exports.weixinOAuthable = function (options) {

    var opts = options || {};
    var name = opts.name || opts.key || "openid";

    return function (req, res, next) {

        if (req.cookies && req.cookies[name]) {

            req[name] = "..."     //从cookies中取出真正的那个openid 的字符串，其他的过期时间等等不要, 请实现~~~
            return next();

        } else {

            //没有获取到openid时必须要先跳转授权页面，拿到openid要res.cookie() 去把浏览器的cookie中的openid的cookie给设置了， 请实现
            // 跳转页面才是真正的逻辑，实现时去掉下面的return next()
            return next();

        }

    };

};