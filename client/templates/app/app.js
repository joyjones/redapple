/**
 * Created by jones on 16/5/22.
 */
Template.app.helpers({
    userHead(){
        if (weixin.debug)
            return 'img/head.jpg';
        let info = Meteor.user() ? Meteor.user().profile : null;
        return info ? info.wxinfo.headimgurl : '';
    },
    userName(){
        let info = Meteor.user() ? Meteor.user().profile : null;
        return info ? info.wxinfo.nickname : '';
    },
    curWeight(){
        let info = Meteor.user() ? Meteor.user().profile : null;
        if (info && info.donating && Session.get('tabIndex') == 0)
            Session.set('tabIndex', 1);
        return (info && info.donating) ? (info.donating.weight * 0.001).toFixed(3) : 0;
    },
    totalWeight(){
        let info = Meteor.user() ? Meteor.user().profile : null;
        let g = (info && info.donation) ? info.donation.totalWeight : 0;
        let cacheWeight = Session.get('totalWeight');
        if (cacheWeight != g){
            Session.set('totalWeight', g);
            Session.set('totalWeightChanged', true);
        }
        return (g * 0.001).toFixed(3);
    },
    areaClsCurWeight(){
        let info = Meteor.user() ? Meteor.user().profile : null;
        if (info && info.donating && Session.get('tabIndex') == 1)
            return '';
        return 'hidden';
    },
    areaClsHistory(){
        if (Session.get('tabIndex') == 1)
            return 'hidden';
        return '';
    },
    tabClsCurWeight(){
        let info = Meteor.user() ? Meteor.user().profile : null;
        if (!info || !info.donating){
            Session.set('tabIndex', 2);
            return 'disabled';
        }
        if (info && info.donating && Session.get('tabIndex') == 1)
            return 'selected';
        return '';
    },
    tabClsHistory(){
        if (Session.get('tabIndex') == 1)
            return '';
        return 'selected';
    },
    donations(){
        return Session.get('myDonations');
    },
    donateLocation(){
        let info = Meteor.user() ? Meteor.user().profile : null;
        return (info && info.donating) ? info.donating.location : '';
    },
    donateTime(){
        let info = Meteor.user() ? Meteor.user().profile : null;
        return (info && info.donating) ? info.donating.time : '';
    },
    getTypeName(type, fid){
        let ft = FacilityTypes.findOne({type: Number(type)});
        let fi = fid.substr(0, 5).toUpperCase();
        return ft.name + fi;
    }
});

Template.app.events({
    'click .tabbar .item.item-this'(e){
        let info = Meteor.user() ? Meteor.user().profile : null;
        if (info && info.donating){
            Session.set('tabIndex', 1);
        }
    },
    'click .tabbar .item.item-history'(e){
        Session.set('tabIndex', 2);
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
        let facId = window.location.search.substr(1).split('&')[0].split('=')[1];

        var url = "https://open.weixin.qq.com/connect/oauth2/authorize";
        url += "?appid=wxead90fdd2f6847ff";
        url += "&redirect_uri=";
        url += encodeURIComponent(this.baseUrl + `api/weixin/authorize?sid=${sesId}&facility_id=${facId}`);
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
    Session.set('tabIndex', 0);

    let facId = window.location.search.substr(1).split('&')[0].split('=')[1];
    let userId = weixin.debug ? '4AcNGdYKLKwurhoX2' : Meteor.userId();
    Session.set('totalWeightChanged', true);
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
                    if (resp.status == 'success'){
                        Session.set('tabIndex', 1);
                    }
                }
            });
            setInterval(function () {
                if (!Session.get('totalWeightChanged'))
                    return;
                Session.set('totalWeightChanged', false);
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
            }, 500);
        });
    }, 1000);
});
