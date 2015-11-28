var common = require("../../common");

var subsql = "(select * from `flight` where `flightNo` = ? and `depTime` like ? limit 0,1) as `f` ";

exports.jiejiFlight = function (flightNo, bookDate) {

    var jiejiSql = "select `f`.*, `a`.`IATA`, `a`.`airport_name`, `a`.`belong_city`, `a`.`belong_country` from " + subsql +
        "join `airports` as `a` on `f`.`arrAirportCode` = `a`.`IATA` or `f`.`arrAirport` = `a`.`airport_name` where `a`.`status` = '1'";

    return common.DBObject.queryAsync(jiejiSql, [flightNo, bookDate + "%"]).spread(
        function (rows, fields) {
            return rows;
        }
    );

};

exports.songjiFlight = function (flightNo, bookDate) {

    var songjiSql = "select `f`.*, `a`.`IATA`, `a`.`airport_name`, `a`.`belong_city`, `a`.`belong_country` from " + subsql +
        "join `airports` as `a` on `f`.`depAirportCode` = `a`.`IATA` or `f`.`depAirport` = `a`.`airport_name` where `a`.`status` = '1'";

    return common.DBObject.queryAsync(songjiSql, [flightNo, bookDate + "%"]).spread(
        function (rows, fields) {
            return rows;
        }
    );

};

exports.newFlight = function (newFlightInfo) {

    return common.DBObject.queryAsync("insert into `flight` set ?", newFlightInfo);

};

