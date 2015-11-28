//var User = require("../dao/user");
var utils = require("../../lib/utils");
var common = require("../../common");
var config = require("../../config/config");

exports.list = function (req, res, next) {

    var result = {
        "code": 0,
        "page": 1,
        "max_page": 10,
        "activities": [
            {
                "id": 1,
                "title": "滑雪探险",
                "brief": "去一个130公里骑自行车探险。",
                "deadline": "2014-11-31 08:23:00",
                "total_user": 143,
                "is_register": true,
                "image_url": "http://ip:port/a1.jpg"
            },
            {
                "id": 2,
                "title": "炎热的七月",
                "brief": "去一个470公里单车探险。",
                "deadline": "2014-11-31 08:23:00",
                "total_user": 4323,
                "is_register": false,
                "image_url": "http://ip:port/a2.jpg"
            }
        ]
    };

    res.status(200).end(JSON.stringify(result));

};

exports.search = function (req, res, next) {

    var fromType = req.body["fromtype"];
    var fromCode = req.body["fromcode"];
    var toType = req.body["totype"];
    var toCode = req.body["tocode"];
    var useTime = req.body["useTime"];
    var adultNum = req.body["adult_count"];
    var childNum = req.body["child_count"];
    var babyNum = req.body["baby_count"];

    var searchPath = "/products/search/from/{fromtype}/{fromcode}/to/{totype}/{tocode}/travelling/{useTime}/adults/{adultNum}/children/{childNum}/infants/{babyNum}";

    var options = {
        uri: config.htxOptions.baseUrl + searchPath.replace("{fromtype}", fromType).replace("{fromcode}", fromCode).
            replace("{totype}", toType).replace("{tocode}", toCode).replace("{useTime}", useTime).replace("{adultNum}", adultNum).
            replace("{childNum}", childNum).replace("{babyNum}", babyNum),
        headers: config.htxOptions.headers
    };

    common.RemoteAPI.get(options, function (e, r, result) {


        res.status(r.statusCode).end(JSON.stringify({err: e, res: JSON.parse(result)}));


    });

};

exports.roster = function (req, res, next) {

    var activId = req.body["activity_id"];
    if (!activId) return next(new Error("缺少参数"));
    var result = {
        "code": 0,
        "people": [
            {
                "id": "u:duk3IdBFCI4NrzavsO8GqwTl1Fqev",
                "name": "Michael Splitz",
                "total_mile": 36432,
                "ave_speed": 5.32,
                "avatar_url": "http://ip:port/1.jpg"
            },
            {
                "id": "u:d7bfN_qkQn72_EMVN2zV_aCvmGFRH",
                "name": "Chun Leung",
                "total_mile": 43432,
                "ave_speed": 3.32,
                "avatar_url": "http://ip:port/2.jpg"
            }
        ]
    };
    res.status(200).end(JSON.stringify(result));


};