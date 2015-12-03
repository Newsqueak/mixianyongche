var qs = require('querystring');
var request = require("request");
var EventEmitter = require("events").EventEmitter;
//两个token池和定期刷新，拦截器cookie，每一次链式追尾都是一次pipeTo

function TokenPod(tokenStr, expiredTimestamp) {
    this.token = tokenStr;
	this.outTimestamp = expiredTimestamp;
    var status = "pending";
	this.getStatus = function () {
		return status;
	};
	this.suspend = function () {
		status = "pending";
	};
	
	var self = this;
	self.update = function (tokenStr, expiredTimestamp) {
		self.token = tokenStr;
		self.outTimestamp = expiredTimestamp;
		status = "completed";
	};
};

function WeixinPub(appId, appSecret) {
	this._id = appId;
	this._secret = appSecret;
	this._apiBaseUrl = "https://api.weixin.qq.com";
	this._oAuth2BaseUrl = "https://open.weixin.qq.com/connect/oauth2/authorize";
    this._eb = new EventEmitter();
	this._apiToken = new TokenPod("", 0);
};

WeixinPub.prototype.loadApiToken = function () {
    var self = this;
	var tokenObj = self._apiToken;
	
	if (new Date().getTime() >= tokenObj.outTimestamp) {
		tokenObj.suspend();
		request.get(self._apiBaseUrl + "/cgi-bin/token?grant_type=client_credential&" + qs.stringify({appid: self._id, secret: self._secret}), function (e, r, body) {
            
            if (e) {
				tokenObj.update("", 0);
			} else {
				var rst = JSON.parse(body);
				if (rst.errcode || rst.errmsg) {
					tokenObj.update("", 0);
				} else {
					tokenObj.update(rst.access_token, new Date().getTime() - 2000 + rst.expires_in * 1000);
				}
			}
			
			self._eb.emit("next");
		});
	} else {
        tokenObj.update(tokenObj.token, tokenObj.outTimestamp);
	}
	
	return self;
};

function doWhatOnStatus(weixinPub, pendingHandler, completedHandler) {
	switch (weixinPub._apiToken.getStatus()) {
		case "pending":
		    weixinPub._eb.once("next", pendingHandler);
			break;
		case "completed":
			completedHandler();
			break;
		default:
		    console.error("internal error shit!");
	};	
	
};

///////////////////////////////////客服接口模块///////////////////////////////////////////////
WeixinPub.prototype.kfAccountAdd = function (kfAccount, nick, passwd, callback) {
	var self = this;
    var coreHandler = function () {
        var postData = {
            kf_account : kfAccount,
            nickname : nick,
            password : require("crypto").createHash("md5").update(passwd).digest("hex")
        };
		var options = {
            uri: "https://api.weixin.qq.com/customservice/kfaccount/add?access_token=" + self._apiToken.token,
            body: postData,
            json: true
		};

        request.post(options, function (e, r, result) {
            console.log(result);
            if (callback && typeof callback === "function") {
                callback(e, result);
            }
        });
    };
	
	doWhatOnStatus(self, coreHandler, coreHandler);
	
	return self;
};

WeixinPub.prototype.kfAccountUpdate = function (kfAccount, newNick, newPasswd, callback) {
	var self = this;
	var coreHandler = function () {
		var postData = {
			kf_account: kfAccount,
			nickname: newNick,
			password: require("crypto").createHash("md5").update(newPasswd).digest("hex")
		};
        var options = {
			uri: "https://api.weixin.qq.com/customservice/kfaccount/update?access_token=" + self._apiToken.token,
			body: postData,
			json: true
		};

		request.post(options, function (e, r, result) {
			console.log(result);
			if (callback && typeof callback === "function") {
			    callback(e, result);
			}
		});
	};
	doWhatOnStatus(self, coreHandler, coreHandler);
	
	return self;
};

WeixinPub.prototype.kfAccountDel = function (kfAccount, callback) {
    var self = this;
    var coreHandler = function () {
		var options = {
			uri: "https://api.weixin.qq.com/customservice/kfaccount/del?kf_account=" + kfAccount + "&access_token=" + self._apiToken.token,
			body: {},
			json: true
		};
		request.post(options, function (e, r, result) {
			console.log(result);
			if (callback && typeof callback === "function") {
				callback(e, result);
			}
		});
	};
    doWhatOnStatus(self, coreHandler, coreHandler);
	
	return self;
};

WeixinPub.prototype.kfAccountUploadheadimg = function (kfAccount, callback) {
	
	// var formData = {
        // custom_file: {
            // value:  require("fs").createReadStream('C:/Users/Administrator/Desktop/tttt.jpg'),
            // options: {
                // filename: 'tttt.jpg',
                // contentType: 'image/jpg'
            // }
        // }
    // };
    // request.post({url:'http://api.weixin.qq.com/customservice/kfaccount/uploadheadimg?access_token=' + this._apiToken.token + '&kf_account=' + kfAccount, formData: formData}, function optionalCallback(err, httpResponse, body) {
        // if (err) {
            // return console.error('upload failed:', err);
        // }
        // console.log('Upload successful!  Server responded with:', body);
    // });
	
	
};

WeixinPub.prototype.kfAccountGetkflist = function () {
	
	
	
	
	
};

WeixinPub.prototype.kfAccountSendMsg = function () {
	
	
};

// https://api.weixin.qq.com/cgi-bin/customservice/getkflist?access_token=ACCESS_TOKEN

// https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=ACCESS_TOKEN



/////////////////////////////////////////// 支付所需接口模块 ////////////////////////////////////////////////
// https://api.weixin.qq.com/cgi-bin/user/info?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN
WeixinPub.prototype.createOauthUrlForCode = function (redirectURL, baseScope) {
	var self = this;
	var queryParts = {
        appid: self._id,
        redirect_uri: encodeURIComponent(redirectURL),
        response_type: "code",
        scope: baseScope ? "snsapi_base" : "snsapi_userinfo"
    };
    var queryStr = qs.stringify(queryParts);
    return self._oAuth2BaseUrl + "?" + queryStr + "#wechat_redirect";

};

WeixinPub.prototype.doWhatByOpenid = function (codeOrAccessToken, callback) {
	
	var self = this;
	if (typeof codeOrAccessToken === "string") {
	    var queryParts = {
            appid: self._id,
            secret: self._secret,
            code: codeOrAccessToken,
            grant_type: "authorization_code"
        };

        request.get(self._apiBaseUrl + "/sns/oauth2/access_token?" + qs.stringify(queryParts), function (e, r, result) {
			if (e) {
				callback(e, null);
			}else {
				var accessToken = JSON.parse(result);
                callback(null, accessToken["openid"]);
			}
		});
	} else if(typeof codeOrAccessToken === "object") {
	    callback(null, codeOrAccessToken["openid"]);
	}

};




module.exports = WeixinPub;




/* 
获取access_token
客服接口	5000000	已获得	 
群发接口	   详情	已获得	 
模板消息（业务通知）

获取用户基本信息
获取用户列表
获取用户地理位置(已开启，每次上报)
长链接转短链接接口
客服管理
会话控制

网页授权获取用户基本信息








var https = require('https');
var crypto = require('crypto');

var WxPubOauth = {
    getOpenid: function (appId, appSecret, code, callback) {
        var path = WxPubOauth._createOauthPathForOpenid(appId, appSecret, code);
        WxPubOauth._getRequest('api.weixin.qq.com', path, function (e, response) {
            if (e) {
                return callback(e, null, response);
            }
            if (response && response.hasOwnProperty('openid')) {
                return callback(null, response['openid'], response);
            } else {
                return callback(new Error('OpenidNotReceived', 'JSON received from the Weixin does not contain openid'), null, response);
            }
        });
    },

    createOauthUrlForCode: function (appId, redirectURL, moreInfo) {
        moreInfo = typeof moreInfo == "undefined" ? false : moreInfo;
        var queryParts = {
            'appid': appId,
            'redirect_uri': redirectURL,
            'response_type': 'code',
            'scope': moreInfo ? 'snsapi_userinfo' : 'snsapi_base'
        };
        var queryStr = qs.stringify(queryParts);
        return 'https://open.weixin.qq.com/connect/oauth2/authorize?' + queryStr + '#wechat_redirect';
    },

    _getRequest: function (host, path, callback) {
        var req = https.request({
            host: host,
            port: 443,
            path: path,
            method: 'GET',
            secureProtocol: 'TLSv1_method'
        }, function (res) {
            var response = '';
            res.setEncoding('utf8');
            res.on('data', function (chunk) {
                response += chunk;
            });
            res.on('end', function () {
                try {
                    var responseJson = JSON.parse(response);
                    return callback(null, responseJson);
                } catch (e) {
                    return callback(new Error('JSONParseFailed', 'Invalid JSON received from the Weixin'), response);
                }
            });
        });

        req.end();

        var timeout = 30000;
        req.setTimeout(timeout, function () {
            req._isAborted = true;
            req.abort();
            return callback(new Error('ConnectionTimeout', 'Request aborted due to timeout being reached (' + timeout + 'ms)'), null);
        });
        req.on('error', function (e) {
            if (req._isAborted) return;
            return callback(new Error('ConnectionError', 'An error occurred with our connection to Weixin'), null);
        });
    },

    getJsapiTicket: function (app_id, app_secret, callback) {
        var queryParts = {
            'appid': app_id,
            'secret': app_secret,
            'grant_type': 'client_credential'
        };
        var queryStr = qs.stringify(queryParts);
        var accessTokenPath = '/cgi-bin/token?' + queryStr;
        WxPubOauth._getRequest('api.weixin.qq.com', accessTokenPath, function (e, response) {
            if (e) {
                return callback(e, response);
            }
            if (response && response.hasOwnProperty('errcode')) {
                return callback(null, response);
            }
            var queryParts = {
                'access_token': response['access_token'],
                'type': 'jsapi'
            };
            var queryStr = qs.stringify(queryParts);
            var jsapiTicketPath = '/cgi-bin/ticket/getticket?' + queryStr;
            WxPubOauth._getRequest('api.weixin.qq.com', jsapiTicketPath, function (e, response) {
                return callback(e, response);
            });
        });
    },

    getSignature: function (charge, jsapi_ticket, url) {
        if (!charge.hasOwnProperty('credential') || !charge['credential'].hasOwnProperty('wx_pub')) {
            return null;
        }
        var credential = charge['credential']['wx_pub'];
        var arrayToSign = [
            'jsapi_ticket=' + jsapi_ticket,
            'noncestr=' + credential['nonceStr'],
            'timestamp=' + credential['timeStamp'],
            'url=' + url.split('#')[0]
        ];
        return crypto.createHash('sha1').update(arrayToSign.join('&')).digest('hex');
    }
}; */