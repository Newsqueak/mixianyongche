module.exports = {

    Split: ":", Hyphen: "~", Amp: "&", REGEXP: {
        isEmail: /^\w+@(\w+\.)+\w+$/i,
        isPhone: /^\d{2,}$/i
    }
    , SMS: {
        title: {
            mxyc: "【米线用车】"
        },
        template: {
            mxyc: "亲，您的验证码是{captcha}，有效期2分钟，请勿泄露，如非您本人操作请直接删除不予理会^^"
        }
    }

    , HasExtraChannels: {
        alipay_wap: "alipay_wap",
        wx_pub: "wx_pub",
        upacp_wap: "upacp_wap",
        upmp_wap: "upmp_wap",
        bfb_wap: "bfb_wap",
        apple_pay: "apple_pay",
        wx_pub_qr: "wx_pub_qr",
        yeepay_wap: "yeepay_wap",
        jdpay_wap: "jdpay_wap"
    }

};