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
            Meteor.subscribe('facilityTypes'),
            Meteor.subscribe('userDonations', Meteor.userId())
        ]
    }
});

AdminController = RouteController.extend({
    layoutTemplate: 'adminLayout',
    onBeforeAction(){
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
                return Donations.find({});
            }
        }
    }
});

Router.route('/', {name: 'app'});
Router.route('/admin', function () {
    Router.go('/admin/facilities');
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

//Router.route('/admin/login', function () {
//    this.render('loginPage');
//}, {name: 'admin.login'});
//
//Router.route('/admin/donation', function () {
//    this.render('donationPage');
//    this.layout('adminLayout');
//}, {name: 'admin.donation'});
//
//Router.route('/admin/facility', function () {
//    this.render('facilityPage');
//    this.layout('adminLayout');
//}, {name: 'admin.facility'});
//
//Router.route('/admin/facility/create', function () {
//    this.render('facilityForm');
//    this.layout('adminLayout');
//}, {name: 'admin.facility.create'});
//
//Router.route('/admin/facility/modify', function () {
//    this.render('facilityForm');
//    this.layout('adminLayout');
//}, {name: 'admin.facility.modify'});
//
//Router.route('/admin/analyse', function () {
//    this.render('analysePage');
//    this.layout('adminLayout');
//}, {name: 'admin.analyse'});
