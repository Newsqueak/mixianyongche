var common = require("../../common");

exports.loadAll = function () {

    return common.DBObject.queryAsync(
        "select distinct `belong_city`, `belong_city_en`, `belong_country`, `phone_code`, `status` from `airports` order by `status` desc, `belong_country` asc"
    ).spread(
        function (rows, fields) {
            return rows;
        }
    );


};

exports.getIATAbyName = function (airportName) {

    return common.DBObject.queryAsync("select `IATA` from `airports` where `airport_name` = ?", [airportName]).spread(
        function (rows, fields) {
            return rows;
        }
    );

};
