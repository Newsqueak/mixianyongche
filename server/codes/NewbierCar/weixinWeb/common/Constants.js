module.exports = {

    Split: ":", Hyphen: "~", Amp: "&", Underline: "_", User: {
        profiles: {
            "avatar_url": "avatar_url",
            "screen_name": "screen_name",
            "official_name": "official_name",
            "gender": "gender",
            "birthday": "birthday",
            "phone": "phone",
            "country_code": "country_code",
            "email": "email"
        }
    }, Order: {
        clientStatuses: {
            "canceled": "-1",
            "fresh": "0",
            "paid": "1"
        }
    }, ServiceType: {
        JIEJI: "0",
        SONGJI: "1",
        BAOCHE: "2"
    }, REGEXP: {
        isEmail: /^\w+@(\w+\.)+\w+$/i,
        isPhone: /^\d{2,}$/i,
        notSafeSql: /(=|'|"|,)/i,
        isFlightNo: /^[a-zA-Z_]+\d+$/i
    }

};