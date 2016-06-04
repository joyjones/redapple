/**
 * Created by jones on 16/5/22.
 */
Template.app.helpers({
    userHead(){
        let info = Session.get(STORAGEKEY_USERINFO);
        return info ? info.headimgurl : '';
    },
    userName(){
        let info = Session.get(STORAGEKEY_USERINFO);
        return info ? info.nickname : '';
    },
    curWeight(){
        return 0;
    },
    totalWeight(){
        return 0;
    }
});

Template.app.events({
    'click .nav-tabs a'(e){
        $(e.target).tab('show');
    },
    'onload body'(){
        $(this).css({});
    }
});

const weixin = {
    debug: window.location.href.indexOf('localhost') >= 0,
    info: {
        title: '红苹果慈善捐助',
        desc: '红苹果慈善捐助, 感谢大家每一份热心',
        imgUrl: 'http://7xj9u3.com1.z0.glb.clouddn.com/redapple/logo_admin0.jpg?imageView2/2/w/50/h/50'
    },
    fillShare(info) {
        wx.onMenuShareAppMessage(info);
        wx.onMenuShareTimeline(info);
    },
    login(callbk){
        let me = this;
        if (me.debug){
            Session.set(STORAGEKEY_USERINFO, {"nickname":"李志勇","sex":1,"country":"中国","province":"北京","city":"北京","headImageUrl":"http://7xj9u3.com1.z0.glb.clouddn.com/redapple/logo_admin0.jpg?imageView2/2/w/50/h/50"});
            callbk && callbk();
            return;
        }
        let sesId = localStorage.getItem(STORAGEKEY_SESID);
        $.ajax({
            url: 'http://a.muwu.net/api/weixin/login?sid=' + sesId,
            dataType: 'json',
            error(r, s, e){
                console.log(s, e);
                alert('访问微信登陆接口失败！');
                me.authorize();
            },
            success(resp){
                if (!resp.success)
                    me.authorize();
                else{
                    localStorage.setItem(STORAGEKEY_USERINFO, JSON.stringify(resp.data));
                    Session.set(STORAGEKEY_USERINFO, resp.data);
                    callbk && callbk();
                }
            }
        })
    },
    init(callbk){
        if (this.debug) return;
        $.ajax({
            url: 'http://a.muwu.net/api/weixin/sign',
            dataType: 'json',
            error(r, s, e){
                console.log(s, e);
                alert('访问微信入口功能失败！');
            },
            success(resp){
                wx.ready(function () {
                    weixin.fillShare($.extend({}, weixin.info, {
                        type: 'link',
                        link: window.location.href,
                        success: function() {
                            // $.ajax({
                            //     url: getLocalUrl() + 'signup.php?act=record&field=shared_count',
                            // });
                        }
                    }));
                    callbk && callbk();
                });

                wx.config({
                    debug: false,
                    appId: resp.appId,
                    timestamp: resp.timestamp,
                    nonceStr: resp.nonceStr,
                    signature: resp.signature,
                    jsApiList: [
                        'onMenuShareAppMessage',
                        'onMenuShareTimeline',
                    ]
                });
            }
        });

        wx.error(function (res) {
            // alert('微信接口错误:' + res.errMsg);
        });
    },
    authorize: function(){
        let sesId = localStorage.getItem(STORAGEKEY_SESID);

        var url = "https://open.weixin.qq.com/connect/oauth2/authorize";
        url += "?appid=wxead90fdd2f6847ff";
        url += "&redirect_uri=";
        url += encodeURIComponent("http://a.muwu.net/api/weixin/authorize?sid=" + sesId);
        url += "&response_type=code&scope=snsapi_userinfo";
        url += "&state=0";
        url += "#wechat_redirect";
        window.location.href = url;
    }
};

Template.app.onCreated(function(){
    if (!localStorage.getItem(STORAGEKEY_SESID)) {
        localStorage.setItem(STORAGEKEY_SESID, Meteor.connection._lastSessionId);
    }
    setTimeout(function () {
        weixin.login(function(){
            weixin.init(function(){
                console.log('wx sign ok!');
            });
        });
    }, 1000);
});
//http://a.muwu.net/api/weixin/authorize?sid=HjrCPa3Wvogtxbcf8&code=021BcmnU1MEsB918vepU1nKinU1Bcmnu&state=0