/*!
 * Module dependencies.
 */
var orderAPIAction = require('../app/action/orderAPIAction');
var authCodeAPIAction = require("../app/action/authCodeAPIAction");
var flightAPIAction = require("../app/action/flightAPIAction");
var smsAPIAction = require("../app/action/smsAPIAction");

// the custom middleware of routes
var orderAPIRouter = require('express').Router();
orderAPIRouter.post("/go_to_pay", orderAPIAction.go_to_pay);
orderAPIRouter.post("/pay_callback", orderAPIAction.pay_callback);
orderAPIRouter.post("/go_to_refund", orderAPIAction.go_to_refund);

var authCodeAPIRouter = require('express').Router();
authCodeAPIRouter.post("/emitting", authCodeAPIAction.emitting);
authCodeAPIRouter.post("/verifying", authCodeAPIAction.verifying);

var smsAPIRouter = require('express').Router();
smsAPIRouter.post("/send", smsAPIAction.sendMsg);

/**
 * Expose routes
 */

module.exports = function (app, errorCode) {

    //-------------------APIs 4 app---------------------------------
    // orderAPI router
    app.use("/1/order", orderAPIRouter);

    // auth code API router
    app.use("/1/auth_code", authCodeAPIRouter);

    // flight API router
    app.get("/1/flight", flightAPIAction.getFlight);

    app.use("/1/sms", smsAPIRouter);

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
        res.status(200).end(JSON.stringify({code: errorCode.customFailure.runtimeError.code, msg: err.message}));
    });

    // assume 404 since no middleware responded
    app.use(function (req, res, next) {
        return res.status(404).end();
    });
};
