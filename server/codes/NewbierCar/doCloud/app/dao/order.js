var common = require("../../common");

exports.linkUser = function (mobId, userId) {

    var criteria = {
        uid: userId
    };

    return common.DBObject.queryAsync("update `orders` set ? where `mobileId` = ? and `uid` = '-'", [criteria, mobId]);

};

exports.newOrder = function (criteria) {

    return common.DBObject.queryAsync("insert into `orders` set ?", criteria);

};

exports.loadOne = function (order_no) {

    return common.DBObject.queryAsync("select * from `orders` where `order_no` = ?", [order_no]).spread(
        function (rows, fields) {
            return rows;
        }
    );

};

exports.getChargeIdByOrderNo = function (order_no) {

    return common.DBObject.queryAsync("select `charge_id` from `orders` where `order_no` = ?", [order_no]).spread(
        function (rows, fields) {
            return rows;
        }
    );

};

exports.loadValidOnes = function () {

    return common.DBObject.queryAsync("select * from `orders` where `pay_status` = ? order by `build_time` asc", [common.Consts.Order.dbStatuses.paid])
        .spread(
        function (rows, fields) {
            return rows;
        }
    );

};

exports.loadOnesOfUid = function (userId) {

    return common.DBObject.queryAsync("select * from `orders` where `uid` = ? order by `build_time` desc limit 0, 50", [userId]).spread(
        function (rows, fields) {
            return rows;
        }
    );

};

exports.loadOnesOfMobid = function (mobileId) {

    return common.DBObject.queryAsync("select * from `orders` where `mobileId` = ? order by `build_time` desc limit 0, 50", [mobileId]).spread(
        function (rows, fields) {
            return rows;
        }
    );

};

exports.updateOneOrder = function (criteria, order_no) {

    return common.DBObject.queryAsync("update `orders` set ? where `order_no` = ?", [criteria, order_no]);

};

exports.cancelOrders = function (orderNoArray) {

    var sqlStrArr = [];
    var params = [];
    params.push(common.Consts.Order.dbStatuses.canceled);
    for (index in orderNoArray) {
        sqlStrArr.push('?');
        params.push(orderNoArray[index]);
    }
    params.push(common.Consts.Order.dbStatuses.fresh);

    return common.DBObject.queryAsync("update `orders` set `pay_status` = ? where `order_no` in (" + sqlStrArr.join(', ') + ") and `pay_status` = ?",
        params);

};

exports.logOneCharge = function (orderNo, chargeId, chargeHere) {

    var criteria = {
        charge_id: chargeId,
        order_no: orderNo,
        charge: chargeHere
    };
    return common.DBObject.queryAsync("insert into `charges_log` set ?", criteria);

};

exports.getPayStatus = function (order_no) {

    return common.DBObject.queryAsync("select `pay_status`, `service_tel_abroad` from `orders` where `order_no` = ?", [order_no]).spread(
        function (rows, fields) {
            return rows;
        }
    );

};

exports.updateOneCharge = function (orderNo, chargeId, charge) {

    return common.DBObject.queryAsync("update `charges_log` set `charge` = ? where `charge_id` = ? and `order_no` = ?",
        [charge, chargeId, orderNo]);

};

exports.loadFinishedOnes = function () {

    return common.DBObject.queryAsync("select * from `orders` where `pay_status` = ? order by `build_time` desc", [common.Consts.Order.dbStatuses.confirmed]).spread(
        function (rows, fields) {
            return rows;
        }
    );

};

exports.removeDatedOrders = function (days) {

    return common.DBObject.queryAsync("delete from `orders` where `pay_status` = ? and `build_time` < date_sub(now(), interval ? day)", [common.Consts.Order.dbStatuses.canceled, days]);

};

exports.loadDatedFreshOrders = function (hours) {

    return common.DBObject.queryAsync("select `order_no` from `orders` where `pay_status` = ? and `build_time` < date_sub(now(), interval ? hour)", [common.Consts.Order.dbStatuses.fresh, hours]).spread(
        function (rows, fields) {
            return rows;
        }
    );

};
