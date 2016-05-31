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