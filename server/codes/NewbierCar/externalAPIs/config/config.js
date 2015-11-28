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

var production_params = {
    selfApiURL: "http://10.172.241.236:9000",
    pingppOptions: {
        apiKey: "sk_live_1yXTiLSSmHiP0e10WLzzjDmT",
        mxycAppId: "app_azPC0KyLC40SvHSi"
    },
    smsOptions: {
        url: "http://sms.ensms.com:8080/sendsms/",
        username: "mixianyongche",
        password: "mxyc123"
    }
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

module.exports = extend(production_params, defaults);
/**
 {
     development: extend(development, defaults),
     test: extend(test, defaults),
     production: extend(production, defaults)
 }[process.env.NODE_ENV || 'development'];
 */