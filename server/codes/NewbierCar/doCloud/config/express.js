/**
 * Module dependencies.
 */

var compression = require('compression');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var busboy = require('connect-busboy');
var winston = require('winston');
var env = process.env.NODE_ENV || 'development';

var tokenable = require('./middlewares/Tokenable.js');

/**
 * Expose
 */

module.exports = function (app, passport) {

    // Compression middleware (should be placed before express.static)
    app.use(compression({
        threshold: 512
    }));

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

    //// use passport session
    //app.use(passport.initialize());
    //app.use(passport.session());
    app.use(tokenable());
};