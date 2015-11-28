var utils = require("../../lib/utils");
var common = require("../../common");
var airportsDao = require("../dao/airports");

exports.getOpenedCities = function (req, res, next) {

    airportsDao.loadAll().then(function (query) {

        var cities = {};
        var record = {};
        for (index in query) {
            record = query[index];

            if (cities[record["belong_country"]]) {

                cities[record["belong_country"]].cities.push({
                    "CITY_CN_NAME": record["belong_city"],                //城市中文名
                    "CITY_EN_NAME": record["belong_city_en"] || "",            //城市英文名
                    "online_status": record["status"] || "0"                   //是否上线，1是已经上线， 0是即将上线

                });

            } else {

                cities[record["belong_country"]] = {
                    "code": record["phone_code"] || "",
                    "cities": [
                        {
                            "CITY_CN_NAME": record["belong_city"],
                            "CITY_EN_NAME": record["belong_city_en"] || "",
                            "online_status": record["status"] || "0"
                        }
                    ]
                };

            }

        }

        delete cities["中国"];

        var itsCountries = Object.keys(cities);
        cities["country_count"] = itsCountries.length;
        cities["countries"] = itsCountries;
        res.json(cities);

    }).catch(function (ee) {

        console.log("sql error: \n" + ee);
        return next(ee);

    });

};