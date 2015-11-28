/**
 * Created by yf_lys on 2015/7/11.
 */
var carTypeMap = {
    jj5: "经济5座",
    jj7: "经济7座",
    jj9: "经济9座",
    jj10: "经济10座",
    jj13: "经济13座",
    jj15: "经济15座",
    sw5: "商务5座",
    sw7: "商务7座",
    sw9: "商务9座",
    sw12: "商务12座",
    sw16: "商务16座",
    hh5: "豪华5座",
    hh7: "豪华7座",
    hh9: "豪华9座",
    hh13: "豪华13座",
    she5: "奢华5座"
};

exports.carType = function (str) {

    var rst = carTypeMap[str];

    if (!rst) {
        return "新型";
    }

    return rst;

};
