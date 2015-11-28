function session(options) {
    var opts = options || {};
    var name = opts.name || opts.key || "token";
    return function (req, res, next) {
        req.userToken = req.body[name];
        next();
    };

}
//TODO: the function of realizing req.session

exports = module.exports = session;