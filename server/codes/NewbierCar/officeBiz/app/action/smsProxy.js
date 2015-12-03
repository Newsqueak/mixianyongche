var request = require("request");

exports.sendSMS = function (req, res, next) {

    var phone = req.body["phone"];
    var msg = req.body["msg"];

    var options = {
        uri: "http://payback.laobingke.com/1/sms/send",
        form: {
            phone: phone,
            country_code: "86",
            msg: msg
        }
    };

    request.post(options, function (e, r, result) {
        if (e) {
            return res.json({
                code: 1
            });
        } else {
            return res.json(JSON.parse(result));
        }
    });
};

exports.sendSMSPage = function (req, res, next) {

    return res.render("sendSMS");

};
