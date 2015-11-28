var utils = require("../../lib/utils");
var common = require("../../common");

exports.carLevel = {   // 这个对象字段一定要有一定要有顺序
    jj5: "经济5座",
    jj7: "经济7座",
    jj9: "经济9座",
    jj10: "经济10座",
    jj13: "经济13座",
    jj15: "经济15座",
    sw5: "商务5座",
    sw7: "商务7座",
    sw9: "商务9座",
    sw12: "商务12座",
    sw16: "商务16座",
    hh5: "豪华5座",
    hh7: "豪华7座",
    hh9: "豪华9座",
    hh13: "豪华13座",
    she5: "奢华5座"
};

exports.carLevelOrderKeys = [
    "jj5",
    "jj7",
    "jj9",
    "jj10",
    "jj13",
    "jj15",
    "sw5",
    "sw7",
    "sw9",
    "sw12",
    "sw16",
    "hh5",
    "hh7",
    "hh9",
    "hh13",
    "she5"
];

exports.carCount = function (adultNum, childNum, babyNum, carPersonCapacity, userSmallBagNum, userBigBagNum, carSmallBagCapacity, carBigBagCapacity) {


    var carTotalNum = 0;
    var totalPersonNum = adultNum + childNum + babyNum;
    if (totalPersonNum % carPersonCapacity === 0) {
        carTotalNum = totalPersonNum / carPersonCapacity;
    } else {
        carTotalNum = parseInt(totalPersonNum / carPersonCapacity) + 1;
    }

    // to deal with bags number TODO

    return carTotalNum;
};

exports.getCarLevelDesc = function (carLevelSym, carPersonCapacity, carSmallBagCapacity) {

    return common.Consts.CarLevelDesc.replace(/xxd/i, exports.carLevel[carLevelSym]).
        replace(/mm/i, carPersonCapacity).replace(/nn/i, carSmallBagCapacity);
};

exports.orderTotalPrice = function (carUnitPrice, carTotalNum) {

    if (carTotalNum === 1) {
        return carUnitPrice;
    } else {
        return 1.00 * carUnitPrice * carTotalNum;
    }

};

exports.carProductViewer = function (rawProductCar, carCountCriteria) {

    var carNum = exports.carCount(carCountCriteria["adultNum"], carCountCriteria["childNum"], carCountCriteria["babyNum"],
        Number(rawProductCar["person_count"]), carCountCriteria["userSmallBagNum"],
        carCountCriteria["userBigBagNum"],
        Number(rawProductCar["small_bag_count"]),
        Number(rawProductCar["big_bag_count"]));

    var totalPrice = exports.orderTotalPrice(Number(rawProductCar["unit_price"]), carNum);

    return {
        "product_id": rawProductCar["id"],
        "pic_url": rawProductCar["pic_url"],
        "car_desc": rawProductCar["car_desc"],
        "travel_distance": (rawProductCar["travel_distance"] || "20") + "公里",
        "take_time": (rawProductCar["take_time"] || "20") + "分钟",
        "person_count": rawProductCar["person_count"] + "",
        "baggage_count": rawProductCar["small_bag_count"] + "",
        "baggage_size_claim": rawProductCar["small_bag_size"],
        "car_count": carNum + "",
        "unit_price": rawProductCar["unit_price"] + "",
        "total_price": totalPrice + ""
    }

};

exports.filterValidCarsOrdered = function (dbProductCars, suchDayYcCount, carNumCriteria) {

    /**
     * @dbProductCars: [{}, {}, {}] raw db product objects
     * @suchDayYcCount: {$car_desc: $yc_count}
     * @carNumCriteria: {adultNum:1, childNum:2, babyNum:3, userSmallBagNum:2, userBigBagNum:3}
     */

    var viewProductCars = {};
    var finalViewCars = {};
    var validProductNum = 0;
    var dbItem = null;
    var viewItem = null;
    for (idx in dbProductCars) {
        dbItem = dbProductCars[idx];
        viewItem = exports.carProductViewer(dbItem, carNumCriteria);
        if (dbItem["dailyCapacity"] >= suchDayYcCount[dbItem["car_desc"]] + Number(viewItem["car_count"])) {
            var carLevelSym = dbItem["car_level"];
            if (viewProductCars[carLevelSym]) {
                viewProductCars[carLevelSym].push(viewItem);
            } else {
                viewProductCars[carLevelSym] = [viewItem];
            }
            validProductNum++;

        }
    }

    var tmpKey = null;
    for (index in exports.carLevelOrderKeys) {
        tmpKey = exports.carLevelOrderKeys[index];
        if (viewProductCars[tmpKey]) {
            finalViewCars[tmpKey] = viewProductCars[tmpKey];
        }
    }

    return {
        "code": 0,
        "car_level_count": validProductNum,
        "car_levels": Object.keys(finalViewCars),
        "cars": finalViewCars
    };

};

exports.respond = function (httpResponse, resultObj) {

    return httpResponse.status(200).end(JSON.stringify(resultObj));

};

exports.pretendValid = function (bookDateObj) {

    return bookDateObj.year(2015).month(7);

};

exports.backToReal = function (realDate, returnTime) {

    var realDateOrigin = utils.parseDate(realDate + " 00:00:00");
    return realDateOrigin.add(utils.parseDate(returnTime).diff(exports.pretendValid(realDateOrigin.clone()), "minutes", true), "minutes");

};
