/**
 * Created by Administrator on 2016/7/18.
 */

var vrv = vrv || {};
vrv.android = {};
vrv.jssdk = {};
vrv.util = {};
vrv._init = {};
vrv._ready = {};
vrv.android = {
    callback: function (fname, uuid, args) {
        try {
            if (vrv._init.debug) {
                alert(fname + ":" + args);
            }
            var fn = vrv.util.getSuccess(uuid);
            if (typeof fn == "function") {
                fn.call(this, JSON.parse(args));
            }
        } catch (e) {
            alert(e.message);
        }

    },
    takePhoto: function (opt) {
        android.takePhoto(vrv.util.pre(opt));
    },
    getUnreadMessage: function (opt) {
        android.getUnreadMessage(vrv.util.pre(opt));
    },
    getAccountInfo: function (opt) {
        android.getUserInfo(vrv.util.pre(opt));
    },
    sendMessage: function (opt) {
        android.sendMessage(vrv.util.pre(opt));
    },
    portraitUrl: function (opt) {
        android.portraitUrl(vrv.util.pre(opt));
    },
    getUserName: function (opt) {
        android.getUserName(vrv.util.pre(opt));
    },
    getContactList: function (opt) {
        android.getContacts(vrv.util.pre(opt));
    },
    getLocalFiles: function (opt) {
        opt = vrv.util.addSize(opt);
        android.getLocalFiles(vrv.util.pre(opt));
    },
    getGroupList: function (opt) {
        android.getGroupsInfo(vrv.util.pre(opt));
    },
    getLocalPhotos: function (opt) {
        opt = vrv.util.addSize(opt);
        android.getLocalPhotos(vrv.util.pre(opt));
    },
    getPosition: function (opt) {
        android.getPosition(vrv.util.pre(opt));
    },
    showNavigationBar: function (opt) {
        android.showNavigationBar(vrv.util.pre(opt));
    },
    getInfoWithSweep: function (opt) {
        android.getInfoWithSweep(vrv.util.pre(opt));
    },
    getOrganization: function (opt) {
        android.getOrganization(vrv.util.pre(opt));
    },
    closeView: function (opt) {
        android.closeView(vrv.util.pre(opt));
    },
    getLanguage: function (opt) {
        android.getLanguage(vrv.util.pre(opt));
    },
    getVersionMark: function (opt) {
        android.getVersionMark(vrv.util.pre(opt));
    }
};

vrv.ios = {
    callback: function (fname, uuid, args) {
        if (vrv._init.debug) {
            alert(fname + ":" + args);
        }
        var fn = vrv.util.getSuccess(uuid);
        if (typeof fn == "function") {
            fn.call(this, JSON.parse(args));
        }
    },
    takePhoto: function (opt) {
        vrv.util.callIOS('takePhoto', opt);
    },
    getUnreadMessage: function (opt) {
        vrv.util.callIOS('getUnreadMessage', opt);
    },
    getAccountInfo: function (opt) {
        vrv.util.callIOS('getUserInfo', opt);
    },
    sendMessage: function (opt) {
        vrv.util.callIOS('sendMessage', opt);
    },
    portraitUrl: function (opt) {
        vrv.util.callIOS('portraitUrl', opt);
    },
    getUserName: function (opt) {
        vrv.util.callIOS('getUserName', opt);
    },
    getContactList: function (opt) {
        vrv.util.callIOS('getContacts', opt);
    },
    getLocalFiles: function (opt) {
        opt = vrv.util.addSize(opt);
        vrv.util.callIOS('getLocalFiles', opt);
    },
    getGroupList: function (opt) {
        vrv.util.callIOS('getGroupsInfo', opt);
    },
    getLocalPhotos: function (opt) {
        opt = vrv.util.addSize(opt);
        vrv.util.callIOS('getLocalPhotos', opt);
    },
    getPosition: function (opt) {
        vrv.util.callIOS('getPosition', opt);
    },
    showNavigationBar: function (opt) {
        vrv.util.callIOS('showNavigationBar', opt);
    },
    getInfoWithSweep: function (opt) {
        vrv.util.callIOS('getInfoWithSweep', opt);
    },
    getOrganization: function (opt) {
        vrv.util.callIOS('getOrganization', opt);
    },
    closeView: function (opt) {
        vrv.util.callIOS('closeView', opt);
    },
    getLanguage: function (opt) {
        vrv.util.callIOS('getLanguage', opt);
    },
    getVersionMark: function (opt) {
        vrv.util.callIOS('getVersionMark', opt);
    }

};

vrv.util.addSize = function (opt) {
    return vrv.util.setDefault(opt, [{type: "number", key: "size", val: 10, min: 1, max: 15}]);
};

vrv.util._success = {};

vrv.util.putSuccess = function (uuid, callbackFn) {
    if (callbackFn && typeof callbackFn == 'function') {
        vrv.util._success[uuid] = callbackFn;

    }
};
vrv.util.getSuccess = function (uuid) {
    var fn = vrv.util._success[uuid];
    delete vrv.util._success[uuid];
    return fn;
};


vrv.util.formatParams = function (params) {
    if (!params) {
        params = {};
    }
    if (params.constructor !== Object) {
        params = {};
    }
    params.uuid = vrv.util.uuid();
    var obj = {p: JSON.stringify(params), uuid: params.uuid};
    return obj;
};

vrv.util.setDefault = function (obj, defaults) {
    if (!obj) {
        obj = {};
    }
    if (obj.constructor !== Object) {
        obj = {};
    }
    for (var i in defaults) {
        var d = defaults[i];
        if (typeof obj[d.key] != d.type) {
            obj[d.key] = d.val;
        }
        if (obj[d.key] > d.max || obj[d.key] < d.min) {
            obj[d.key] = d.val;
        }
    }
    return obj;
}

vrv.util.pre = function (opt) {
    var obj = vrv.util.formatParams(opt);
    if (opt) {
        vrv.util.putSuccess(obj.uuid, opt.success);
    }
    return obj.p;
};
vrv.util.callIOS = function (fname, opt) {
    var obj = vrv.util.formatParams(opt);
    var successFun = opt.success;

    var fun = function (res) {
        if (vrv._init.debug) {
            alert(fname + ":" + JSON.stringify(res));
        }
        successFun(res);
    }
    delete opt.success;

//    vrv.ios.bridge.callHandler(fname, opt, fun);
    window.WebViewJavascriptBridge.callHandler(fname, opt, fun);
};
vrv.util.uuid = function () {
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 36; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";

    var uuid = s.join("");
    return uuid;
};

vrv.init = function (options) {
    function connectWebViewJavascriptBridge(callback) {
        if (window.WebViewJavascriptBridge) {
            return callback(WebViewJavascriptBridge);
        }
        if (window.WVJBCallbacks) {
            return window.WVJBCallbacks.push(callback);
        }
        window.WVJBCallbacks = [callback];
        var WVJBIframe = document.createElement('iframe');
        WVJBIframe.style.display = 'none';
        WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
        document.documentElement.appendChild(WVJBIframe);
        setTimeout(function () {
            document.documentElement.removeChild(WVJBIframe)
        }, 0)
    }

    connectWebViewJavascriptBridge(function (bridge) {//
        bridge.init(function (message, responseCallback) {
            var data = {'Javascript Responds': 'Wee!'}
            responseCallback(data)
        });
        vrv.ios.bridge = bridge;
        if (typeof vrv._ready.fn == 'function') {
            vrv._ready.fn.call(this);
        } else {
            vrv._ready.r = true;
        }
    });
    vrv.jssdk = vrv.ios;
    if (options && options.constructor == Object) {
        vrv._init = options;
    }

};


vrv.ready = function (fn) {
    if (typeof fn == 'function') {
        if (vrv._ready.r) {
            fn.call(this);
        } else {
            vrv._ready.fn = fn;
        }
    }
};


