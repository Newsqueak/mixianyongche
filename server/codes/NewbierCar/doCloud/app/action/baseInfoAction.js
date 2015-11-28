var utils = require("../../lib/utils");
var common = require("../../common");
var config = require("../../config/config");
var locationDao = require("../dao/location");
var flightDao = require("../dao/flight");
var actionsHelper = require("./actionsHelper");
var moment = require("moment");

exports.doFlight_And_Places = function (req, res, next) {

    var bookDate = req.body["book_date"] || "";
    var flightNo = req.body["flight_no"];
    var jieSong = req.body["JIEJI_SONGJI"];      //"0"是指接机，"1"是指送机，客户端必须指定这个参数

    var bookDateObj = utils.parseDate(bookDate.trim() + " 22:00:00");//必须细化一天中的有效时段范围

    if (bookDate && flightNo && jieSong) {

        if (!common.Consts.REGEXP.isFlightNo.test(flightNo)) {
            return res.json(common.ErrCode.customFailure.flightNoNotFound);
        }

        if (~(bookDateObj.format("YYYY/M/D").indexOf("Invalid"))) {
            return res.json(common.ErrCode.customFailure.nonProperParams);
        }

        if (bookDateObj.diff(moment(), 'days', true) < 3) {
            return res.json(common.ErrCode.customFailure.bookDateIllegal);
        } else {
            var bookDateStr = bookDateObj.format("YYYY-MM-DD");
            flightNo = flightNo.toUpperCase();
            common.RemoteAPI.getAsync(config.externalApiURL + "/1/flight?" + "flightNo=" + flightNo + "&bookDate=" + bookDateStr).then(function (query) {

                var rst = JSON.parse(query[1]);
                if (rst.code != 0) {
                    return res.json(rst);
                } else {
                    var flightObj = rst.flights.pop();
                    flightDao.newFlight(flightObj).then(function (rr) {
                        var airlineRst = {
                            "flight_no": flightObj["flightNo"],
                            "dep_airport": flightObj["depAirport"],
                            "dep_cityname": flightObj["depCityName"],
                            "dep_airportcode": flightObj["depAirportCode"],
                            "dep_time": flightObj["depTime"],
                            "arr_airport": flightObj["arrAirport"],
                            "arr_cityname": flightObj["arrCityName"],
                            "arr_airportcode": flightObj["arrAirportCode"],
                            "arr_time": flightObj["arrTime"],
                            "airline_company": flightObj["airlineCompany"]
                        };
                        if (jieSong === common.Consts.ServiceType.JIEJI) {

                            locationDao.jiejiableResorts(flightObj.arrAirportCode).then(function (locations) {

                                if (!locations || locations.length === 0 || locations[0].id === undefined) {
                                    return res.json({
                                        "code": 0,
                                        "airline": airlineRst,
                                        "orderedLetters": ["#"],
                                        "places": {
                                            "#": [
                                                {
                                                    "place_id": "0",
                                                    "place_name": common.ErrCode.customFailure.cityNotInService.msg
                                                }
                                            ]
                                        }
                                    });
                                } else {

                                    var placesRst = {};
                                    var onePlace = null;
                                    var initialLetter = null;
                                    for (index in locations) {
                                        onePlace = locations[index];
                                        initialLetter = onePlace["transliteration"][0].toUpperCase();

                                        if (placesRst[initialLetter]) {
                                            placesRst[initialLetter].push({
                                                place_id: onePlace["id"],
                                                place_name: onePlace["place_name"]
                                            });
                                        } else {
                                            placesRst[initialLetter] = [
                                                {
                                                    place_id: onePlace["id"],
                                                    place_name: onePlace["place_name"]
                                                }
                                            ];
                                        }
                                    }
                                    var sortedKeys = Object.keys(placesRst).sort();

                                    return res.json({
                                        code: 0,
                                        airline: airlineRst,
                                        orderedLetters: sortedKeys,
                                        places: placesRst
                                    });

                                }

                            }).catch(function (eee) {
                                console.log("sql error: \n" + eee);
                                return next(eee);
                            });

                        } else if (jieSong === common.Consts.ServiceType.SONGJI) {

                            locationDao.songjiableResorts(flightObj.depAirportCode).then(function (locations) {

                                if (!locations || locations.length === 0 || locations[0].id === undefined) {
                                    return res.json({
                                        "code": 0,
                                        "airline": airlineRst,
                                        "orderedLetters": ["#"],
                                        "places": {
                                            "#": [
                                                {
                                                    "place_id": "0",
                                                    "place_name": common.ErrCode.customFailure.cityNotInService.msg
                                                }
                                            ]
                                        }
                                    });
                                } else {

                                    var placesRst = {};
                                    var onePlace = null;
                                    var initialLetter = null;
                                    for (index in locations) {
                                        onePlace = locations[index];
                                        initialLetter = onePlace["transliteration"][0].toUpperCase();

                                        if (placesRst[initialLetter]) {
                                            placesRst[initialLetter].push({
                                                place_id: onePlace["id"],
                                                place_name: onePlace["place_name"]
                                            });
                                        } else {
                                            placesRst[initialLetter] = [
                                                {
                                                    place_id: onePlace["id"],
                                                    place_name: onePlace["place_name"]
                                                }
                                            ];
                                        }
                                    }
                                    var sortedKeys = Object.keys(placesRst).sort();

                                    return res.json({
                                        code: 0,
                                        airline: airlineRst,
                                        orderedLetters: sortedKeys,
                                        places: placesRst
                                    });

                                }

                            }).catch(function (eee) {
                                console.log("sql error: \n" + eee);
                                return next(eee);
                            });

                        } else {
                            //包车
                            return res.json(common.ErrCode.customFailure.nonProperParams);
                        }


                    }).catch(function (errr) {
                        console.log(errr);
                        return next(errr);
                    });
                }

            }).catch(function (err) {
                console.log(err);
                return next(err);
            });

        }

    } else {

        res.json(common.ErrCode.customFailure.lackParams);

    }


};
