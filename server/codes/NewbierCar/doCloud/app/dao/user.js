/**
 * Module dependencies.
 */

var crypto = require('crypto');
var Promise = require('bluebird');
var common = require("../../common");
var salt = "mxycAi123456salt";

exports.newOne = function (uid, entirePhone, originSecret) {

    var criteria = {
        id: uid,
        entire_phone: entirePhone,
        orig_sec: originSecret,
        hashed_sec: crypto.createHmac("sha1", salt).update(originSecret).digest("hex")
    };

    return common.DBObject.queryAsync("insert into `user` set ?", criteria);
};

exports.loadByUid = function (userId) {

    return common.DBObject.queryAsync("select * from `user` where `id` = ?", [userId]).spread(
        function (rows, fields) {
            return rows;
        }
    );


};

exports.loadByLogin = function (entirePhone, password) {

    var hashedPasswd = crypto.createHmac("sha1", salt).update(password).digest("hex");

    return common.DBObject.queryAsync("select * from `user` where `entire_phone` = ? and `hashed_sec` = ?", [entirePhone, hashedPasswd])
        .spread(function (rows, fields) {
            return rows;
        });

};

exports.getUidByEntirePhone = function (entirePhone) {

    return common.DBObject.queryAsync("select `id` from `user` where `entire_phone` = ?", [entirePhone]).spread(
        function (rows, fields) {
            return rows;
        }
    );


};

exports.modifyUserProfiles = function (userId, criteria) {

    return common.DBObject.queryAsync("update `user` set ? where `id` = ?", [criteria, userId]);

};


exports.overwritePasswd = function (userId, newSec) {

    var criteria = {
        orig_sec: newSec,
        hashed_sec: crypto.createHmac("sha1", salt).update(newSec).digest("hex")
    };

    return common.DBObject.queryAsync("update `user` set ? where `id` = ?", [criteria, userId]);

};

exports.modifyPasswdOnMatch = function (userId, oldPasswd, hashedSec, newPasswd) {

    var inputHashed = crypto.createHmac("sha1", salt).update(oldPasswd).digest("hex");
    if (inputHashed === hashedSec) {
        return exports.overwritePasswd(userId, newPasswd);
    } else {
        return Promise.resolve(null);
    }

};

exports.setupMemberPoints = function (userId, basePoints) {

    var criteria = {
        uid: userId,
        basicPoints: basePoints
    };

    return common.DBObject.queryAsync("insert into `member_points` set ?", criteria);
};

