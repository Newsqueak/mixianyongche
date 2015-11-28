var crypto = require("crypto");
var moment = require("moment");

/**
 * Formats mongoose errors into proper array
 *
 * @param {Array} errors
 * @return {Array}
 * @api public
 */

exports.errors = function (errors) {
    var keys = Object.keys(errors);
    var errs = [];

    // if there is no validation error, just display a generic error
    if (!keys) {
        return ['Oops! There was an error']
    }

    keys.forEach(function (key) {
        if (errors[key]) errs.push(errors[key].message)
    });

    return errs
};

/**
 * Index of object within an array
 * find the last one matched and not work for DBObjects nested
 * @param {Array} arr
 * @param {Object} obj
 * @return {Number}
 * @api public
 */

exports.indexof = function (arr, obj) {
    var index = -1; // not found initially
    var keys = Object.keys(obj);
    // filter the collection with the given criterias
    arr.forEach(function (doc, idx) {
        // keep a counter of matched key/value pairs
        var matched = 0;

        // loop over criteria
        for (var i = keys.length - 1; i >= 0; i--) {
            if (doc[keys[i]] === obj[keys[i]]) {
                matched++;

                // check if all the criterias are matched
                if (matched === keys.length) {
                    index = idx;
                    return;
                }
            }
        }

    });
    return index;
};

/**
 * Find object in an array of objects that matches a condition
 *
 * @param {Array} arr
 * @param {Object} obj
 * @param {Function} cb - optional
 * @return {Object}
 * @api public
 */

exports.findByParam = function (arr, obj, cb) {
    var index = exports.indexof(arr, obj);
    if (~index && typeof cb === 'function') {
        return cb(undefined, arr[index])
    } else if (~index && !cb) {
        return arr[index]
    } else if (!~index && typeof cb === 'function') {
        return cb('not found')
    }
    // else undefined is returned
};


/**
 * time millis' last n digits
 * @param {Int} n
 * @return {String}
 *
 */
function nDigitsOfTime(n) {
    var atNow = new Date().getTime().toString();
    return atNow.substring(atNow.length - n);

}


/**
 * Id's strategy from a seed
 * @param {String} seed
 * @param {Int} m
 * @return {String}
 * @api public
 */
exports.objectId = function (seed, m) {
    if (!m || m < 0) {
        m = 1;
    }

    return crypto.createHash("sha1").update(seed).digest("base64").substring(1, 9) +
        crypto.randomBytes(m).toString("hex").toUpperCase() + nDigitsOfTime(3);

};

/**
 * Id's strategy with random
 * @return {String}
 * @api public
 */
exports.uuid = function (m) {
    if (!m || m < 0) {
        m = 6;
    }

    return crypto.randomBytes(m).toString("hex").toUpperCase() + nDigitsOfTime(3);
};

exports.certainId = function (seed) {
    return crypto.createHash("sha1").update(seed).digest("base64");

};

exports.token = function (seed) {
    var coin = crypto.createHash("sha1").update(seed).digest("base64");
    return coin.substring(0, coin.length - 1) + nDigitsOfTime(3);

};

exports.uniqueNo = function () {
    var timeDigits = new Date().getTime().toString().substring(5);
    var rand = Math.round(Math.random() * 1000).toString();
    var num = 3 - rand.length;
    var buffer = [];
    for (var kk = 0; kk < num; kk++) {
        buffer.push("0");
    }
    return timeDigits + buffer.join("") + rand;

};

exports.parseDate = function (dateString) {
    return moment(new Date(dateString));
};

exports.formatDate = function (date) {
    return moment(date).format("YYYY-MM-DD HH:mm:ss");
};
