import { ReactiveVar } from 'meteor/reactive-var';
import '../imports/ui/app/app.js';
import '../imports/ui/admin/login.css';
import '../imports/ui/admin/login.html';
import '../imports/ui/admin/admin.js';
import '../imports/ui/admin/facilities.html';
import '../imports/ui/admin/donations.html';
import '../imports/ui/admin/analyse.html';

Router.route('/', function () {
    this.render('appPage');
    this.layout('appLayout');
}, {name: 'app'});

Router.route('/admin', function () {
    if (Meteor.userId()){
        this.render('adminPage');
        this.layout('adminLayout');
    }else{
        Router.go('/admin/login')
    }
}, {name: 'admin'});

Router.route('/admin/login', function () {
    this.render('loginPage');
}, {name: 'admin.login'});

Router.route('/admin/donation', function () {
    this.render('donationPage');
    this.layout('adminLayout');
}, {name: 'admin.donation'});

Router.route('/admin/facility', function () {
    this.render('facilityPage');
    this.layout('adminLayout');
}, {name: 'admin.facility'});

Router.route('/admin/facility/create', function () {
    this.render('facilityCreatePage');
    this.layout('adminLayout');
}, {name: 'admin.facility.create'});

Router.route('/admin/analyse', function () {
    this.render('analysePage');
    this.layout('adminLayout');
}, {name: 'admin.analyse'});
