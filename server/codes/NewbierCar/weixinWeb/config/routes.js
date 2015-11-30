/*!
 * Module dependencies.
 */
var mpweixinAction = require('../app/action/mpweixinAction');
var usersAction = require('../app/action/userAction');   //留作参考用
var webAction = require('../app/action/webAction');


// 路径我们按照产品运营那边提的要求定
var webRouter = require('express').Router();
webRouter.get("/query", webAction.queryPage);
webRouter.post("/cars", webAction.carsPage);
webRouter.get("/addresses", webAction.addressesPage);

webRouter.get("/orderFilling", webAction.orderFillingPage);
webRouter.get("/orderList", webAction.orderListPage);
webRouter.get("/orderDetail", webAction.orderDetailsPage);
webRouter.get("/orderCancel", webAction.orderCancel);
webRouter.post("/payment", webAction.paymentPage);
//webRouter.get("/settings", webAction.settingsPage);
webRouter.get("/openCities", webAction.openCitiesPage);
webRouter.get("/login", webAction.loginPage);
webRouter.post("/login", webAction.login);
webRouter.get("/register", webAction.registerPage);
webRouter.post("/registerSendSMS", webAction.registerSendSMS);//验证用户名存在，并发验证短信
webRouter.post("/registerSubmit", webAction.registerSubmit);//提交短信验证码，并注册用户
webRouter.get("/userInfo", webAction.myCenterPage);
webRouter.post("/userinfoupdate", webAction.userinfoUpdate);
webRouter.get("/editPsw", webAction.editPswPage);
webRouter.post("/editPswSubmit", webAction.editPswSubmitPage);
webRouter.get("/usercog", webAction.userCogPage);
webRouter.get("/logout", webAction.logoutPage);
webRouter.get("/losePsw", webAction.losePswPage);
webRouter.post("/lostPsw_phone", webAction.lostPsw_phone);
webRouter.post("/lostPsw_sendsms", webAction.lostPsw_sendsms);
webRouter.post("/lostPsw_verifysms", webAction.lostPsw_verifysms);
webRouter.post("/lostPsw_reset", webAction.lostPsw_reset);

/**
 * Expose routes
 */

module.exports = function (app, errorCode) {

    // weixin routes
    app.get("/mxyc/mpweixin", mpweixinAction.mpweixinService);

    app.use("/mxyc/web", webRouter);

    /**
     * Error handling
     */

    app.use(function (err, req, res, next) {
        // treat as 404
        if (err.message
            && (~err.message.indexOf('not found')
                || (~err.message.indexOf('Cast to ObjectId failed')))) {
            return next();
        }
        console.error(err.stack);
        // error page
        res.render("error", {code: err.code, msg: err.message});
    });

    // assume 404 since no middleware responded
    app.use(function (req, res, next) {
        if (req.method === "HEAD") {
            return res.status(404).end();
        } else {
            return res.render("404");
        }
    });
};
