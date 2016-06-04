/**
 * Created by jones on 16/5/22.
 */
Template.app.helpers({
    curWeight(){
        return 437;
    },
    totalWeight(){
        let n = localStorage.getItem('id');
        return n + ' kg';
    }
});

Template.app.events({
    'click .nav-tabs a'(e){
        $(e.target).tab('show');

        localStorage.setItem('id', Meteor.connection._lastSessionId);
    },
    'onload body'(){
        $(this).css({});
    }
});

const weixin = {
    debug: false,
    info: {
        title: '百色熊墙面光泽大作战',
        desc: '涂料分光泽，墙面有光彩，挑战游戏，赢取百色熊好礼！',
        imgUrl: 'http://behr.sinaapp.com/paint/images/logo.jpg'
    },
    fillShare(info) {
        wx.onMenuShareAppMessage(info);
        wx.onMenuShareTimeline(info);
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
        let sesId = localStorage.getItem(SESSION_KEY);

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
    if (!localStorage.getItem(SESSION_KEY)) {
        localStorage.setItem(SESSION_KEY, Meteor.connection._lastSessionId);
    }
    setTimeout(function () {
        //weixin.init(function(){
        //    console.log('wx sign ok!');
        //});
        weixin.authorize();
    }, 1000);
});
//http://a.muwu.net/api/weixin/authorize?sid=null&code=0117U5o52SN5TH0A3Qq52758o527U5on&state=0