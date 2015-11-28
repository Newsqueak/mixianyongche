module.exports = {

    Split: ":"
    , Hyphen: "~"
    , Amp: "&", Underline: "_", User: {
        idPrefix: "u",
        newPointsGift: 1000,
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
        idPrefix: "MC",
        idLevel: "1",
        dbStatuses: {
            "refunded": "-2",
            "canceled": "-1",
            "fresh": "0",
            "paid": "1",
            "confirmed": "2"
        },
        dbAppMapping: {
            "0": "0",
            "1": "1",
            "2": "1",
            "-1": "-1",
            "-2": "-1"
        }
    }, Location: {
        idPrefix: "l"
    }, Product: {
        idPrefix: "p"
    }, Car: {
        idPrefix: "c"
    }, CarLevelDesc: "xxd(乘客mm 行李nn)", ServiceType: {
        JIEJI: "0",
        SONGJI: "1",
        BAOCHE: "2"
    }

    , REGEXP: {
        isEmail: /^\w+@(\w+\.)+\w+$/i,
        isPhone: /^\d{2,}$/i,
        notSafeSql: /(=|'|"|,)/i,
        isFlightNo: /^[a-zA-Z_]+\d+$/i
    }

};