var utils = require("../../lib/utils");
var common = require("../../common");

exports.doFlight_And_Places = function (req, res, next) {

//    book_date = "2015-02-11"
//    flight_no = "HU7995"
//    JIEJI_SONGJI = "0"   /   "1"       //"0"是指接机，"1"是指送机，客户端必须指定这个参数

    var bookDate = req.body["book_date"];
    var flightNo = req.body["flight_no"];
    var jieSong = req.body["JIEJI_SONGJI"];

    if (bookDate && flightNo && jieSong) {
        var rst = {
            "code": 0,
            "airline": {
                "flight_no": "HU7995",                                //航班号
                "dep_airport": "北京首都机场",                   //起飞机场
                "dep_cityname": "北京",                             //出发地的城市名
                "dep_citycode": "BJS",                               //出发地的城市编号
                "dep_time": "2015-02-16 21:00:00",            //起飞时间
                "arr_airport": "曼谷素万那普国际机场",      //降落机场
                "arr_cityname": "曼谷",                             //降落地的城市名
                "arr_citycode": "BKK",                               //降落地的城市编号
                "arr_time": "2015-02-16 23:55:00",             //降落时间
                "airline_company": "中国国航"                   //航班所属航空公司
            },
            "places": {                    //按 A\B\C 的首字母进行了归类
                "A": [
                    {
                        "place_id": "amali123hj",
                        "place_name": "阿玛丽曼谷廊曼酒店"
                    },
                    {
                        "place_id": "anpaw34j6",
                        "place_name": "安帕瓦水上市场"
                    }
                ],
                "B": [
                    {
                        "place_id": "boeidkjf3s4u",
                        "place_name": "铂尔曼曼谷大酒店"
                    },
                    {
                        "place_id": "boermler57w",
                        "place_name": "铂尔曼人妖乐园"
                    }
                ],
                "Z": [
                    {
                        "place_id": "zhgwmk178xj",
                        "place_name": "郑王庙"
                    }
                ]
            }

        };
        res.status(200).end(JSON.stringify(rst));


    } else {

        res.status(200).end(JSON.stringify({"code": 1, "msg": "缺少必要接口参数"}));

    }


};