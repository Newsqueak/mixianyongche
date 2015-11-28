var Promise = require("bluebird");
var mysql = require("mysql");
var join = Promise.join;
var options = { 
  host: 'rdsvabev2vabev2.mysql.rds.aliyuncs.com',
  port: 3306,
  user: 'mxyc',
  password: 'mxyc123',
  database: 'mxyctest',
  connectionLimit: 10,
  supportBigNumbers: true,
  bigNumberStrings: true 
  
};

var db = Promise.promisifyAll(mysql.createPool(options));
var fdb = Promise.resolve(db);
process.on("exit", function(){db.end(function (err) {
  // all connections in the pool have ended
});

});

join(fContents, fStat, fSqlClient, function(contents, stat, sqlClient) {
    var query = "                                                              \
        INSERT INTO files (byteSize, contents)                                 \
        VALUES ($1, $2)                                                        \
    ";
   return sqlClient.queryAsync(query, [stat.size, contents]).spread(function(){});
})
.then(function(query) {
    console.log("Successfully ran the Query: " + query);
})
.finally(function() {
    // This is why you want to use Promise.using for resource management
    if (fSqlClient.isFulfilled()) {
        fSqlClient.value().close();
    }
});