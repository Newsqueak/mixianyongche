var utils = require("../../lib/utils");
var common = require("../../common");
var moment = require("moment");
var locationDao = require("../dao/location");
var airportsDao = require("../dao/airports");
var flightDao = require("../dao/flight");
var productDao = require("../dao/product");
var dailyYcCountDao = require("../dao/dailyYcCount");
var actionsHelper = require("./actionsHelper");
var join = require("bluebird").join;


exports.doBooking = function (req, res, next) {
//    book_date = "2015-02-11"
//    flight_no = "HU7995"
//    JIEJI_SONGJI = "0"   /   "1"       //"0"是指接机，"1"是指送机，客户端必须指定这个参数
//    place_id = "zhgwmk178xj"       //这个是郑王庙，从上文的组合接口中获取，是用户选择决定
//    adult_count = 3                      //3是整数，这三个人数都是整数，不是字符串
//    child_count =  2
//    baby_count =  1

    var jieSong = req.body["JIEJI_SONGJI"];
    var bookDate = req.body["book_date"];
    var flightNo = req.body["flight_no"];
    var placeId = req.body["place_id"];
    var adultNum = Number(req.body["adult_count"]);
    var childNum = Number(req.body["child_count"]);
    var babyNum = Number(req.body["baby_count"]);

    if (jieSong && bookDate && flightNo && placeId && adultNum && ~childNum && ~babyNum) {

        var fplace = locationDao.loadByPlaceId(placeId);

        if (jieSong === common.Consts.ServiceType.JIEJI) {
            var fflight = flightDao.jiejiFlight(flightNo.toUpperCase(), utils.parseDate(bookDate).format("YYYY-MM-DD"));
            join(fflight, fplace, function (fli, place) {

                if (!fli || fli.length === 0 || fli[0].flightNo === undefined || !place || place.length === 0 || place[0].id === undefined) {
                    return null;
                } else {
                    return {
                        airportCity: fli[0]["belong_city"],
                        iata: fli[0]["IATA"],
                        arrTime: fli[0]["arrTime"],
                        hotelRegion: place[0]["region"]
                    };
                }

            }).then(function (query) {

                if (!query) {
                    return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.nonProperParams));
                } else {
                    var useTime = utils.parseDate(query.arrTime).add(0.5, 'hours');
                    var fromTime = utils.parseDate(useTime.format("YYYY-MM-DD 00:00:00"));
                    productDao.displayTransferProducts(query.airportCity, jieSong, query.iata, query.hotelRegion, useTime.diff(fromTime, "hours", true)).then(function (dbProducts) {

                        if (!dbProducts || dbProducts.length === 0 || dbProducts[0].id === undefined) {
                            return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.noCarAvailable));
                        } else {
                            var carDescArr = [];
                            for (idxx in dbProducts) {
                                carDescArr.push(dbProducts[idxx].car_desc);
                            }
                            dailyYcCountDao.loadCountOfCars(carDescArr, useTime.format("YYYY-MM-DD"), query.airportCity).then(function (ycQuery) {

                                var carNumCriteria = {
                                    "adultNum": adultNum,
                                    "childNum": childNum,
                                    "babyNum": babyNum,
                                    "userSmallBagNum": 0,
                                    "userBigBagNum": 0
                                };
                                var result = actionsHelper.filterValidCarsOrdered(dbProducts, ycQuery, carNumCriteria);
                                if (result["car_level_count"] == 0) {
                                    return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.noCarAvailable));
                                } else {
                                    return res.status(200).end(JSON.stringify(result));
                                }

                            }).catch(function (errr) {

                                console.log("sql error: \n" + errr);
                                return next(errr);

                            });
                        }

                    }).catch(function (eeee) {

                        console.log("sql error: \n" + eeee);
                        return next(eeee);

                    });

                }


            }).catch(function (ee) {

                console.log("sql error: \n" + ee);
                return next(ee);

            });

        } else if (jieSong === common.Consts.ServiceType.SONGJI) {
            var fflight = flightDao.songjiFlight(flightNo.toUpperCase(), utils.parseDate(bookDate).format("YYYY-MM-DD"));
            join(fflight, fplace, function (fli, place) {

                if (!fli || fli.length === 0 || fli[0].flightNo === undefined || !place || place.length === 0 || place[0].id === undefined) {
                    return null;
                } else {
                    return {
                        airportCity: fli[0]["belong_city"],
                        iata: fli[0]["IATA"],
                        depTime: fli[0]["depTime"],
                        ycCity: place[0]["city"],
                        hotelRegion: place[0]["region"]
                    };
                }

            }).then(function (query) {

                if (!query) {
                    return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.nonProperParams));
                } else {
                    var useTime = utils.parseDate(query.depTime).subtract(3, 'hours');
                    var fromTime = utils.parseDate(useTime.format("YYYY-MM-DD 00:00:00"));
                    productDao.displayTransferProducts(query.airportCity, jieSong, query.hotelRegion, query.iata, useTime.diff(fromTime, "hours", true)).then(function (dbProducts) {

                        if (!dbProducts || dbProducts.length === 0 || dbProducts[0].id === undefined) {
                            return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.noCarAvailable));
                        } else {
                            var carDescArr = [];
                            for (idxx in dbProducts) {
                                carDescArr.push(dbProducts[idxx].car_desc);
                            }
                            dailyYcCountDao.loadCountOfCars(carDescArr, useTime.format("YYYY-MM-DD"), query.ycCity).then(function (ycQuery) {

                                var carNumCriteria = {
                                    "adultNum": adultNum,
                                    "childNum": childNum,
                                    "babyNum": babyNum,
                                    "userSmallBagNum": 0,
                                    "userBigBagNum": 0
                                };
                                var result = actionsHelper.filterValidCarsOrdered(dbProducts, ycQuery, carNumCriteria);
                                if (result["car_level_count"] == 0) {
                                    return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.noCarAvailable));
                                } else {
                                    return res.status(200).end(JSON.stringify(result));
                                }

                            }).catch(function (errr) {

                                console.log("sql error: \n" + errr);
                                return next(errr);

                            });
                        }

                    }).catch(function (eeee) {

                        console.log("sql error: \n" + eeee);
                        return next(eeee);

                    });

                }


            }).catch(function (ee) {

                console.log("sql error: \n" + ee);
                return next(ee);

            });

        } else {
            return res.status(200).end(JSON.stringify(common.ErrCode.customFailure.nonProperParams));
        }

    } else {
        res.status(200).end(JSON.stringify(common.ErrCode.customFailure.lackParams));
    }


};