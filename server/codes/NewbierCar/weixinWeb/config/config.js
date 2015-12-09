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
    selfApiURL: "http://182.92.195.92:9000",
    wxOauthCallbackBaseURL: "http://weixintest.laobingke.com",
    weixinApp: {
        appID: "wxcd529639221d9aaa",
        appsecret: "14290f263e76885bb086a99919c88a1d",
        token: "mxycAi123456",
        encodingAESKey: "Mxycweixinmp1387"
    }
};

var production = {
    selfApiURL: "http://10.172.241.236:9000",
    wxOauthCallbackBaseURL: "http://weixin.laobingke.com",
    weixinApp: {
        appID: "wxa29fffed6c0726da",
        appsecret: "ae88eb2910ff8165f6327bd6143581b5",
        token: "mxycAi123456",
        encodingAESKey: "Mxycweixinmp1387"
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

module.exports =
 {
     development: extend(development, defaults),
     production: extend(production, defaults)
 }[process.env.NODE_ENV || 'development'];
