var config = require("../../config/config");
var utils = require("../../lib/utils");
var common = require("../../common");
var pingpp = require("pingpp")(config.pingppOptions.apiKey);

var serviceTypes = {
    "0": "接机服务",
    "1": "送机服务"
};

exports.go_to_pay = function (req, res, next) {

    var orderNo = req.body["order_no"];
    var amount = req.body["amount"];
    var channel = req.body["channel"];
    var startPlace = req.body["start_place"];
    var endPlace = req.body["end_place"];
    var payStatus = req.body["pay_status"];
    var serviceType = req.body["service_type"];
    var ycTime = req.body["yc_time"];
    var flightNo = (req.body["flight_no"] || "").toUpperCase();
    var pickupCardName = req.body["pickup_card_name"];
    var carLevelDesc = req.body["car_level_desc"];
    var carCount = req.body["car_count"];
    var productId = req.body["product_id"];
    var orderUsername = req.body["order_username"];
    var orderPhone = req.body["order_phone"];
    var orderCountryCode = req.body["order_country_code"];
    var orderEmail = req.body["order_email"];
    var mobileId = req.headers["idfv"];
    var useragent = req.headers["user-agent"];

    var amountNum = Number(amount) * 100;

    if (payStatus != "0") {
        return res.json(common.ErrCode.customFailure.nonProperParams);
    }

    if (!orderNo) {
        return res.json(common.ErrCode.customFailure.lackOrderNo);
    }

    if (amountNum && channel && startPlace && endPlace && serviceType && ycTime && flightNo && carLevelDesc && carCount && productId && orderUsername
        && orderPhone && orderCountryCode && orderEmail && mobileId && useragent) {

        var extraObj = {};
        switch (channel) {
            case common.Consts.HasExtraChannels.wx_pub:
                extraObj["open_id"] = mobileId;
                break;
            default:
                break;
        }

        var details = serviceTypes[serviceType] + "," + startPlace + "-" + endPlace + "," + flightNo + "," + ycTime + "用车" + carCount + "辆";
        pingpp.charges.create({
            subject: carLevelDesc,
            body: details,
            amount: amountNum,
            order_no: orderNo,
            channel: channel,
            currency: "cny",
            client_ip: "182.92.195.92",
            app: {id: config.pingppOptions.mxycAppId},
            extra: extraObj,
            metadata: {
                fliNo: flightNo,
                pickupCard: pickupCardName || "",
                prodId: productId,
                username: orderUsername,
                phone: orderCountryCode + ")" + orderPhone,
                email: orderEmail,
                mobId: mobileId
            }
        }, function (err, charge) {

            if (err) {
                if (err.rawType === "channel_error" && err.code != null) {

                    var suchError = common.ErrCode.customFailure.payRejection;
                    suchError.why = err.message;
                    return res.json(suchError);

                } else {
                    return res.json(common.ErrCode.customFailure.payApiFailed);
                }
            }

            var options = {
                uri: config.selfApiURL + "/1/order/bind_charge.do",
                headers: {
                    "idfv": mobileId,
                    "User-Agent": useragent
                },
                body: charge,
                json: true
            };
            common.RemoteAPI.post(options, function (e, r, result) {
                if (e) {
                    return next(e);
                }

                return res.json({
                    "code": 0,
                    "charge": charge
                });

            });

        });

    } else {
        res.json(common.ErrCode.customFailure.lackParams);
    }
};

exports.pay_callback = function (req, res, next) {

    var eventObj = req.body;
    if (!eventObj.type) {
        return res.status(400).end("缺type字段");
    }

    var eventbackObj = {
        type: "",
        amount: 0,
        succeed: false,
        time_succeed: 0
    };

    var selfApiOptions = {
        uri: config.selfApiURL + "/1/order/pay_callback.do",
        json: true
    };

    switch (eventObj.type) {
        case "charge.succeeded":

            var charge = eventObj.data.object;
            eventbackObj.type = "charge.succeeded";
            eventbackObj.amount = charge.amount;
            eventbackObj.succeed = charge.paid;
            eventbackObj.time_succeed = charge.time_paid;
            charge["eventback"] = eventbackObj;
            selfApiOptions.body = charge;

            common.RemoteAPI.post(selfApiOptions, function (e, r, result) {
                if (e) {
                    return res.status(500).end("网络问题");
                }

                if (result.code != 0) {
                    return res.status(500).end("未知错误");
                } else {
                    return res.status(200).end("");
                }
            });

            break;
        case "refund.succeeded":

            var refund = eventObj.data.object;
            eventbackObj.type = "refund.succeeded";
            eventbackObj.amount = refund.amount;
            eventbackObj.succeed = refund.succeed;
            eventbackObj.time_succeed = refund.time_succeed;
            pingpp.charges.retrieve(refund.charge, function (err, charge) {

                if (err) {
                    return res.status(500).end("ping++挂了");
                }

                charge["eventback"] = eventbackObj;
                selfApiOptions.body = charge;

                common.RemoteAPI.post(selfApiOptions, function (e, r, result) {
                    if (e) {
                        return res.status(500).end("网络问题");
                    }

                    if (result.code != 0) {
                        return res.status(500).end("未知错误");
                    } else {
                        return res.status(200).end("");
                    }
                });

            });

            break;
        default:
            return res.status(400).end("type值不合法");
            break;
    }
};

exports.go_to_refund = function (req, res, next) {

    var orderNo = req.body["order_no"];
    var desc = req.body["description"];
    var amountStr = req.body["amount"];

    if (orderNo && amountStr) {
        var selfApiOptions = {
            uri: config.selfApiURL + "/1/order/charge_id.do",
            form: {
                order_no: orderNo
            }
        };

        common.RemoteAPI.post(selfApiOptions, function (e, r, result) {
            if (e) {
                return next(e);
            }

            var rstObj = JSON.parse(result);
            if (rstObj.code != 0) {
                var newError = new Error(rstObj.msg);
                return next(newError);
            } else {

                var refundOptions = {
                    amount: Number(amountStr) * 100,
                    description: desc || ""
                };

                pingpp.charges.createRefund(rstObj.charge_id, refundOptions, function (err, refund) {

                    if (err) {
                        if (err.rawType === "api_error") {
                            return res.json(common.ErrCode.customFailure.refundApiFailed);
                        } else {
                            return next(new Error(err.message));
                        }
                    }

                    return res.json({
                        code: 0,
                        refund: refund
                    });

                });
            }

        });

    } else {
        res.json(common.ErrCode.customFailure.lackParams);
    }

};
