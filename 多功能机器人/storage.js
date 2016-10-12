"use strict";
module.exports = function() {
    this.admin="4328631772";//管理员豆豆号
    this.access_token ="-jhO9b6XQFyg963BZte5KJBH1IW5x6ynGzFrquN706gXCLs6_QjfnerQnxvIv8mnalbvubn513KTh0XdT6OFZRLwiuDqL_bO7GmTfVJF0zc&device_type=2";
    this.tuLingHost= "www.tuling123.com";
    this.tuLingPath = "/openapi/api?key=bb1b96a394b19b8ce2c61cf32c64d695&userid=";
    this.needToBind = "你还没有绑定邮箱\r\n绑定邮箱请回复您的邮箱账号##您的邮箱专属密码\r\n例：123456@qq.com##123456789";
    this.howToBind = "绑定邮箱请回复您的邮箱账号##您的邮箱专属密码\r\n例：123456@qq.com##123456789";//如何绑定邮箱
    this.mailboxFormatIsNotCorrect = "邮箱格式不正确\r\n绑定邮箱请回复您的邮箱账号##您的邮箱专属密码\r\n例：123456@qq.com##123456789";//如何绑定邮箱
    this.qqAuthorizedCode = "Please using authorized code to login";//qq专属密码
    this.qqAuthorized = "为了保障您的QQ密码安全我们不要您输入QQ密码，请使用邮箱专用密码登录，我们会对密码信息加密保存，关于邮箱专属密码获取方式请参照http://suo.im/tmpni";//qq专属密码
    this.releaseAssociatedError = "解除关联发生错误，请联系管理员";//解除关联错误
    this.releaseAssociatedOK = "成功解除关联！";//解除关联成功
    this.command = "豆豆小秘书目前支持的互动有\r\n1.讲个故事/笑话/脑筋急转弯/歇后语/绕口令/顺口溜\r\n2.成语接龙一诺千金\r\n3.周杰伦这个名字好不好\r\n4.今日新闻\r\n5.双子座的运势\r\n6.黑洞的简介\r\n7.北京天气\r\n8.鱼香肉丝怎么做\r\n9.查询快递123456789\r\n10.3乘以3是多少\r\n11.今天北京到上海的飞机/火车\r\n12.今天农历多少\r\n13.天为什么是蓝的\r\n14.苹果的单词是什么\r\n15.海南芒果/北京汽油的价格\r\n16.最近热门电影\r\n17.腾讯股票\r\n18.天安门到王府井的公交有哪些\r\n19.从清华大学到天安门多少钱\r\n20.北京的邮编";
    //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊慎重修改＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
    this.key = "xUt9PvqiAMiBTVq4";//修改此项会导致数据库以前存储过的密码不可用
    //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
    this.timedTask = false;
    this.timeoutTime = 10;//定时收取间隔（分钟）
    this.Interval = null;
};