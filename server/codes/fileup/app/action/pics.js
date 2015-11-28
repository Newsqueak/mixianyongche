var utils = require("../../lib/utils");
var config = require("../../config/config");
var ALY = require("aliyun-sdk");
var moment = require("moment");

var errCode = {
    ossRejection: {code: 110, msg: "阿里云oss存储出现错误"},
    noFilename: {code: 10, msg: "app代码错误未提供上传的文件名"}
};

exports.share = function (req, res, next) {

    res.render("uploading", {});

};

exports.avatar = function (req, res, next) {

    req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
        if (!filename) {
            // If filename is not truthy it means there's no file
            return res.status(200).end(JSON.stringify(errCode.noFilename));
        }

        file.fileRead = [];
        file.on('data', function (chunk) {
            this.fileRead.push(chunk);
        });

        file.on('error', function (errr) {
            console.log('Error while buffering the stream: ', errr);
            next(errr);
        });

        file.on('end', function () {
            var finalBuffer = Buffer.concat(this.fileRead);
            var filenamePieces = filename.split(".");
            var fileSuffix = filenamePieces[filenamePieces.length - 1];
            var fileNewName = utils.uuid(4) + "." + fileSuffix;
            var contentTyp = "image/" + fileSuffix;
            var dateNow = moment().format("YYYY-MM-DD");

            var oss = new ALY.OSS(config.ossOptions);

            oss.putObject({
                    Bucket: 'mxyc',
                    Key: "user/avatar/" + dateNow + "/" + fileNewName,
                    Body: finalBuffer,
                    AccessControlAllowOrigin: '',
                    ContentType: contentTyp,
                    CacheControl: '',                   // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9
                    ContentDisposition: '',           // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec19.html#sec19.5.1
                    ContentEncoding: '',              // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.11
                    ServerSideEncryption: 'AES256',
                    Expires: 100                           // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.21
                },
                function (err, data) {

                    if (err) {
                        console.log('error:', err);
                        return res.status(200).end(JSON.stringify(errCode.ossRejection));
                    }

                    res.writeHead(200, {"Content-Type": "text/plain;charset=utf-8", "Access-Control-Allow-Origin": "*"});

                    return res.end(JSON.stringify({
                        "code": 0,
                        "avatar_url": "http://pic.laobingke.com/" + "user/avatar/" + dateNow + "/" + fileNewName
                    }));

                });

        });

    });

    req.pipe(req.busboy);

};
