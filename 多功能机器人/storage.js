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
    //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊慎重修改＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
    this.key = "xUt9PvqiAMiBTVq4";//修改此项会导致数据库以前存储过的密码不可用
    //＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊＊
    this.timedTask = false;
    this.timeoutTime = 10;//定时收取间隔（分钟）
    this.Interval = null;
};