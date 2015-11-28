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

var production = {
    ossOptions: {
        "accessKeyId": "aun04T1GzbQhoZPv",
        "secretAccessKey": "mesBRp1mgVmvIXp17XC2GQL8ribf86",
        "endpoint": "http://oss-cn-beijing-internal.aliyuncs.com",
        "apiVersion": "2013-10-15"
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

module.exports = extend(production, defaults);
