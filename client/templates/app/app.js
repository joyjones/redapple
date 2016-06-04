/**
 * Created by jones on 16/5/22.
 */
Template.app.helpers({
    userHead(){
        let info = Meteor.user() ? Meteor.user().profile : null;
        return info ? info.wxinfo.headimgurl : '';
    },
    userName(){
        let info = Meteor.user() ? Meteor.user().profile : null;
        return info ? info.wxinfo.nickname : '';
    },
    curWeight(){
        let info = Meteor.user() ? Meteor.user().profile : null;
        return (info && info.donating) ? info.donating.weight : 0;
    },
    totalWeight(){
        let info = Meteor.user() ? Meteor.user().profile : null;
        let g = (info && info.donation) ? info.donation.totalWeight : 0;
        return (g * 0.001) + 'kg';
    },
    tabClsCurr(){
        let cls = Session.get('tabindex') === 1 ? '' : 'active ';
        let info = Meteor.user() ? Meteor.user().profile : null;
        return cls + ((info && info.donating) ? '' : 'hidden');
    },
    tabClsHistory(){
        let cls = Session.get('tabindex') === 1 ? 'active' : '';
        return cls;
    },
    donations(){
        return Session.get('myDonations');
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
    baseUrl: window.location.href.indexOf('localhost') >= 0 ? 'http://localhost:3000/' : 'http://a.muwu.net/',
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
            me.fillUser('wuxiaotan@admin.com', 'admin.Wuxiaotan', callbk);
            return;
        }
        let sesId = localStorage.getItem(STORAGEKEY_SESID);
        $.ajax({
            url: me.baseUrl + 'api/weixin/login?sid=' + sesId,
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
                    me.fillUser(resp.account, resp.password, callbk);
                }
            }
        })
    },
    fillUser(acc, psw, callbk){
        Meteor.loginWithPassword(acc, psw, function(err){
            if(err)
                Session.set('errorMessage', err.message);
            else{
                let info = Meteor.user().profile;
                if (!info.donating)
                    Session.set('tabindex', 1);
                callbk && callbk();
            }
        });
    },
    init(callbk){
        if (this.debug) return;
        $.ajax({
            url: this.baseUrl + 'api/weixin/sign',
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
        url += encodeURIComponent(this.baseUrl + "api/weixin/authorize?sid=" + sesId);
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
    let facId = window.location.search.substr(1).split('&')[0].split('=')[1];
    let userId = Meteor.userId();
    setTimeout(function () {
        weixin.login(function(){
            weixin.init(function(){
                console.log('wx sign ok!');
            });
            $.ajax({
                url: weixin.baseUrl + `api/facility/bind-user?user_id=${userId}&facility_id=${facId}`,
                dataType: 'json',
                type: 'put',
                error(r, s, e){
                    console.log(s, e);
                },
                success(resp){
                    console.log(resp);
                }
            });
            $.ajax({
                url: weixin.baseUrl + `api/donation/history?user_id=${userId}`,
                dataType: 'json',
                error(r, s, e){
                    console.log(s, e);
                },
                success(resp){
                    console.log(resp);
                    Session.set('myDonations', resp);
                }
            });
        });
    }, 1000);
});
