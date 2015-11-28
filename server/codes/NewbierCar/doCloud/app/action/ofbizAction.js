var utils = require("../../lib/utils");
var common = require("../../common");
var productDao = require("../dao/product");
var orderDao = require("../dao/order");


exports.doValidOrders = function (req, res, next) {

    orderDao.loadValidOnes().then(function (orders) {

        if (!orders || orders.length === 0 || orders[0].order_no === undefined) {
            return res.json({
                code: 0,
                data: {
                    orders: []
                }
            });
        } else {
            return res.json({
                code: 0,
                data: {
                    orders: orders
                }
            });
        }

    }).catch(function (err) {
        console.log("sql error: \n" + err);
        return next(err);
    });

};

exports.doCompensation = function (req, res, next) {

    var orderNo = req.body["order_no"];
    var reason = req.body["reason"];
    var returnMoney = req.body["payment"];

    var updateInfo = {
        is_damage: "1",
        remarks: "事由：" + reason + "； \n" + "退还人民币：" + returnMoney + " 元"
    };

    orderDao.updateOneOrder(updateInfo, orderNo).then(function (query) {

        return res.json({
            code: 0
        });

    }).catch(function (err) {
        console.log("sql error: \n" + err);
        return next(err);
    });

};

exports.doSuchOrder = function (req, res, next) {

    var orderNo = req.query["order_no"] + "";

    orderDao.loadOne(orderNo).then(function (oneOrder) {

        if (!oneOrder || oneOrder.length === 0 || oneOrder[0].order_no === undefined) {

            return res.json(common.ErrCode.customFailure.nonProperParams);

        } else {
            productDao.loadTransferByProductId(oneOrder[0].product_id).then(function (theProduct) {

                if (!theProduct || theProduct.length === 0 || theProduct[0].id === undefined) {
                    return res.json(common.ErrCode.customFailure.databaseError);
                } else {
                    return res.json({
                        code: 0,
                        data: {
                            order: oneOrder[0],
                            productCar: theProduct[0]
                        }
                    });
                }

            }).catch(function (errr) {
                console.log("sql error: \n" + errr);
                return next(errr);
            });
        }

    }).catch(function (err) {
        console.log("sql error: \n" + err);
        return next(err);
    });

};

exports.doFinishedOrders = function (req, res, next) {

    orderDao.loadFinishedOnes().then(function (orders) {

        if (!orders || orders.length === 0 || orders[0].order_no === undefined) {
            return res.json({
                code: 0,
                data: {
                    orders: []
                }
            });
        } else {
            return res.json({
                code: 0,
                data: {
                    orders: orders
                }
            });
        }

    }).catch(function (err) {
        console.log("sql error: \n" + err);
        return next(err);
    });
};

exports.doQuartzStart = function (req, res, next) {

    var result = {
        removingQuartz: common.RemovingQuartz ? 1 : 0,
        cancellingQuartz: common.CancellingQuartz ? 1 : 0
    };

    if (!result.removingQuartz) {
        common.RemovingQuartz = setInterval(function () {
            console.log("removing dated orders...");
            orderDao.removeDatedOrders(30).then(function (rst) {
                console.log("removing done.\n" + JSON.stringify(rst));
            }).catch(function (err) {
                console.log("sql error: \n" + err);
            });

        }, 10 * 24 * 3600 * 1000);
        result.removingQuartz = 1;
    }

    if (!result.cancellingQuartz) {
        common.CancellingQuartz = setInterval(function () {
            console.log("cancelling unpaid orders...");
            orderDao.loadDatedFreshOrders(6).then(function (orderNos) {
                if (orderNos && orderNos.length != 0 && orderNos[0].order_no) {

                    var orderNoArr = [];
                    for (index in orderNos) {
                        orderNoArr.push(orderNos[index].order_no);
                    }

                    orderDao.cancelOrders(orderNoArr).then(function (rst) {
                        console.log("cancelling done.\n" + JSON.stringify(rst));
                    }).catch(function (errr) {
                        console.log("sql error: \n" + errr);
                    });

                } else {
                    console.log("cancelling done.");
                }
            }).catch(function (err) {
                console.log("sql error: \n" + err);
            });

        }, 1 * 24 * 3600 * 1000);
        result.cancellingQuartz = 1;
    }

    result.code = 0;
    return res.json(result);

};
