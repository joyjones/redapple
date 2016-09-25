/**
 * Created by jones on 16/5/22.
 */

if (Meteor.isServer) {

    // Global API configuration
    let api = new Restivus({
        enableCors: true,
        useDefaultAuth: false,
        prettyJson: true
    });

    api.addCollection(Meteor.users);

    api.addRoute('initialize', {authRequired: false}, {
        get: function () {
            const adminLogo = 'http://7xj9u3.com1.z0.glb.clouddn.com/redapple/logo_admin0.jpg?imageView2/2/w/50/h/50';
            const admins = [
                { username: 'hejian', email: 'hejian@admin.com', password: 'admin.Hejian', profile: {
                    wxinfo: { nickname:'何剑', sex: 1, country: '中国', province: '北京', city: '北京', headImageUrl: adminLogo }
                } },
                { username: 'lizhiyong', email: 'lizhiyong@admin.com', password: 'admin.Lizhiyong', profile: {
                    wxinfo: { nickname: '李志勇', sex: 1, country: '中国', province: '北京', city: '北京', headImageUrl: adminLogo }
                } },
                { username: 'wuxiaotan', email: 'wuxiaotan@admin.com', password: 'admin.Wuxiaotan', profile: {
                    wxinfo: {nickname:'吴晓潭', sex: 1, country: '中国', province: '北京', city: '北京', headImageUrl: adminLogo }
                } }
            ];
            admins.forEach(function(info){
                if (!Accounts.findUserByEmail(info.email)) {
                    Accounts.createUser(info);
                }
            });
            FacilityTypes.remove({});
            FacilityTypes.insert({type: 1, name: '红苹果捐赠机'});
            return {status: 'success', data: {message: 'proceeded over.'}};
        }
    });
}