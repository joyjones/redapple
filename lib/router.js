/**
 * Created by jones on 16/5/20.
 */
Router.configure({
    loadingTemplate: 'loading',
    notFoundTemplate: 'notFound'
});

AppController = RouteController.extend({
    template: 'app',
    layoutTemplate: 'appLayout',
    waitOn: function(){
        return [
            Meteor.subscribe('allUserData'),
            Meteor.subscribe('facilityTypes'),
            Meteor.subscribe('userDonations', Meteor.userId())
        ]
    },
    onBeforeAction(){
        document.title = '我的红苹果捐赠';
        $("head meta[name='viewport']").remove();
        $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">');
        this.next();
    }
});

AdminController = RouteController.extend({
    layoutTemplate: 'adminLayout',
    onBeforeAction(){
        document.title = '红苹果捐赠管理中心';
        $("head meta[name='viewport']").remove();
        $('head').append('<meta name="viewport" content="width=device-width, initial-scale=1">');

        if (!Meteor.userId())
            Router.go('/admin/login');
        this.next();
    }
});

AdminLoginController = AdminController.extend({
    template: 'adminLogin',
    layoutTemplate: ''
});

AdminMainController = AdminController.extend({
    template: 'admin',
    waitOn: function(){
        return [
            Meteor.subscribe('allUserData'),
            Meteor.subscribe('facilities'),
            Meteor.subscribe('facilityTypes'),
            Meteor.subscribe('donations')
        ]
    }
});

AdminFacilitiesController = AdminMainController.extend({
    template: 'adminFacilities',
    data(){
        let me = this;
        return {
            facilities(){
                return Facilities.find({});
            }
        }
    }
});

AdminFacilityController = AdminMainController.extend({
    template: 'adminFacility'
});

AdminFacilitiesCreateController = AdminMainController.extend({
    template: 'adminFacility'
});

AdminDonationsController = AdminMainController.extend({
    template: 'adminDonations',
    data(){
        return {
            donations(){
                return Donations.find({}, {sort: {time: -1}});
            },
            users(){
                return Meteor.users.find({});
            }
        }
    }
});

AdminUsersController = AdminMainController.extend({
    template: 'adminUsers',
    data(){
        let me = this;
        return {
            users(){
                return Meteor.users.find({});
            }
        }
    }
});

Router.route('/', {name: 'app'});
Router.route('/admin', function () {
    Router.go('/admin/donations');
}, {name: 'admin'});
Router.route('/admin/login', {name: 'admin.login'});
Router.route('/admin/facilities', {name: 'admin.facilities'});
Router.route('/admin/facility/:_id', {
    name: 'admin.facility',
    data() { return Facilities.findOne(this.params._id); }
});
Router.route('/admin/facilities/create', {
    name: 'admin.facilities.create',
    data() { return {type: 1, addr: ''}; }
});
Router.route('/admin/donations', {name: 'admin.donations'});
Router.route('/admin/users', {name: 'admin.users'});
