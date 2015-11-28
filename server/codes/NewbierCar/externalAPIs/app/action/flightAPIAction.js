var utils = require("../../lib/utils");
var common = require("../../common");
var crypto = require("crypto");

exports.getFlight = function (req, res, next) {

    var flightNo = req.query["flightNo"] || "";
    var bookDate = req.query["bookDate"] || "";

    flightNo = flightNo.trim().toUpperCase();
    var paramObj = {
        action: "getflightbycode",
        companycode: "GX1056",
        key: "70fcd51d9dea4b688e2346b799e21e25",
        sign: "",
        flightcode: flightNo,
        sdate: bookDate
    };

    paramObj.sign = crypto.createHash("md5").update(paramObj.action + paramObj.companycode + paramObj.key + paramObj.flightcode + paramObj.sdate).digest("hex");

    var postData = {
        param: JSON.stringify(paramObj)
    };

    var options = {
        url: "http://api.trip258.com/tcinterticketapi.ashx",
        form: postData
    };

    common.RemoteAPI.post(options, function (e, r, result) {
        if (e) {
            console.log(e);
            return res.json(common.ErrCode.customFailure.flightNoNotFound);
        } else {
            var fli = JSON.parse(result);
            if (fli.successcode != "T") {
                console.log(fli.info, fli.errorcode);
                return res.json(common.ErrCode.customFailure.flightNoNotFound);
            } else {
                var segments = fli.result;
                var flightList = [];
                var oneItem = null;
                for (idx in segments) {
                    oneItem = segments[idx];
                    flightList.push({
                        airline: oneItem.airline,
                        flightNo: flightNo,
                        depAirportCode: oneItem.startairportcode,
                        depCityName: oneItem.startcity,
                        depAirport: oneItem.startairport,
                        arrAirportCode: oneItem.endairportcode,
                        arrCityName: oneItem.endcity,
                        arrAirport: oneItem.endairport,
                        depTime: oneItem.starttime,
                        arrTime: oneItem.endtime,
                        flightTime: oneItem.costtime,
                        planeModel: oneItem.airplanetype,
                        airlineCompany: oneItem.aircompanyname,
                        savetime: utils.formatDate(new Date())
                    });
                }
                return res.json({
                    code: 0,
                    flights: flightList
                });
            }
        }
    });

};
