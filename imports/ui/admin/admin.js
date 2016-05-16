/**
 * Created by jones on 16/5/15.
 */
import './admin.css';
import './admin.html';
import './layout.css';
import './layout.html';
import './facilities.html';
import './donations.html';
import './analyse.html';
import { Facilities, FacilityTypes } from '../../api/facilities.js';
import { ReactiveDict } from 'meteor/reactive-dict';

Template.loginPage.helpers({
    errorMessage(){
        return Session.get('errorMessage');
    }
});

Template.loginPage.events({
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

Template.facilityPage.helpers({
    facilities(){
        return Facilities.find({});
    },
    isRowSelected(){
        return $('tr.facrow.selected').length > 0;
    },
    modifyButtonState(){
        const idx = Template.instance().curRowIndex();
        return idx >= 0 ? '' : 'disabled';
    },
    getTypeName(type){
        const rec = FacilityTypes.findOne({type: Number(type)});
        if (rec)
            return rec.name;
        return "[unknown for ${type}]";
    }
});

const state = new ReactiveDict("facilityPage");

Template.facilityPage.onCreated(function(){
    this.state = state;
    this.selectRow = function(index){
        state.set('selrow', index);
    };
    this.curRowIndex = function(){
        return state.get('selrow');
    };
    this.selectRow(-1);
});

Template.facilityPage.events({
    'click button.add'(){
        Router.go('admin.facility.create');
    },
    'click button.modify'(){
        Router.go('admin.facility.modify');
    },
    'click button.remove'(){
        if (confirm('真的要删除当前选择的设备吗?')){
            let idx = Template.instance().curRowIndex() + 1;
            let id = $('tr.facrow:nth-child('+idx+') td').eq(0).html();
            Facilities.remove(id);
        }
    },
    'click tr.facrow'(event){
        const inst = Template.instance();
        let idx = inst.curRowIndex();
        if (idx >= 0)
            $('tr.facrow').eq(idx).removeClass('selected');
        idx = event.target.parentNode.rowIndex - 1;
        $('tr.facrow').eq(idx).addClass('selected');
        inst.selectRow(idx);
    }
});

Template.facilityCreatePage.events({
    'submit form'(event){
        var type = event.target.fac_type.value;
        var addr = event.target.fac_addr.value;
        if (!type) {
            alert('type err');
            return false;
        }
        if (!addr || !addr.length) {
            alert('addr err');
            return false;
        }
        Facilities.insert({type: type, addr: addr, created_at: (new Date()).getTime()});
        Router.go('admin.facility');
        return false;
    }
});