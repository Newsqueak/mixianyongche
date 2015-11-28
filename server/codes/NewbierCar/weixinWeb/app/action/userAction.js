//var User = require("../dao/user");
var utils = require("../../lib/utils");
var common = require("../../common");

////教程
//response.cookie('haha', 'name1=value1&name2=value2', {maxAge:10*1000, path:'/', httpOnly:true});
//语法如下：
//    response.cookie('cookieName', 'name=value[name=value...]',[options]);
//
//
//options字段含义:
//    1、expires：指定过期时间，以GMT格式表示的时间字符串，如方法一个的“timeObj”。
//2、maxAge：指定过期时间，同expires（expires和maxAge选两者其一设值即可）。和expires不同之处在于，maxAge值的单位为毫秒（见方法二中的maxAge:10*1000，即为10秒）。maxAge值可以是正数和负数。正数表示当前COOKIE存活的时间。负数表示当前COOKIE只是随着浏览器存储在客户端的内存里，只要关闭浏览器，此COOKIE就马上消失。默认值为-1。
//3、domain：指定可访问COOKIE的主机名。主机名是指同一个域名下的不同主机。如：www.google.com和gmail.google.com是在两个不同的主机上，即两个不同的主机名。默认情况下，一个主机中创建的COOKIE在另一个主机下是不能被访问，但可以通过domain参数来实现对其的控制，即所谓的跨子域。以google为例，要实现跨主机（跨子域）访问，写法如下：domain=.google.com，这样就实现了所有google.com下的主机都可以访问此COOKIE。（本机环境上设置此值时，COOKIE无法查看。）
//4、path：指定可访问此COOKIE的目录。如：path=/default  表示当前COOKIE仅能在 default 目录下使用。默认值为“/”，即根目录下的所有目录皆可以访问。
//5、secure：当设为true时，表示创建的COOKIE会以安全的形式向服务器传输，即只能在HTTPS连接中被浏览器传递到服务器端进行会话验证；若是HTTP连接则不会传递该信息，所以不会被窃取到COOKIE里的具体内容。同理，在客户端，我们也无法使用document.cookie找到被设置了secure=true的cookie健值对。secure属性是防止信息在传递的过程中被监听捕获后信息泄漏，httpOnly属性的目的是防止程序获取COOKIE后进行攻击（XSS）。我们可以把secure=true看成比httpOnly=true是更严格的访问控制。
//6、httpOnly：是微软对COOKIE做的扩展。如果在COOKIE中设置了“httpOnly”属性，则通过程序（JS脚本、applet等）将无法读取到COOKIE信息，防止XSS攻击产生。
//

//To clear the cookie:
//
//    res.clearCookie('cookiename');


//模板教程
//1. {% if (article.user) %}...{% else if (...) %}...{% else %}...{% endif %};       {% for tag in article.tags.split(',') %}...{% endfor %}
//2. {% set name = comment.user.name %}      {{ tag }}     {{ article.body }}
//3. {% include '../comments/form.html' %}
//4. 声明：{% block main %}{% endblock %}                 实现：{% extends '../layouts/default.html' %}   而后  {% block main %}<h1>{{ title }}</h1>{% endblock %}
//5. Unix 命令管道  {{ article.createdAt.toISOString()|date('M d, Y  h:m a') }}

//注意事项，发送idfv是openid 以及useragent = weixinWeb到后台接口服务器;   返回页面要刷一下模板就是渲染模板：res.render("pageName", paramsObj);    页面跳转： res.redirect("跳转路径");

exports.create = function (req, res, next) {

//    var username = req.body["username"] || "";
//    var email = common.Consts.REGEXP.isEmail.test(username) ? username : "";
//    var phone = common.Consts.REGEXP.isPhone.test(username) ? username : "";
//    var passwd = req.body["password"] || "";
//    var id = common.Consts.DB.NODE.user + common.Consts.Split
//        + utils.objectId("" + username + new Date().getTime(), 3);
//    var token = utils.token("" + username + passwd + new Date().getTime());
//    var nickname = req.body["name"] || username || "un-named";
//    var avatarUrl = req.body["avatar_url"] || "";
//    var aUser = new User({
//        _id: id,
//        un: username,
//        email: email,
//        phone: phone,
//        name: nickname,
//        tkn: token,
//        avatar_url: avatarUrl
//    });
//
//    aUser.password = passwd;
//
//    aUser.save(function (err) {
//        if (err) return next(err);
//        res.status(200).end(JSON.stringify({code: 0, token: token}));
//
//    });
    console.log(req.cookies['haha']);
    res.cookie('haha', 'name1=value1&name2=value2', {path: '/', httpOnly: true});
    res.render("query");
};

//exports.login = function (req, res, next) {
//
//    var username = req.body["email"] || req.body["phone"] || req.body["username"];
//    var passwd = req.body["password"] || "";
//    User.load({
//        criteria: {un: username},
//        select: "_id name salt tkn hashed_password"
//    }, function (err, user) {
//        if (err) return next(err);
//        if (!user) return next(new Error("您尚未注册"));
//        if (!user.authenticate(passwd)) return next(new Error("密码不正确"));
//
//        res.status(200).end(JSON.stringify({code: 0, token: user.tkn}));
//
//    });
//
//
//};
