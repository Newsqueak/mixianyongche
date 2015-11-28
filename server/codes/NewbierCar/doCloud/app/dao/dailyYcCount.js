var common = require("../../common");

exports.getAndIncrement = function (carDesc, ycDate, ycCity, deltaCount) {

    return common.DBObject.queryAsync("select `yc_count` from `daily_yc_count` where `car_desc` = ? and `yc_date` = ? and `yc_city` = ?",
        [carDesc, ycDate, ycCity]).spread(function (rows, fields) {

            var originCount = 0;
            if (!rows || rows.length === 0 || rows[0].yc_count === undefined) {

                originCount = 0;
                return common.DBObject.queryAsync("insert into `daily_yc_count` set ?", {
                    car_desc: carDesc,
                    yc_date: ycDate,
                    yc_city: ycCity,
                    yc_count: originCount + deltaCount
                });

            } else {

                originCount = rows[0].yc_count;
                return common.DBObject.queryAsync("update `daily_yc_count` set `yc_count` = ? where `car_desc` = ? and `yc_date` = ? and `yc_city` = ?",
                    [originCount + deltaCount, carDesc, ycDate, ycCity]);

            }


        });

};

exports.loadCountOfCars = function (carDescArray, ycDate, ycCity) {

    var sqlStrArray = [];
    var sqlParams = [];
    for (index in carDescArray) {
        sqlStrArray.push("?");
        sqlParams.push(carDescArray[index]);
    }
    sqlParams.push(ycDate);
    sqlParams.push(ycCity);

    return common.DBObject.queryAsync("select `car_desc`, `yc_count` from `daily_yc_count` where `car_desc` in (" +
        sqlStrArray.join(", ") + ") and `yc_date` = ? and `yc_city` = ?", sqlParams).spread(
        function (rows, fields) {
            if (!rows || rows.length === 0 || rows[0].yc_count === undefined) {
                var rstObj = {};
                for (idx in carDescArray) {
                    rstObj[carDescArray[idx]] = 0;
                }
                return rstObj;

            } else {
                var rstObj = {};
                for (idx in rows) {
                    rstObj[rows[idx].car_desc] = rows[idx].yc_count;
                }
                for (idxx in carDescArray) {
                    if (rstObj[carDescArray[idxx]] === undefined) {
                        rstObj[carDescArray[idxx]] = 0;
                    }
                }
                return rstObj;

            }

        }
    );

};