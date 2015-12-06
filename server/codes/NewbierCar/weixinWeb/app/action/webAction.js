var utils = require("../../lib/utils");
var common = require("../../common");
var config = require("../../config/config");
var fs = require('fs');
var path = require('path');


function postOptions(url, data, isFullUrl) {
    var _url = !isFullUrl ? config.selfApiURL + url : url;

    var options = {
        url: _url,
        headers: {
            "User-Agent": "test",
            "idfv": "kdjfkdkflsdkfjdkfjkdjf"
        },
        form: data
    };
    return options;
}

exports.queryPage = function (req, res, next) {

    res.render("query");


};

exports.carsPage = function (req, res, next) {
    console.log(req.body)
    common.RemoteAPI.post(postOptions('/1/car/booking.do', req.body), function (e, r, result) {
        if (e) {
            next(e);
        } else {
            var json = JSON.parse(result);
            if (json.code != 0) {
                var err = new Error(json.msg);
                err.code = json.code;
                return next(err);
            }
            //console.log("json.cars:"+json.cars)
            res.render("cars", {data: json, type: req.body.JIEJI_SONGJI});
        }
    });

};

exports.addressesPage = function (req, res, next) {
    //页面post传吗？ 这个我觉得应该是get传过来的，req.query去取，到立即订车的时候整个才是post
    //是post;get直观,但post url简洁相对能安全一些,应用里如果没有url跳转要求时,习惯用post,
    var postData = {};
    postData.book_date = req.query.book_date;
    postData.flight_no = req.query.flight_no;
    postData.JIEJI_SONGJI = req.query.JIEJI_SONGJI; //0:接机 1:送机
    //console.log(req.query);

    var options = {
        url: config.selfApiURL + '/1/baseinfo/flight_and_places.do',
        headers: {
            "User-Agent": "test",
            "idfv": "kdjfkdkflsdkfjdkfjkdjf"
        },
        form: postData
    };


    common.RemoteAPI.post(options, function (e, r, result) {
        console.log(result);
        if (e) {
            console.log('查询目标酒店错误');
            res.status(412).end("查询目标酒店错误")
        } else {
            var j = JSON.parse(result);
            if (j.code != 0) {
                console.log(j.msg);
                res.status(412).end(j.msg)
            } else {
                res.json(j)
            }
        }
    });




};
//开通城市
exports.openCitiesPage = function (req, res, next) {
    common.RemoteAPI.get(config.selfApiURL + "/1/open_cities", function (e, r, body) {
        if (e) {
            return next(e);
        } else {
            var dataObj = JSON.parse(body);
            delete dataObj.countries;
            delete dataObj.country_count;
            return res.render("openCities", {data: dataObj});
        }
    });
};
/**************订单相关**********************/
//订单填写
exports.orderFillingPage = function (req, res, next) {
    var temOrderStr = req.cookies.temOrder;
    if (!temOrderStr) {
        return next(new Error("请重新下单"));
    }
    //ar temOrderObj = JSON.parse(temOrderStr);
    //var airlineObj = JSON.parse(req.cookies.airline);

    //res.render("orderFilling", {temOrder: temOrderObj, airline: airlineObj});
    res.render("orderFilling");
    //把航班号、接送机区分的标识、预订日期、大人小孩数等等放到 input type=hidden 的隐藏域的value中
    //，用户提交订单时要一起表单提交过来，提交的action目标页面是收银台页面，然后收银台页面action方法去访问creation.do的接口，注意接口参数很多，
    // 要准备全了，全了，全了，了，了！！！！！！！！！！！！！！！！

};
//订单详情
exports.orderDetailsPage = function (req, res, next) {

    if (req.query.order_no != undefined && req.query.order_no != "") {
        common.RemoteAPI.post(postOptions('/1/order/details.do', {order_no: req.query.order_no}), function (e, r, result) {
            if (e) {
                return next(e);
            } else {
                /*
                 请求成功：{
                 "code" : 0,
                 "pay_status":  "-1",                   //订单状态 0是未支付，1是支付成功，-1是取消或退单
                 "service_tel_abroad": "-1"         //境外供应商的中文客服电话，“-1”表示还没有确定
                 //不是“-1”就是有确定值
                 }
                 请求失败：{
                 "code": 1,
                 "msg":  "缺少必要的接口参数"   //失败类型及原因很多，详见上文错误码
                 }
                 */
                //console.log(result);
                var json = JSON.parse(result);
                console.log(json)
                return res.render("orderDetails", json); //json.code=0 有正确返回 ，json.code==2 无效凭证
            }
        })
    } else {
        next(new Error("找不到订单"));
    }



};
//订单取消 ajax
/*
 6. 用户主动取消订单，或者未支付的订单过期时客户端主动发送的接口
 url：http://api.laobingke.com:9000/1/order/cancelling.do
 请求方式：POST
 数据格式：表单
 字段：
 order_no = "mxyc123456890,mxyc787822938,mxyc6235898326"    //订单号,逗号分隔
 调用说明：未支付状态才能取消，支付成功后只能退单，在后台的退单状态码是-2，订单取消是-1
 响应：
 请求成功：{
 "code" : 0
 }
 请求失败：{
 "code":  4,
 "msg":  "参数不符合规范或者业务条款"   //失败类型及原因很多，详见上文错误码
 }

 */
exports.orderCancel = function (req, res, next) {
    if (req.query.order_no != undefined && req.query.order_no != "") {
        common.RemoteAPI.post(postOptions('/1/order/cancelling.do', {order_no: req.query.order_no}), function (e, r, result) {
            if (e) {
                return res.status(412).end(e)
            } else {
                var json = JSON.parse(result);
                console.log(json)
                return res.json(json); //json.code=0 有正确返回 ，json.code==2 无效凭证
            }
        })
    }
}
//我的订单列表
exports.orderListPage = function (req, res, next) {


    if (req.cookies.token && req.cookies.token != "" && req.cookies.token != undefined) {
        console.log('a');
        common.RemoteAPI.post(postOptions('/1/order/list.do', {token: req.cookies.token}), function (e, r, result) {

            if (e) {
                return next(e);
            } else {
                //console.log(result);
                var json = JSON.parse(result);

                return res.render("orders", json); //json.code=0 有正确返回 ，json.code==2 无效凭证
            }

        })


    } else {

        return res.render("orders", {code: 3}); //未登录
    }


};
//收银台
exports.paymentPage = function (req, res, next) {
    var temOrderStr = req.cookies.temOrder;
    if (!temOrderStr) {
        return next(new Error("请重新下单"));
    }
    var temOrderObj = JSON.parse(temOrderStr);
    //console.log(temOrderObj)
    if (temOrderObj.order_no != undefined) {//已经存的订单
        return res.render("pay", {data: temOrderObj});
    } else {//新订单
        var token = req.cookies.token;
        if (token != undefined) {
            temOrderObj.token = token;
        }
        common.RemoteAPI.post(postOptions('/1/order/creation.do', temOrderObj), function (e, r, result) {
            if (e) {
                return next(e);
            } else {
                var json = JSON.parse(result);
                if (json.code != 0) {
                    var err = new Error(json.msg);
                    err.code = json.code;
                    return next(err);
                }
                console.log(json);
                return res.render("pay", {data: json});
            }
        });
    }

};

exports.weixinPlanPayPage = function (req, res, nex) {
    return res.render("weixin")
}


/*---------------用户相关-----------------*/

exports.myCenterPage = function (req, res, next) {

    if (req.cookies.token && req.cookies.token != "" && req.cookies.token != undefined) {
        common.RemoteAPI.post(postOptions('/1/user/sync_profile.do', {token: req.cookies.token}), function (e, r, result) {

            if (e) {
                return res.status(412).end(e)
            } else {
                //console.log(result);
                var json = JSON.parse(result);
                return res.render("my", {data: json});

            }

        })


    } else {
        return res.redirect("login");
    }


};
//用户设置
/*
 exports.settingsPage = function (req, res, next) {

 res.render("settings");

 };
 */
//用户信息更新 ajax
exports.userinfoUpdate = function (req, res, next) {
    if (req.cookies.token && req.cookies.token != "" && req.cookies.token != undefined) {
        var postData = {};
        console.log(req.body)
        postData.token = req.cookies.token;
        postData.fields = req.body.field;
        postData[req.body.field] = req.body.value;
        console.log(postData)
        common.RemoteAPI.post(postOptions('/1/user/send_profile.do', postData), function (e, r, result) {

            if (e) {
                return res.status(412).end(e)
            } else {
                return res.json(JSON.parse(result));

            }

        })


    } else {
        return res.redirect("login");
    }


};
//登录页
exports.loginPage = function (req, res, next) {

    return res.render("login")
}
//登录action ajax
exports.login = function (req, res, next) {
    console.log(req.body);
    common.RemoteAPI.post(postOptions('/1/user/login.do', req.body), function (e, r, result) {

        if (e) {
            res.status(412).end(e)
        } else {
            //console.log(result);
            var json = JSON.parse(result);
            if (json.code == 0) {
                res.cookie("token", json.token, {maxAge: 5 * 365 * 24 * 60 * 60, path: '/', httpOnly: true})
            } else {
                res.cookie("token", json.token, {maxAge: -1, path: '/', httpOnly: true})
            }
            return res.json(json);

        }
    })

};
//用户工具界面
exports.userCogPage = function (req, res, next) {
    res.render("myCog")
};
//退出action ajax
exports.logoutPage = function (req, res, next) {
    res.cookie("token", "", {maxAge: -1, path: '/', httpOnly: true});
    res.redirect("login");
};

//用户注册
exports.registerPage = function (req, res, next) {

    res.render("register");

};
//用户注册 submit ajax
/*
 1.注册
 url：http://api.laobingke.com:9000/1/user/signup.do
 请求方式：POST
 数据格式：表单
 字段：
 phone = "13581897657"
 country_code = "86"
 password = "123456abcd"
 调用说明： 手机嵌入手机号验证的SDK后，一旦验证成功就发送这个接口，相当于验证通过之后的服务器回调
 响应：
 请求成功：{
 "code" : 0,
 "token"  :  "yTXRyRRdcq+faDODP0yhAMYZ1Ks275"
 }
 请求失败：{
 "code": 1,
 "msg": "错误原因"    //原因比如： 用户名已存在
 }

 * */
exports.registerSubmit = function (req, res, next) {
    //服务器验证短信
    common.RemoteAPI.post(postOptions('/1/user/existence.do', req.body), function (e, r, result) {

            if (e) {
                return res.status(412).end(e)
            } else {
                var json = JSON.parse(result);
                if (json.code == 1) {
                    res.json({code: 1, msg: json.msg});
                }
                else if (json.code = 0 && json.is_existing == 1) {
                    res.json({code: 2, msg: json.msg});
                }
                else {

                    common.RemoteAPI.post(postOptions('http://authcode.laobingke.com:9000/1/auth_code/verifying', req.body, true), function (ee, rr, rresult) {
                        if (ee) {
                            return res.status(412).end(ee)
                        } else {

                            var smsjson = JSON.parse(rresult);
                            console.log(rresult);
                            if (smsjson.code == 0) {
                                common.RemoteAPI.post(postOptions('/1/user/signup.do', req.body), function (eee, rrr, rrresult) {
                                    if (eee) {
                                        res.status(412).end(eee)
                                    } else {
                                        var json = JSON.parse(rrresult);
                                        if (json.code == 0) {
                                            res.cookie("token", json.token, {
                                                maxAge: 5 * 365 * 24 * 60 * 60,
                                                path: '/',
                                                httpOnly: true
                                            })
                                        }
                                        res.json(json);
                                    }

                                })
                            } else {
                                return res.json(smsjson);
                            }
                        }

                        //var smsJson = {code:1:msg:"短信发送失败"}


                    })
                }
            }
        }
    )

};
//发送注册短信 ajax
/*
 http://authcode.laobingke.com:9000/1/auth_code/emitting       发送短信
 参数   {
 country_code :86,
 phone: 13659985656
 }
 成功返回  {
 "code": 0
 }

 http://authcode.laobingke.com:9000/1/auth_code/verifying    验证短信验证码
 参数
 {
 country_code :86,
 phone: 13659985656,
 captcha:  54886      //这个就是验证码
 }

 成功返回： {
 "code": 0
 }

 失败返回示例一{
 "code": 121,
 "msg": "验证码超时失效"
 }

 */
exports.registerSendSMS = function (req, res, next) {

    //check User Existing
    /*
     phone = "13581897657"
     country_code = "86"
     * */
    common.RemoteAPI.post(postOptions('/1/user/existence.do', req.body), function (e, r, result) {
        if (e) {
            return res.status(412).end(e)
        } else {
            var json = JSON.parse(result);
            if (json.code == 1) {
                res.json({code: 1, msg: json.msg});
            }
            else if (json.code = 0 && json.is_existing == 1) {
                res.json({code: 2, msg: json.msg});
            }
            else {
                req.body.phone = parseInt(req.body.phone, 10);
                req.body.country_code = parseInt(req.body.country_code, 10);
                //接口服务器发送短信
                common.RemoteAPI.post(postOptions('http://authcode.laobingke.com:9000/1/auth_code/emitting', req.body, true), function (ee, rr, rresult) {


                    if (ee) {
                        console.log(ee);
                        return res.status(412).end(ee)
                    } else {

                        var smsjson = JSON.parse(rresult);
                        console.log(smsjson);
                        res.json(smsjson);
                    }

                    //var smsJson = {code:1:msg:"短信发送失败"}
                });


            }
        }
    });
};
exports.editPswPage = function (req, res, next) {
    if (req.cookies.token && req.cookies.token != "" && req.cookies.token != undefined) {
        res.render("editPsw");
    } else {
        return res.redirect("login");
    }

};
exports.editPswSubmitPage = function (req, res, next) {
    req.body.token = req.cookies.token

    delete  req.body.renew_password;
    common.RemoteAPI.post(postOptions('/1/user/update_password.do', req.body), function (e, r, result) {
        if (e) {
            return res.status(412).end(e)
        } else {

            var json = JSON.parse(result);
            if (json.code == 103) {
                json.msg = "原密码错误"
            }
            res.json(json);
        }
    });
};

exports.repsw2Page = function (req, res, next) {
    res.render("psw2");
};

exports.losePswPage = function (req, res, next) {


    if(req.cookies.losePsw){
        //req.cookies.losePsw=null;
        res.cookie("losePsw",{},{maxAge: -1,httpOnly:true});
    }
    return res.render("losePsw");


};
exports.lostPsw_phone = function (req, res, next) {
    //request send sms
    var data={phone:req.body.phone,country_code:req.body.country_code};

    common.RemoteAPI.post(postOptions('/1/user/existence.do', data), function (e, r, result) {
        if (e) {
            return res.status(412).end(e)
        } else {

            var json = JSON.parse(result);
            if (json.code == 0) {
                res.cookie("losePsw",data,{httpOnly:true});
            }
            return res.json(json);
        }
    });


};
exports.lostPsw_sendsms = function (req, res, next) {


    if(!req.cookies.losePsw || !req.cookies.losePsw.phone){
        return res.json({code:11,msg:"请重新开始"})
    }else{

        var data = req.cookies.losePsw;
        //接口服务器发送短信
        common.RemoteAPI.post(postOptions('http://authcode.laobingke.com:9000/1/auth_code/emitting', data, true), function (ee, rr, rresult) {


            if (ee) {
                console.log(ee);
                return res.status(412).end(ee)
            } else {

                var smsjson = JSON.parse(rresult);
                console.log(smsjson);
                return res.json(smsjson);
            }

            //var smsJson = {code:1:msg:"短信发送失败"}
        });
    }

};
exports.lostPsw_verifysms = function (req, res, next) {


    if(!req.cookies.losePsw || !req.cookies.losePsw.phone){
        return res.json({code:11,msg:"请重新开始"})
    }else{
        var data = {
            phone:req.cookies.losePsw.phone,
            country_code :req.cookies.losePsw.country_code ,
            captcha:req.body.captcha
        };
        common.RemoteAPI.post(postOptions('http://authcode.laobingke.com:9000/1/auth_code/verifying', data, true), function (ee, rr, rresult) {
            if (ee) {
                return res.status(412).end(ee)
            } else {

                var smsjson = JSON.parse(rresult);
                console.log(smsjson);
                return res.json(smsjson)

            }
        })
    }

};
exports.lostPsw_reset = function (req, res, next) {

    if(!req.cookies.losePsw || !req.cookies.losePsw.phone){
        return res.json({code:11,msg:"请重新开始"})
    }else{
        var data = {
            phone:req.cookies.losePsw.phone,
            country_code :req.cookies.losePsw.country_code ,
            new_password :req.body.new_password
        };
        common.RemoteAPI.post(postOptions('/1/user/forget_password.do', data, false), function (ee, rr, rresult) {
            if (ee) {
                return res.status(412).end(ee)
            } else {

                var smsjson = JSON.parse(rresult);
                console.log(smsjson);
                return res.json(smsjson)

            }
        })
        return res.json({code:0,msg:""})
    }
};
