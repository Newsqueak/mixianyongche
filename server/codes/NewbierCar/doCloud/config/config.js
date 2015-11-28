/**
 * Module dependencies.
 */

var path = require('path');
var extend = require('util')._extend;

var development = {
    dbOptions: {
        host: 'rdsvabev2vabev2.mysql.rds.aliyuncs.com',
        port: 3306,
        user: 'mxyc',
        password: 'mxyc123',
        database: 'mxyctest',
        connectionLimit: 10,
        supportBigNumbers: true,
        bigNumberStrings: true
    }
};

var production = {
    dbOptions: {
        host: 'rdsvabev2vabev2.mysql.rds.aliyuncs.com',
        port: 3306,
        user: 'mxyc',
        password: 'mxyc123',
        database: 'mxyc',
        connectionLimit: 10,
        supportBigNumbers: true,
        bigNumberStrings: true
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
    notifier: notifier,
    externalApiURL: "http://10.172.241.236:80"
};

/**
 * Expose
 */

module.exports =
    {
        development: extend(development, defaults),
        production: extend(production, defaults)
    }[process.env.NODE_ENV || 'development'];
