var crypto = require("crypto");
var encryptUtils = {};
/** 
 * aes加密 
 * @param data 
 * @param secretKey 
 */  
encryptUtils.aesEncrypt = function(data, secretKey) {  
    var cipher = crypto.createCipher('aes-128-ecb',secretKey);  
    return cipher.update(data,'utf8','hex') + cipher.final('hex');  
}  
  
/** 
 * aes解密 
 * @param data 
 * @param secretKey 
 * @returns {*} 
 */  
encryptUtils.aesDecrypt = function(data, secretKey) {  
    var cipher = crypto.createDecipher('aes-128-ecb',secretKey);
	var aaaaa = cipher.update(data,'hex','utf8') 
	console.log(aaaaa);
    return aaaaa + cipher.final('utf8');  
}

var aa = encryptUtils.aesEncrypt("dfdf的咖啡机的咖啡机呜呜呜", "1234");
console.log(aa);
var bb = encryptUtils.aesDecrypt(aa, "1234");
console.log(bb);