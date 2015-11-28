/**
 * Module dependencies.
 */

var path = require('path');
var extend = require('util')._extend;

/**
 * sorry , no time to deal with this
 *
 var development = require('./env/development');
 var test = require('./env/test');
 var production = require('./env/production');
 */

var development = {
    htxOptions: {
        headers: {
            "User-Agent": "laobingke-mxyc",
            "API_KEY": "77770618a88ba70378cc427d",
            "Accept-Language": "zh",
            "Accept": "application/json"
        },
        baseUrl: "https://connect.htxstaging.com"
    }

};

var production = {
    selfApiURL: "http://127.0.0.1:9001"
};

/**
 * This is an SMS or Email notification configuration part *
 */
var notifier = {
    service: 'postmark',
    APN: false,
    email: true, // true
    actions: ['comment'],
    // tplPath: path.normalize(__dirname + '/../app/mailer/templates'),
    key: 'POSTMARK_KEY'
};

var defaults = {
    root: path.normalize(__dirname + '/..'),
    notifier: notifier
};

/**
 * Expose
 */

module.exports = {
     development: extend(development, defaults),
     production: extend(production, defaults)
}[process.env.NODE_ENV || 'development'];
