var common = require("../../common");

exports.loadTransferByProductId = function (productId) {

    var sqlStr = "select `p`.`id`, `p`.`airportCity`, `p`.`unit_price`, `p`.`currency`, `p`.`travel_distance`, `p`.`take_time`, `p`.`dailyCapacity`, " +
        "`p`.`yc_hours_ahead`, `p`.`person_count`, `p`.`small_bag_count`, `p`.`small_bag_size`, `c`.`car_desc`, `c`.`car_level`, `c`.`pic_url` " +
        "from `transfer_products` as `p` join `car` as `c` on `p`.`car_id` = `c`.`id` where `p`.`id` = ?";

    return common.DBObject.queryAsync(sqlStr, [productId]).spread(
        function (rows, fields) {
            return rows;
        }
    );

};

exports.displayTransferProducts = function (airportCity, serviceType, fromRegion, toRegion, flightTime) {

    var sqlStr = "select `p`.`id`, `p`.`airportCity`, `p`.`unit_price`, `p`.`currency`, `p`.`travel_distance`, `p`.`take_time`, `p`.`dailyCapacity`, " +
        "`p`.`yc_hours_ahead`, `p`.`person_count`, `p`.`small_bag_count`, `p`.`small_bag_size`, `c`.`car_desc`, `c`.`car_level`, `c`.`pic_url` " +
        "from (" +
        "(select * from `transfer_products` where `airportCity` = ? and `service_type` = ? and `fromRegion` = ? and `toRegion` = ? and ? >= `periodBegin` and ? < `periodEnd`) " +
        "union " +
        "(select * from `transfer_products` where `airportCity` = ? and `service_type` = ? and `fromRegion` = ? and `toRegion` = ? and ? >= `periodBegin` and ? < `periodEnd`)" +
        ") as `p` join `car` as `c` on `p`.`car_id` = `c`.`id`";

    return common.DBObject.queryAsync(sqlStr,
        [airportCity, serviceType, fromRegion, toRegion, flightTime, flightTime, airportCity, serviceType, fromRegion, toRegion, 24.0 + flightTime, 24.0 + flightTime]
    ).spread(
        function (rows, fields) {
            return rows;
        }
    );


};
