var extend = require("util")._extend;

var testErrorCode = {
    lackParams: {code: 1, msg: "缺少必要的接口参数"},
    nonLogin: {code: 2, msg: "不具备登录状态和token的凭证"},
    nonPermission: {code: 3, msg: "操作权限不够"},
    nonProperParams: {code: 4, msg: "参数不符合规范或者业务条款"},
    dataImportError: {code: 5, msg: "数据库数据录入错误"}
};

var productionErrorCode = {
    userExisting: {code: 101, msg: "该用户已注册请直接登录"},
    nonUserLogined: {code: 102, msg: "登录的用户名不存在或未注册"},
    wrongPassword: {code: 103, msg: "登录密码错误"},
    wrongAuthCode: {code: 104, msg: "验证码错误"},
    noCarAvailable: {code: 105, msg: "该时段该地区已无车"},
    payRejection: {code: 106, msg: "获取支付凭证失败，支付渠道接口访问拒绝"},
    orderParamsIllegal: {code: 107, msg: "订单填写的邮箱或者手机号不合法"},
    lackOrderNo: {code: 108, msg: "缺少订单号的订单无法发起支付"},
    bookDateIllegal: {code: 109, msg: "离用车日期不足规定天数，进入截止日期无法订车"},
    ossRejection: {code: 110, msg: "阿里云oss存储出现错误"},
    flightNoNotFound: {code: 111, msg: "万分抱歉，您的航班号或者当天该航班没有查询到"},
    cityNotInService: {code: 112, msg: "该城市或该地区尚未开通服务"}
};

var fatalErrorCode = {
    databaseError: {code: 10001, msg: "数据库出错"},
    runtimeError: {code: 10003, msg: "程序运行时错误"},
    unknownError: {code: 10004, msg: "未知错误"}
};


var customErrCode = {
    customSuccess: {code: 0},
    customFailure: extend(extend(testErrorCode, productionErrorCode), fatalErrorCode)
};

//code:1, msg: "缺少必要的接口参数"
//code:2, msg: "不具备登录状态和token的凭证"
//code:3, msg: "操作权限不够"
//code:4, msg: "参数不符合规范或者业务条款"
//
//
//
//二、生产阶段因用户行为的错误码（101起算）
//code:101, msg:"用户名已注册"         //这里要么提示直接登录或者更换新的用户名重试注册
//code:102, msg:"登录的用户名不存在或未注册"
//code:103, msg:"登录密码错误"
//code:104, msg:"验证码错误"
//code:105, msg:"该时段该地区已无车"
//code:106, msg:"获取支付凭证失败，支付渠道接口访问拒绝",
//    chge:<这里是ping++调取相应渠道方的接口获得的charge对象>
//code:107, msg:"订单填写的邮箱或者手机号不合法"
//code:108, msg:"缺少订单号的订单无法发起支付"
//code:109, msg:"离用车日期不足规定天数，进入截止日期无法订车"
//code:110, msg:"阿里云oss存储出现错误"
//code:111, msg: "该城市或该地区尚未开通服务"
//
//
//
//三、极少出现的错误类型（10000起算）
//code:10001, msg:"数据库无法连接"
//code:10002, msg:"该用户已被屏蔽"
//code:10003, msg:"程序运行时错误"
//code:10004, msg:"未知错误"


module.exports = customErrCode;
