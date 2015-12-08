var qs = require('querystring');
var crypto = require("crypto");
var request = require("request");
var EventEmitter = require("events").EventEmitter;
//����token�غͶ���ˢ�£�������cookie��ÿһ����ʽ׷β����һ��pipeTo

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
	}	
	
};

///////////////////////////////////�ͷ��ӿ�ģ��///////////////////////////////////////////////
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



/////////////////////////////////////////// ֧������ӿ�ģ�� ////////////////////////////////////////////////
WeixinPub.prototype.createOauthUrlForCode = function (redirectURL, baseScope) {
	var self = this;
	var queryParts = {
        appid: self._id,
        redirect_uri: redirectURL,
        response_type: "code",
        scope: baseScope ? "snsapi_base" : "snsapi_userinfo"
    };

	return self._oAuth2BaseUrl + "?" + qs.stringify(queryParts) + "#wechat_redirect";

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
                if (accessToken.hasOwnProperty("openid")) {
	                callback(null, accessToken["openid"]);
				} else {
					callback(new Error("no openid"), null);
				}
			}
		});
	} else if(typeof codeOrAccessToken === "object") {
	    callback(null, codeOrAccessToken["openid"]);
	}

};

WeixinPub.prototype.doWhatByUserinfo = function (codeOrAccessToken, callback) {
	
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
                var options = {
				    access_token: accessToken["access_token"],
					openid: accessToken["openid"],
					lang: "zh_CN"
				};
				
				request.get(self._apiBaseUrl + "/sns/userinfo?" + qs.stringify(options), function (ee, rr, infoString) {
					if (ee) {
						callback(ee, null);
					}else {
						var userInfo = JSON.parse(infoString);
						if (userInfo.hasOwnProperty("openid")) {
							callback(null, userInfo);
						} else {
							callback(new Error("no openid"), null);
						}
					}
				});
			}
		});
	
	} else if(typeof codeOrAccessToken === "object") {
	    var options = {
		    access_token: codeOrAccessToken["access_token"],
			openid: codeOrAccessToken["openid"],
			lang: "zh_CN"
		};
    	request.get(self._apiBaseUrl + "/sns/userinfo?" + qs.stringify(options), function (ee, rr, infoString) {
			if (ee) {
				callback(ee, null);
			}else {
				var userInfo = JSON.parse(infoString);
			    if (userInfo.hasOwnProperty("openid")) {
					callback(null, userInfo);
				} else {
					callback(new Error("no openid"), null);
				}
			}
		});
	}
	
};

WeixinPub.prototype.doWhatByInnerUserinfo = function (theOpenid, callback) {
	var self = this;
	var coreHandler = function () {
		var options = {
			access_token: self._apiToken.token,
			openid: theOpenid,
	        lang: "zh_CN"
		};

		request.get(self._apiBaseUrl + "/cgi-bin/user/info?" + qs.stringify(options), function (e, r, result) {
            if (e) {
			    callback(e, null);
			} else {
			    var userInfo = JSON.parse(result);
				if (userInfo.hasOwnProperty("openid")) {
				    callback(null, userInfo);
				} else {
		            callback(new Error("no openid"), null);
				}
			}
		});
	};
	doWhatOnStatus(self, coreHandler, coreHandler);
    
    return self;
};

WeixinPub.prototype.getSignature = function (charge, jsapi_ticket, url) {
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
};

WeixinPub.prototype.doWhatByJsapiTicket = function (callback) {
    var self = this;
    var coreHandler = function () {
		if (self.payTicket && self.payTicket.timestamp > new Date().getTime() - 7200000) {
			callback(null, self.payTicket.ticket);
		} else {
	        var queryParts = {
                access_token: self._apiToken.token,
                type: 'jsapi'
            };
    	    
	        request.get(self._apiBaseUrl + "/cgi-bin/ticket/getticket?" + qs.stringify(queryParts), function (e, r, result) {
                if(e) {
					callback(e, null);
				} else {
					var ticketObj = JSON.parse(result);
		            if (ticketObj.hasOwnProperty("ticket")) {
                        self.payTicket = {
							ticket: ticketObj.ticket,
							timestamp: new Date().getTime()
						};
					    callback(null, ticketObj.ticket);

					} else {
						callback(new Error("no ticket"), null);
					}
				}
            });
		}
	};
    doWhatOnStatus(self, coreHandler, coreHandler);
	
	return self;
};






module.exports = WeixinPub;




/* 
�ͷ��ӿ�	5000000	�ѻ��	 
Ⱥ���ӿ�	   ����	�ѻ��	 
ģ����Ϣ��ҵ��֪ͨ��

������ȡ��ȡ�û�������Ϣ
��ȡ�û��б�
��ȡ�û�����λ��(�ѿ�����ÿ���ϱ�)
������ת�����ӽӿ�
�ͷ�����
�Ự����

*/