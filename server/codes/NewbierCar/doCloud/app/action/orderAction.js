var utils = require("../../lib/utils");
var common = require("../../common");
var locationDao = require("../dao/location");
var productDao = require("../dao/product");
var flightDao = require("../dao/flight");
var orderDao = require("../dao/order");
var ycCountDao = require("../dao/dailyYcCount");
var actionsHelper = require("./actionsHelper");
var Promise = require("bluebird");
var join = Promise.join;
var moment = require("moment");

exports.doCreation = function (req, res, next) {

    var partialUid = req.body["partialUid"];
    var bookDate = req.body["book_date"];
    var flightNo = req.body["flight_no"];
    var jieSong = req.body["JIEJI_SONGJI"];
    var placeId = req.body["place_id"];
    var productId = req.body["product_id"];
    var adultNumStr = req.body["adult_count"];
    var childNumStr = req.body["child_count"];
    var babyNumStr = req.body["baby_count"];
    var orderPhone = req.body["order_phone"];
    var orderCountryCode = req.body["order_country_code"];
    var orderEmail = req.body["order_email"];
    var orderUsername = req.body["order_username"];
    var orderPickupCardName = req.body["order_pickup_card_name"];
    var orderUseCarTime = req.body["order_use_car_time"];
    var mobileId = req.headers["idfv"];
    var useragent = req.headers["user-agent"];

    if (bookDate && flightNo && jieSong && placeId && productId && adultNumStr && childNumStr && babyNumStr && orderPhone && orderCountryCode && orderEmail && orderUsername &&
        orderUseCarTime && mobileId && useragent) {
        var adultNum = Number(adultNumStr);
        var childNum = Number(childNumStr);
        var babyNum = Number(babyNumStr);
        if (adultNum > 0 && childNum >= 0 && babyNum >= 0) {
            var fplace = locationDao.loadByPlaceId(placeId);
            var fproduct = productDao.loadTransferByProductId(productId);

            if (jieSong === common.Consts.ServiceType.JIEJI) {
                var fflight = flightDao.jiejiFlight(flightNo.toUpperCase(), utils.parseDate(bookDate).format("YYYY-MM-DD"));
                join(fplace, fproduct, fflight, function (place, product, fli) {

                    if (!place || !product || !fli || place.length === 0 || product.length === 0 || fli.length === 0 || place[0].id === undefined || product[0].id === undefined || fli[0].flightNo === undefined) {
                        return null;
                    } else {
                        var dbOrder = {
                            order_no: common.Consts.Order.idPrefix + common.Consts.Order.idLevel + utils.uniqueNo(),
                            mobileId: mobileId,
                            ua: useragent,
                            pay_status: common.Consts.Order.dbStatuses.fresh,
                            build_time: new Date(),
                            book_date: bookDate,
                            flight_no: flightNo.toUpperCase(),
                            product_id: productId,
                            place_id: placeId,
                            service_type: jieSong,
                            start_place: fli[0]["airport_name"],
                            end_place: place[0]["place_name"],
                            yc_country: fli[0]["belong_country"],
                            yc_city: fli[0]["belong_city"],
                            yc_time: orderUseCarTime,
                            order_username: orderUsername,
                            order_phone: orderPhone,
                            order_country_code: orderCountryCode,
                            order_email: orderEmail,
                            pickup_card_name: orderPickupCardName || orderUsername,
                            car_level_desc: actionsHelper.getCarLevelDesc(product[0]["car_level"], product[0]["person_count"], product[0]["small_bag_count"]),
                            car_count: actionsHelper.carCount(adultNum, childNum, babyNum, product[0]["person_count"], 0, 0, product[0]["small_bag_count"], 0),
                            adult_count: adultNum,
                            child_count: childNum,
                            baby_count: babyNum,
                            unit_price: product[0]["unit_price"]
                        };
                        dbOrder["total_price"] = dbOrder["car_count"] * dbOrder["unit_price"];
                        if (partialUid) {
                            dbOrder["uid"] = common.Consts.User.idPrefix + common.Consts.Split + partialUid;
                        }
                        return dbOrder;
                    }
                }).then(function (query) {
                    if (!query) {
                        return res.json(common.ErrCode.customFailure.nonProperParams);
                    } else {
                        orderDao.newOrder(query).then(function (rr) {
                            return res.json({
                                "code": 0,
                                "order_no": query.order_no,
                                "start_place": query.start_place,
                                "end_place": query.end_place,
                                "build_time": utils.formatDate(query.build_time),
                                "over_time": moment(query.build_time).add(6, "hours").format("YYYY-MM-DD HH:mm:ss"),
                                "pay_status": query.pay_status,
                                "service_type": query.service_type,
                                "yc_country": query.yc_country,
                                "yc_city": query.yc_city,
                                "yc_time": query.yc_time,
                                "flight_no": query.flight_no,
                                "pickup_card_name": query.pickup_card_name,
                                "car_level_desc": query.car_level_desc,
                                "car_unit_price": query.unit_price,
                                "car_count": query.car_count,
                                "car_total_price": query.total_price,
                                "order_username": query.order_username,
                                "order_phone": query.order_phone,
                                "order_country_code": query.order_country_code,
                                "order_email": query.order_email,
                                "order_phone_abroad": "",
                                "service_tel_abroad": ""
                            });

                        }).catch(function (eee) {

                            console.log("sql error: \n" + eee);
                            return next(eee);

                        });


                    }

                }).catch(function (ee) {

                    console.log("sql error: \n" + ee);
                    return next(ee);

                });

            } else if (jieSong === common.Consts.ServiceType.SONGJI) {
                var fflight = flightDao.songjiFlight(flightNo.toUpperCase(), utils.parseDate(bookDate).format("YYYY-MM-DD"));
                join(fplace, fproduct, fflight, function (place, product, fli) {

                    if (!place || !product || !fli || place.length === 0 || product.length === 0 || fli.length === 0 || place[0].id === undefined || product[0].id === undefined || fli[0].flightNo === undefined) {
                        return null;
                    } else {
                        var dbOrder = {
                            order_no: common.Consts.Order.idPrefix + common.Consts.Order.idLevel + utils.uniqueNo(),
                            mobileId: mobileId,
                            ua: useragent,
                            pay_status: common.Consts.Order.dbStatuses.fresh,
                            build_time: new Date(),
                            book_date: bookDate,
                            flight_no: flightNo.toUpperCase(),
                            product_id: productId,
                            place_id: placeId,
                            service_type: jieSong,
                            start_place: place[0]["place_name"],
                            end_place: fli[0]["airport_name"],
                            yc_country: place[0]["country"],
                            yc_city: place[0]["city"],
                            yc_time: orderUseCarTime,
                            order_username: orderUsername,
                            order_phone: orderPhone,
                            order_country_code: orderCountryCode,
                            order_email: orderEmail,
                            car_level_desc: actionsHelper.getCarLevelDesc(product[0]["car_level"], product[0]["person_count"], product[0]["small_bag_count"]),
                            car_count: actionsHelper.carCount(adultNum, childNum, babyNum, product[0]["person_count"], 0, 0, product[0]["small_bag_count"], 0),
                            adult_count: adultNum,
                            child_count: childNum,
                            baby_count: babyNum,
                            unit_price: product[0]["unit_price"]
                        };
                        dbOrder["total_price"] = dbOrder["car_count"] * dbOrder["unit_price"];
                        if (partialUid) {
                            dbOrder["uid"] = common.Consts.User.idPrefix + common.Consts.Split + partialUid;
                        }
                        return dbOrder;
                    }
                }).then(function (query) {
                    if (!query) {
                        return res.json(common.ErrCode.customFailure.nonProperParams);
                    } else {
                        orderDao.newOrder(query).then(function (rr) {
                            return res.json({
                                "code": 0,
                                "order_no": query.order_no,
                                "start_place": query.start_place,
                                "end_place": query.end_place,
                                "build_time": utils.formatDate(query.build_time),
                                "over_time": moment(query.build_time).add(6, "hours").format("YYYY-MM-DD HH:mm:ss"),
                                "pay_status": query.pay_status,
                                "service_type": query.service_type,
                                "yc_country": query.yc_country,
                                "yc_city": query.yc_city,
                                "yc_time": query.yc_time,
                                "flight_no": query.flight_no,
                                "car_level_desc": query.car_level_desc,
                                "car_unit_price": query.unit_price,
                                "car_count": query.car_count,
                                "car_total_price": query.total_price,
                                "order_username": query.order_username,
                                "order_phone": query.order_phone,
                                "order_country_code": query.order_country_code,
                                "order_email": query.order_email,
                                "order_phone_abroad": "",
                                "service_tel_abroad": ""
                            });

                        }).catch(function (eee) {

                            console.log("sql error: \n" + eee);
                            return next(eee);

                        });

                    }

                }).catch(function (ee) {

                    console.log("sql error: \n" + ee);
                    return next(ee);

                });

            } else {
                return res.json(common.ErrCode.customFailure.nonProperParams);
            }

        } else {
            res.json(common.ErrCode.customFailure.nonProperParams);
        }
    } else {
        res.json(common.ErrCode.customFailure.lackParams);
    }

};

exports.doSendPhoneAbroad = function (req, res, next) {

    var orderNo = req.body["order_no"];
    var orderPhoneAbroad = req.body["order_phone_abroad"];

    if (orderNo && orderPhoneAbroad) {
        orderDao.updateOneOrder({order_phone_abroad: orderPhoneAbroad}, orderNo).then(function (rr) {
            return res.json({
                "code": 0
            });

        }).catch(function (ee) {
            console.log("sql error:\n" + ee);
            return next(ee);
        });

    } else {
        res.json(common.ErrCode.customFailure.lackParams);
    }

};

exports.doLatestStatus = function (req, res, next) {

    var orderNo = req.body["order_no"];
    if (orderNo) {

        orderDao.getPayStatus(orderNo).then(function (query) {
            if (!query || query.length === 0 || query[0].pay_status === undefined) {
                return res.json(common.ErrCode.customFailure.nonProperParams);
            } else {
                var rst = query[0];
                return res.json({
                    "code": 0,
                    "pay_status": common.Consts.Order.dbAppMapping[rst["pay_status"]],
                    "service_tel_abroad": rst["service_tel_abroad"] || ""
                });
            }

        }).catch(function (ee) {
            console.log("sql error: \n" + ee);
            return next(ee);
        });

    } else {
        res.json(common.ErrCode.customFailure.lackParams);
    }

};

exports.doCancelling = function (req, res, next) {

    var orderNoes = req.body["order_no"];
    if (orderNoes) {
        var orderNoArray = orderNoes.split(",");
        orderDao.cancelOrders(orderNoArray).then(function (rr) {
            return res.json({
                "code": 0
            });

        }).catch(function (ee) {
            console.log("sql error: \n" + ee);
            return next(ee);
        });

    } else {
        res.json(common.ErrCode.customFailure.lackParams);
    }

};

exports.doDetails = function (req, res, next) {

    var orderNo = req.body["order_no"];

    if (orderNo) {
        orderDao.loadOne(orderNo).then(function (queries) {

            if (!queries || queries.length === 0 || queries[0].order_no === undefined) {
                return res.json(common.ErrCode.customFailure.nonProperParams);
            } else {
                var query = queries[0];
                return res.json({
                    "code": 0,
                    "order_no": query.order_no,
                    "start_place": query.start_place,
                    "end_place": query.end_place,
                    "build_time": utils.formatDate(query.build_time),
                    "over_time": moment(query.build_time).add(6, "hours").format("YYYY-MM-DD HH:mm:ss"),
                    "pay_status": common.Consts.Order.dbAppMapping[query.pay_status],
                    "service_type": query.service_type,
                    "yc_country": query.yc_country,
                    "yc_city": query.yc_city,
                    "yc_time": query.yc_time,
                    "flight_no": query.flight_no,
                    "car_level_desc": query.car_level_desc,
                    "car_unit_price": query.unit_price,
                    "car_count": query.car_count,
                    "car_total_price": query.total_price,
                    "pickup_card_name": query.pickup_card_name || "",
                    "order_username": query.order_username,
                    "order_phone": query.order_phone,
                    "order_country_code": query.order_country_code,
                    "order_email": query.order_email,
                    "order_phone_abroad": query.order_phone_abroad || "",
                    "service_tel_abroad": query.service_tel_abroad || ""
                });
            }

        }).catch(function (ee) {
            console.log("sql error: \n" + ee);
            return next(ee);
        });

    } else {
        res.json(common.ErrCode.customFailure.lackParams);
    }

};

exports.doList = function (req, res, next) {

    var partialUid = req.body["partialUid"];
    var mobileId = req.headers["idfv"];

    if (mobileId) {
        var fdbOrders = partialUid ? orderDao.loadOnesOfUid(common.Consts.User.idPrefix + common.Consts.Split + partialUid) :
            orderDao.loadOnesOfMobid(mobileId);
        fdbOrders.then(function (queries) {
            var viewOrders = [];
            var query = null;
            for (idx in queries) {
                query = queries[idx];
                viewOrders.push({
                    "order_no": query.order_no,
                    "start_place": query.start_place,
                    "end_place": query.end_place,
                    "build_time": utils.formatDate(query.build_time),
                    "over_time": moment(query.build_time).add(6, "hours").format("YYYY-MM-DD HH:mm:ss"),
                    "pay_status": common.Consts.Order.dbAppMapping[query.pay_status],
                    "service_type": query.service_type,
                    "yc_country": query.yc_country,
                    "yc_city": query.yc_city,
                    "yc_time": query.yc_time,
                    "flight_no": query.flight_no,
                    "car_level_desc": query.car_level_desc,
                    "car_unit_price": query.unit_price,
                    "car_count": query.car_count,
                    "car_total_price": query.total_price,
                    "order_username": query.order_username,
                    "service_tel_abroad": query.service_tel_abroad || ""
                });
            }
            return res.json({
                "code": 0,
                "orders": viewOrders
            });

        }).catch(function (ee) {
            console.log("sql error: \n" + ee);
            return next(ee);
        });
    } else {
        res.json(common.ErrCode.customFailure.lackParams);
    }

};

exports.doPayCallback = function (req, res, next) {

    var charge = req.body;
    if (!charge.id || charge.object != "charge") {
        return res.json(common.ErrCode.customFailure.nonProperParams);
    }
    /*
     @eventback
     {
     type : "charge.succeeded",
     amount : 100,
     succeed : true,
     time_succeed : 1409634192
     }
     */

    var eventObj = charge.eventback || {};
    if (eventObj.type === undefined || eventObj.amount === undefined || eventObj.succeed === undefined || eventObj.time_succeed === undefined) {
        return res.json(common.ErrCode.customFailure.lackParams);
    }

    var currentPayStatus = {};
    if (eventObj.type === "charge.succeeded") {
        currentPayStatus["pay_status"] = common.Consts.Order.dbStatuses.paid;
    } else if (eventObj.type === "refund.succeeded") {
        currentPayStatus["pay_status"] = common.Consts.Order.dbStatuses.refunded;
    } else {

    }

    delete charge.eventback;
    var fPayStatusUpdating = (eventObj.succeed && new Date().getTime() >= eventObj.time_succeed * 1000) ? orderDao.updateOneOrder(currentPayStatus, charge.order_no) : Promise.resolve(1);
    var fChargeLogUpdating = orderDao.updateOneCharge(charge.order_no, charge.id, JSON.stringify(charge));

    join(fPayStatusUpdating, fChargeLogUpdating, function (payStatusUp, chargeLogUp) {
        return 1;
    }).then(function (query) {
        return res.json({
            "code": 0
        });
    }).catch(function (ee) {
        console.log("sql error: \n" + ee);
        return next(ee);
    });

};

exports.doChargeId = function (req, res, next) {

    var orderNo = req.body["order_no"];

    if (orderNo) {

        orderDao.getChargeIdByOrderNo(orderNo).then(function (query) {

            if (!query || query.length === 0 || !query[0].charge_id) {
                return res.json(common.ErrCode.customFailure.nonProperParams);
            } else {
                return res.json({
                    "code": 0,
                    "charge_id": query[0].charge_id
                });
            }

        }).catch(function (ee) {
            return next(ee);
        });

    } else {
        res.json(common.ErrCode.customFailure.lackParams);
    }

};

exports.doConfirmation = function (req, res, next) {

//yongcheshu
    var orderNo = req.body["order_no"];
    var serviceTelAbroad = req.body["service_tel_abroad"];
    var ycProvider = req.body["yc_provider"];
    var unitCostStr = req.body["unit_cost"];
    var providerTranNo = req.body["provider_tran_no"];
    var carCountStr = req.body["car_count"];
    var remark = req.body["remark"];
    var carDesc = req.body["car_desc"];
    var ycDate = req.body["yc_date"];
    var ycCity = req.body["yc_city"];

    if (orderNo && serviceTelAbroad && ycProvider && unitCostStr && providerTranNo && carCountStr && carDesc && ycDate && ycCity) {
        var unitCost = Number(unitCostStr);
        var carCount = Number(carCountStr);
        var ycDateFormat = utils.parseDate(ycDate).format("YYYY-MM-DD");

        if (unitCost > 0 && carCount > 0 && ycDateFormat.indexOf("Invalid") === -1) {
            var confirmation = {
                service_tel_abroad: serviceTelAbroad,
                yc_provider: ycProvider,
                unit_cost: unitCost,
                total_cost: unitCost * carCount,
                prov_tran_no: providerTranNo,
                pay_status: common.Consts.Order.dbStatuses.confirmed,
                remarks: remark || ""
            };
            var forderUpdating = orderDao.updateOneOrder(confirmation, orderNo);
            var fycCountUpdating = ycCountDao.getAndIncrement(carDesc, ycDateFormat, ycCity, carCount);

            join(forderUpdating, fycCountUpdating, function (orderUp, ycCountUp) {
                return 1;
            }).then(function (rr) {
                return res.json({
                    code: 0
                });
            }).catch(function (ee) {
                return next(ee);
            });

        } else {
            res.json(common.ErrCode.customFailure.nonProperParams);
        }
    } else {
        res.json(common.ErrCode.customFailure.lackParams);
    }

};

exports.doBindCharge = function (req, res, next) {

//insert, haoduo
    var charge = req.body;
    if (!charge.id || charge.object != "charge") {
        return res.json(common.ErrCode.customFailure.nonProperParams);
    }

    var bindInfo = {
        charge_id: charge.id,
        pay_channel: charge.channel
    };

    var chargeLogDoing = orderDao.logOneCharge(charge.order_no, charge.id, JSON.stringify(charge));
    var orderBindDoing = orderDao.updateOneOrder(bindInfo, charge.order_no);

    join(chargeLogDoing, orderBindDoing, function (chargeLog, orderBind) {
        return 1;
    }).then(function (rr) {
        return res.json({
            code: 0
        });
    }).catch(function (ee) {
        return next(ee);
    });

};
