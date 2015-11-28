var fs = require("fs");
var xlsx = require("node-xlsx");
var xlsxObj = xlsx.parse("C:/Users/Acer/Desktop/App_code.xlsx");
var xlsxData = xlsxObj[0].data;

var fieldNames = xlsxData[1];
var rst = [];

for (row in xlsxData){

    if(row > 1){
		var rowData = xlsxData[row];
		var item = {};
		for (index in fieldNames){
		   	if(index > 0){
			   item[""+fieldNames[index]] = "" + rowData[index];
			}
		}
		rst.push(item);
		
	}

}

var finalMap = {};  //{guojia: {code:..., cities:}}
for(seed in rst){
    var obj = rst[seed];
    var country = obj["Country"];
    var code = obj["country_code"];
    delete obj["Country"];
	delete obj["country_code"];
	
    if(finalMap[country]){
	    finalMap[country].cities.push(obj);
	
	}else{
	    finalMap[country] = {
		   "code": code,
		   "cities": [obj]
		}
	
	}
}

var countries = Object.keys(finalMap);
finalMap["country_count"] = countries.length;
finalMap["countries"] = countries;

fs.writeFileSync("C:/Users/Acer/Desktop/opened_cities.json", JSON.stringify(finalMap));
