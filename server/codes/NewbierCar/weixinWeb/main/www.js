#!/usr/bin/env node
/**********
 *
 * should start module config first
 */
var fs = require('fs');
var express = require('express');
var config = require("../config/config");
var common = require("../common");

var app = express();
var port = process.env.PORT || 9003;


// Bootstrap models like classLoader
["action", "service"].forEach(function (subdir) {
    fs.readdirSync(__dirname + '/../app/' + subdir).forEach(function (file) {
        if (~file.indexOf('.js')) require(__dirname + '/../app/' + subdir + '/' + file);
    });

});


// The project's individual business modules assembling below
// Bootstrap passport config
//require('./config/passport')(passport, config);

// Bootstrap application underlying settings
require('../config/express')(app);

// Bootstrap routes
require('../config/routes')(app, common.ErrCode);


// Starting server after all preparations
var server = app.listen(port, function () {
    process.on('uncaughtException', function (err) {
        //打印出错误
        console.log(err);
        //打印出错误的调用栈方便调试
        console.log(err.stack);
    });

    console.log('Express app started on port ' + port);

});

/**
 * Expose
 */
//This file is the top level of the system, so note it's not to be injected down-stairs
process.httpServer = server;
process.app = app;
