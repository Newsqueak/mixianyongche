/*!
 * Module dependencies.
 */
var usersAction = require('../app/action/userAction');
var baseInfoAction = require('../app/action/baseInfoAction');
var carsAction = require('../app/action/carAction');
var ordersAction = require('../app/action/orderAction');
var ofbizAction = require('../app/action/ofbizAction');
var openCitiesAction = require('../app/action/openCitiesAction');


// the custom middleware of routes
var userRouter = require('express').Router();
userRouter.post("/signup.do", usersAction.doSignup);
userRouter.post("/existence.do", usersAction.doExistence);
userRouter.post("/login.do", usersAction.doLogin);
userRouter.post("/send_profile.do", usersAction.doSendProfile);
userRouter.post("/forget_password.do", usersAction.doForgetPasswd);
userRouter.post("/update_password.do", usersAction.doUpdatePasswd);
userRouter.post("/sync_profile.do", usersAction.doSyncProfile);

var baseInfoRouter = require('express').Router();
baseInfoRouter.post("/flight_and_places.do", baseInfoAction.doFlight_And_Places);

var carRouter = require('express').Router();
carRouter.post("/booking.do", carsAction.doBooking);

var orderRouter = require('express').Router();
orderRouter.post("/creation.do", ordersAction.doCreation);
orderRouter.post("/send_phone_abroad.do", ordersAction.doSendPhoneAbroad);
orderRouter.post("/latest_status.do", ordersAction.doLatestStatus);
orderRouter.post("/list.do", ordersAction.doList);
orderRouter.post("/cancelling.do", ordersAction.doCancelling);
orderRouter.post("/details.do", ordersAction.doDetails);
orderRouter.post("/pay_callback.do", ordersAction.doPayCallback);
orderRouter.post("/charge_id.do", ordersAction.doChargeId);
orderRouter.post("/confirmation.do", ordersAction.doConfirmation);
orderRouter.post("/bind_charge.do", ordersAction.doBindCharge);

var ofbizRouter = require('express').Router();
ofbizRouter.get("/valid_orders.do", ofbizAction.doValidOrders);
ofbizRouter.get("/such_order.do", ofbizAction.doSuchOrder);
ofbizRouter.get("/finished_orders.do", ofbizAction.doFinishedOrders);
ofbizRouter.post("/compensation.do", ofbizAction.doCompensation);
ofbizRouter.get("/quartz_start.do", ofbizAction.doQuartzStart);

/**
 * Expose routes
 */

module.exports = function (app, passport, errorCode) {

    //-------------------APIs 4 app---------------------------------
    // baseInfo routes
    app.use("/1/baseinfo", baseInfoRouter);

    // car routes
    app.use("/1/car", carRouter);

    // order routes
    app.use("/1/order", orderRouter);

    // user routes
    app.use("/1/user", userRouter);

    // opened cities routes
    app.get("/1/open_cities", openCitiesAction.getOpenedCities);

    //--------------------APIs 4 officeBiz---------------------------
    app.use("/1/ofbiz", ofbizRouter);


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
