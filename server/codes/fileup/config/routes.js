/*!
 * Module dependencies.
 */
var pics = require('../app/action/pics');

//the custom middleware of routes
var router = require('express').Router();
router.get("/share", pics.share);
router.post("/avatar", pics.avatar);

/**
 * Expose routes
 */

module.exports = function (app, passport) {

    // user routes
    app.use("/pics", router);

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
        res.status(200).end(JSON.stringify({code: 10003, msg: err.message}));
    });

    // assume 404 since no middleware responded
    app.use(function (req, res, next) {
        return res.status(404).end("Page Not Found");
    });
};