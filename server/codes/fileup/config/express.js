/**
 * Module dependencies.
 */

var express = require('express');
var compression = require('compression');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var busboy = require('connect-busboy');
var swig = require('swig');

var winston = require('winston');
var helpers = require('view-helpers');
var config = require('./config');
var pkg = require('../package.json');

var env = process.env.NODE_ENV || 'development';

/**
 * Expose
 */

module.exports = function (app, passport) {

    // Compression middleware (should be placed before express.static)
    app.use(compression({
        threshold: 512
    }));

    // Static files middleware
    app.use(express.static(config.root + '/public'));

    // Use winston on production
    var log;
    if (env !== 'development') {
        log = {
            stream: {
                write: function (message, encoding) {
                    winston.info(message);
                }
            }
        };
    } else {
        log = 'dev';
    }

    // Don't log during tests
    // Logging middleware
    if (env !== 'test') app.use(morgan('combined', log));

    // Swig templating engine settings
    if (env === 'development' || env === 'test') {
        swig.setDefaults({
            cache: false
        });
    }

    // set views path, template engine and default layout
    app.engine('html', swig.renderFile);
    app.set('views', config.root + '/views');
    app.set('view engine', 'html');

    // bodyParser should be above methodOverride
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(busboy());
    app.use(methodOverride(function (req, res) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));

    // CookieParser should be above session
    app.use(cookieParser());
    app.use(cookieSession({secret: 'mxycAi123456t'}));

    //// use passport session
    //app.use(passport.initialize());
    //app.use(passport.session());

    // should be declared after session and flash
    app.use(helpers(pkg.name));

};