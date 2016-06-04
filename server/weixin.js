/**
 * Created by jones on 16/5/31.
 */

const appId = 'wxead90fdd2f6847ff';
const appSecret = 'b4f4b32e8793030b6528f446fe42555c';

const weixin = {
    getSignPackage() {
        let ticket = this.getJsApiTicket();
        let url = Meteor.absoluteUrl();

        let timestamp = new Date().getTime();
        let nonceStr = this.createNonceStr();

        // 这里参数的顺序要按照 key 值 ASCII 码升序排序
        let str = `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`;
        let signature = CryptoJS.SHA1(str).toString();
        return {
            appId: appId,
            nonceStr: nonceStr,
            timestamp: timestamp,
            url: url,
            signature: signature,
            rawString: str
        };
    },
    createNonceStr(length = 16) {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let str = "";
        for (let i = 0; i < length; i++) {
            str += chars.substr(Math.floor(Math.random() * chars.length), 1);
        }
        return str;
    },
    getJsApiTicket() {
        let rec = Storage.findOne();
        let wxrec = rec.weixin;
        if (!wxrec.jsApiTicket || wxrec.jsApiTicket.expireTime < new Date().getTime()) {
            let accessToken = this.getAccessToken();
            if (!accessToken)
                return null;
            let res = HTTP.get(`https://api.weixin.qq.com/cgi-bin/ticket/getticket?type=jsapi&access_token=${accessToken}`);
            if (!res.data.ticket)
                return null;
            wxrec.jsApiTicket = {
                expireTime: new Date().getTime() + 7000 * 1000,
                ticket: res.data.ticket
            };
            Storage.update({_id: rec._id}, {$set: {'weixin.jsApiTicket': wxrec.jsApiTicket}});
        }
        return wxrec.jsApiTicket.ticket;
    },
    getAccessToken() {
        let rec = Storage.findOne();
        let wxrec = rec.weixin;
        let t = new Date().getTime();
        if (!wxrec.accessToken || wxrec.accessToken.expireTime < t) {
            let resp = HTTP.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`);
            if (!resp.data.access_token)
                return null;
            wxrec.accessToken = {
                expireTime: new Date().getTime() + 7000 * 1000,
                token: resp.data.access_token
            };
            Storage.update({_id: rec._id}, {$set: {'weixin.accessToken': wxrec.accessToken}});
        }
        return wxrec.accessToken.token;
    },
    login(sid) {
        let user = Meteor.users.findOne({'profile.lastSessionId': sid});
        if (user)
            return user.profile.wxinfo;
        return null;
    },
    authorize(code, sesId, router) {
        const ERRHEAD = `FAILED WX AUTHORIZATION: code=${code}, sessionId=${sesId}<br>`;
        if (!code || !sesId)
            return ERRHEAD;

        const urls = {
            authorization_code: 'https://api.weixin.qq.com/sns/oauth2/access_token',
            client_credential: 'https://api.weixin.qq.com/cgi-bin/token',
            userinfo: 'https://api.weixin.qq.com/sns/userinfo'
        };
        let url = urls.authorization_code;
        url += "?grant_type=authorization_code";
        url += `&appid=${appId}`;
        url += `&secret=${appSecret}`;
        url += `&code=${code}`;
        let resp = HTTP.get(url);
        if (!resp || !resp.content)
            return ERRHEAD + 'got null in step1';
        resp = JSON.parse(resp.content);
        if (resp.errcode > 0)
            return ERRHEAD + resp.errmsg;

        url = urls.userinfo;
        url += "?access_token=" + resp.access_token;
        url += "&openid=" + resp.openid;
        url += "&lang=zh_CN";
        let info = HTTP.get(url);
        if (!info || !info.content)
            return ERRHEAD + 'got null in step2';
        info = JSON.parse(info.content);
        if (info.errcode > 0)
            return ERRHEAD + resp.errmsg;

        let user = Meteor.users.findOne({'profile.wxinfo.openid': info.openid});
        if (!user) {
            user = {
                _id: Accounts.createUser({
                    username: info.nickname,
                    email: sid + '@redapple.com',
                    password: sid,
                    profile: {
                        wxinfo: info,
                        lastSessionId: sid
                    }
                })
            };
        }
        Meteor.users.update({_id: user._id}, {$set: {'profile.lastSessionId': sid}});

        router.response.writeHead(301, {
            'Location': 'http://a.muwu.net'
        });
        router.response.end();
        return null;
    }
};

let api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
});
api.addRoute('weixin/sign', {authRequired: false}, {
    get: function () {
        return weixin.getSignPackage();
    }
});
api.addRoute('weixin/authorize', {authRequired: false}, {
    get: function () {
        var code = this.queryParams.code;
        var sid = this.queryParams.sid;
        var err = weixin.authorize(code, sid, this);
        if (err) return err;
        return {};
    }
});
api.addRoute('weixin/login', {authRequired: false}, {
    get: function () {
        var sid = this.queryParams.sid;
        return weixin.login(sid);
    }
});
