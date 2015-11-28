var common = require("../../common");

exports.newSession = function (userId, userAgent, mobId) {

    var criteria = {
        uid: userId,
        ua: userAgent,
        mobileId: mobId
    };

    return common.DBObject.queryAsync("insert into `session` set ?", criteria);

};