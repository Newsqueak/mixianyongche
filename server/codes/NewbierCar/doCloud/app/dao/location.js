var common = require("../../common");
var subsql = "(select `fromRegion`, `toRegion` from `transfer_products` where `{airportCode}` = ?) as `p` ";

exports.jiejiableResorts = function (arrAirportCode) {

    return common.DBObject.queryAsync("select distinct `l`.`id`, `l`.`place_name`, `l`.`place_type`, `l`.`city`, `l`.`transliteration` from" + subsql.replace("{airportCode}", "fromRegion") +
        "join `location` as `l` on `p`.`toRegion` = `l`.`region`", [arrAirportCode]).spread(
        function (rows, fields) {
            return rows;
        }
    );

};

exports.songjiableResorts = function (depAirportCode) {

    return common.DBObject.queryAsync("select distinct `l`.`id`, `l`.`place_name`, `l`.`place_type`, `l`.`city`, `l`.`transliteration` from" + subsql.replace("{airportCode}", "toRegion") +
        "join `location` as `l` on `p`.`fromRegion` = `l`.`region`", [depAirportCode]).spread(
        function (rows, fields) {
            return rows;
        }
    );

};

exports.loadByPlaceId = function (placeId) {

    return common.DBObject.queryAsync("select * from `location` where `id` = ?", [placeId]).spread(
        function (rows, fields) {
            return rows;
        }
    );

};
