var crypto = require("crypto");

exports = module.exports = function (options) {

    var encryptUtils = {};

    encryptUtils.aesEncrypt = function (data, secretKey) {
        var cipher = crypto.createCipher('aes-256-ecb', secretKey);
        return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
    };

    encryptUtils.aesDecrypt = function (data, secretKey) {
        var cipher = crypto.createDecipher('aes-256-ecb', secretKey);
        var partial = cipher.update(data, 'hex', 'utf8');
        return partial + cipher.final('utf8');
    };

    var opts = options || {};
    var name = opts.name || opts.key || "token";
    return function (req, res, next) {

        if (req.body && typeof req.body === "object" && name in req.body) {
            var token = req.body[name];
            delete req.body[name];
            req.body["partialUid"] = encryptUtils.aesDecrypt(token, "mxycAi123456token");
        }
        res.tokenify = function (partialUid) {
            return encryptUtils.aesEncrypt(partialUid, "mxycAi123456token");
        };
        next();
    };
};
