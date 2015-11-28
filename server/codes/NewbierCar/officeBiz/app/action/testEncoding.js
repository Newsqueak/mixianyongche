exports.testEncoding = function (req, res, next) {

    var phone = req.body["phone"];

    console.log("phone:   \n" + phone);

    return res.status(200).end(phone);

};

exports.suchPage = function (req, res, next) {

    return res.render("suchPage");

};
