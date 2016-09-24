/**
 * Created by jones on 16/5/21.
 */
Template.adminLogin.helpers({
    errorMessage(){
        return Session.get('errorMessage');
    }
});

Template.adminLogin.events({
    'submit .login-form'(event) {
        event.preventDefault();
        var email = event.target.email.value;
        var password = event.target.password.value;
        if (!email || !email.length)
            Session.set('errorMessage', '请正确填写您的账号(邮箱).');
        else if (!password || !password.length)
            Session.set('errorMessage', '请填写您的密码.');
        else
            Meteor.loginWithPassword(email,password,function(err){
                if(!err) {
                    Router.go('/admin');
                }else{
                    Session.set('errorMessage', err.message);
                }
            });
    }
});