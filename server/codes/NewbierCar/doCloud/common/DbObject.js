var config = require("../config/config.js");
var Promise = require("bluebird");
var mysql = require("mysql");

//reconnect relying on connection pool
var db = Promise.promisifyAll(mysql.createPool(config.dbOptions));

process.on("exit", function () {
    db.end(function (err) {
        // all connections in the pool have ended
        console.log(err);
    });
});


var dbObject = module.exports = exports = db;