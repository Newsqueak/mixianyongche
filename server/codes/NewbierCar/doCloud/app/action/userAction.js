var utils = require("../../lib/utils");
var common = require("../../common");
var userDao = require("../dao/user");
var sessionDao = require("../dao/session");
var orderDao = require("../dao/order");
var join = require("bluebird").join;

exports.doSignup = function (req, res, next) {

//    phone = "13581897657"
//    country_code = "86"
//    password = "123456abcd"

    var phone = req.body["phone"];
    var country_code = req.body["country_code"];
    var passwd = req.body["password"];
    var mobileId = req.headers["idfv"];
    var useragent = req.headers["user-agent"];

    if (phone && country_code && passwd && mobileId) {
        var entirePhone = country_code + ")" + phone;
        var suffixUserId = utils.objectId(entirePhone + passwd, 2);
        var userId = common.Consts.User.idPrefix + common.Consts.Split + suffixUserId;

        userDao.newOne(userId, entirePhone, passwd).then(function (query) {

            if (query) {

                res.status(200).end(JSON.stringify({
                    code: 0,
                    token: res.tokenify(suffixUserId)
                }));

                // to do session and member_points
                join(orderDao.linkUser(mobileId, userId), sessionDao.newSession(userId, useragent, mobileId), userDao.setupMemberPoints(userId, common.Consts.User.newPointsGift),
                    function (rst0, rst1, rst2) {
                        return 0;
                    }).then(function (r) {
                        console.log(r);
                    }).catch(function (e) {
                        console.log(e);
                    });

            }


        }).catch(function (errr) {

            console.log("sql error: \n" + errr);
            if (/ER\_DUP\_ENTRY/i.test(errr.toString()) || /Duplicate\sentry.+for\skey/i.test(errr.toString())) {
                return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.userExisting));
            } else {
                return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.databaseError));
            }
        });

    } else {
        res.status(200).end(JSON.stringify(common.ErrCode.customFailure.lackParams));
    }
};


exports.doLogin = function (req, res, next) {

//    phone = "13581897657"
//    country_code = "86"
//    password = "123456abcd"

    var phone = req.body["phone"];
    var country_code = req.body["country_code"];
    var password = req.body["password"];
    var mobileId = req.headers["idfv"];
    var useragent = req.headers["user-agent"];

    if (phone && country_code && password && mobileId && useragent) {

        var entirePhone = country_code + ")" + phone;
        var fUid = userDao.getUidByEntirePhone(entirePhone);
        var fProfiles = userDao.loadByLogin(entirePhone, password);

        join(fUid, fProfiles, function (uidrst, userrst) {

            if (!uidrst || uidrst.length === 0 || !(uidrst[0].id)) {

                return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.nonUserLogined));

            } else {

                if (!userrst || userrst.length === 0 || !(userrst[0].id)) {

                    return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.wrongPassword));

                } else {

                    var oneUser = userrst[0];
                    var phoneParts = oneUser["entire_phone"].split(")");
                    var uidSuffix = (oneUser["id"].split(common.Consts.Split))[1];

                    //          bind the orders
                    join(orderDao.linkUser(mobileId, oneUser.id), sessionDao.newSession(oneUser.id, useragent, mobileId),
                        function (r1, r2) {
                            return 0;
                        }).catch(function (eee) {
                            console.log(eee);
                        });

                    return res.json({
                        "code": 0,
                        "token": res.tokenify(uidSuffix),
                        "avatar_url": oneUser["avatar_url"] || "",
                        "screen_name": oneUser["screen_name"] || "",
                        "official_name": oneUser["official_name"] || "",
                        "gender": oneUser["gender"] || "",
                        "birthday": oneUser["birthday"] || "",
                        "phone": phoneParts[1],
                        "country_code": phoneParts[0],
                        "email": oneUser["email"] || ""
                    });

                }

            }

        }).catch(function (ee) {

            console.log("sql error: \n" + ee);
            return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.databaseError));

        });

    } else {
        res.status(200).end(JSON.stringify(common.ErrCode.customFailure.lackParams));
    }

};

exports.doExistence = function (req, res, next) {

    var phone = req.body["phone"];
    var country_code = req.body["country_code"];
    var entirePhone = country_code + ")" + phone;

    if (phone && country_code) {

        userDao.getUidByEntirePhone(entirePhone).then(function (query) {

            var isExisting = 0;
            if (!query || query.length === 0 || !(query[0].id)) {
                isExisting = 0;
            } else {
                isExisting = 1;
            }

            return res.status(200).end(JSON.stringify({
                code: 0,
                is_existing: isExisting
            }));

        }).catch(function (ee) {
            console.log("sql error: \n" + ee);
            return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.databaseError));
        });

    } else {
        res.status(200).end(JSON.stringify(common.ErrCode.customFailure.lackParams));
    }

};

exports.doForgetPasswd = function (req, res, next) {

    var phone = req.body["phone"];
    var country_code = req.body["country_code"];
    var newPasswd = req.body["new_password"];

    if (phone && country_code && newPasswd) {

        var entirePhone = country_code + ")" + phone;
        userDao.getUidByEntirePhone(entirePhone).then(function (query) {

            if (!query || query.length === 0 || !(query[0].id)) {
                return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.nonPermission));
            } else {

                userDao.overwritePasswd(query[0].id, newPasswd).then(function (rrr) {

                    if (rrr) {
                        return res.status(200).end(JSON.stringify({
                            code: 0
                        }));
                    }

                }).catch(function (eee) {

                    console.log("sql error: \n" + eee);
                    return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.databaseError));

                });

            }

        }).catch(function (ee) {

            console.log("sql error: \n" + ee);
            return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.databaseError));

        });

    } else {
        res.status(200).end(JSON.stringify(common.ErrCode.customFailure.lackParams));
    }

};

exports.doUpdatePasswd = function (req, res, next) {

    var uidSuffix = req.body["partialUid"];
    var oldPasswd = req.body["old_password"];
    var newPasswd = req.body["new_password"];

    if (uidSuffix && oldPasswd && newPasswd) {

        var userId = common.Consts.User.idPrefix + common.Consts.Split + uidSuffix;
        userDao.loadByUid(userId).then(function (query) {

            if (!query || query.length === 0 || !(query[0].id)) {
                return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.nonPermission));
            } else {

                userDao.modifyPasswdOnMatch(userId, oldPasswd, query[0]["hashed_sec"], newPasswd).then(function (rr) {

                    if (rr) {
                        return res.status(200).end(JSON.stringify({
                            code: 0
                        }));
                    } else {
                        return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.wrongPassword));
                    }

                }).catch(function (eee) {

                    console.log("sql error: \n" + eee);
                    return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.databaseError));

                });

            }

        }).catch(function (ee) {

            console.log("sql error: \n" + ee);
            return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.databaseError));

        });


    } else {
        res.status(200).end(JSON.stringify(common.ErrCode.customFailure.lackParams));
    }
};

exports.doSendProfile = function (req, res, next) {

    //token = "yTXRyRRdcq+faDODP0yhAMYZ1Ks275"
    //fields = "avatar_url,birthday"       //这个fields字段表明要提交修改哪几个字段的资料，
    ////在这些中挑选值"avatar_url", "screen_name", "official_name",
    ////"gender", "birthday", "phone", "email",
    ////如果多个字段就用逗号分隔，如果只改单个字段，没有逗号
    //avatar_url = "http://tp3.sinaimg.cn/1192329374/180/5721640759/0"
    //birthday = "2010-11-10"        //记得必须是这样的格式，年-月-日

    var uidSuffix = req.body["partialUid"];
    if (!uidSuffix) {
        return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.nonLogin));
    }

    var fields = req.body["fields"];
    if (!fields) {
        return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.lackParams));
    }

    var fieldNames = fields.split(",");
    var changedCriteria = {};
    var seed = true;
    var name = null;
    var column = null;
    var value = null;
    for (index in fieldNames) {
        name = fieldNames[index];
        column = common.Consts.User.profiles[name];
        value = req.body[name];
        seed = seed && value;

        if (column) {
            changedCriteria[column] = value;
        }

    }

    if (seed) {

        var userId = common.Consts.User.idPrefix + common.Consts.Split + uidSuffix;
        userDao.modifyUserProfiles(userId, changedCriteria).then(function (rr) {

            if (rr) {
                return res.status(200).end(JSON.stringify({
                    code: 0
                }));
            }

        }).catch(function (ee) {

            console.log("sql error: \n" + ee);
            return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.databaseError));

        });

    } else {
        res.status(200).end(JSON.stringify(common.ErrCode.customFailure.lackParams));
    }

};

exports.doSyncProfile = function (req, res, next) {

    var partialUid = req.body["partialUid"];

    if (!partialUid) {
        return res.json(common.ErrCode.customFailure.nonLogin);
    }

    var uid = common.Consts.User.idPrefix + common.Consts.Split + partialUid;
    userDao.loadByUid(uid).then(function (query) {

        if (!query || query.length === 0 || query[0].id === undefined) {
            return res.json(common.ErrCode.customFailure.nonProperParams);
        } else {
            var oneUser = query[0];
            var phoneParts = oneUser["entire_phone"].split(")");

            return res.json({
                "code": 0,
                "avatar_url": oneUser["avatar_url"] || "",
                "screen_name": oneUser["screen_name"] || "",
                "official_name": oneUser["official_name"] || "",
                "gender": oneUser["gender"] || "",
                "birthday": oneUser["birthday"] || "",
                "phone": phoneParts[1],
                "country_code": phoneParts[0],
                "email": oneUser["email"] || ""
            });
        }
    }).catch(function (ee) {
        console.log("sql error: \n" + ee);
        return next(ee);
    });

};
