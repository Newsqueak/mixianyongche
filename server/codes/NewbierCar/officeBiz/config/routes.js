/*!
 * Module dependencies.
 */
var htxAction = require('../app/action/htxAction');
var smsProxy = require("../app/action/smsProxy");

/**
 * Expose routes
 */

module.exports = function (app, passport, errorCode) {

    // user routes
    app.post("/startSearch", htxAction.search);
    app.post("/sms/deliver", smsProxy.sendSMS);
    app.get("/sms/sendPage", smsProxy.sendSMSPage);
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
        res.status(200).end(JSON.stringify({code: errorCode.customFailure, msg: err.message}));
    });

    // assume 404 since no middleware responded
    app.use(function (req, res, next) {
        return res.status(404).end();
    });
};
