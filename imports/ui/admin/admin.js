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

const state = new ReactiveDict("facilityPage");
const stateKey_selFacility = 'selFacility';
const stateKey_curFacility = 'curFacility';

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
    hasSelectedRow(){
        return state.get(stateKey_selFacility) != undefined;
    }
});

Template.facilityPage.events({
    'click button.add'(){
        state.set(stateKey_curFacility, {type: 1, addr: '', created_at: (new Date()).getTime()});
        Router.go('admin.facility.create');
    },
    'click button.modify'(){
        state.set(stateKey_curFacility, state.get(stateKey_selFacility));
        Router.go('admin.facility.modify');
    },
    'click button.remove'(){
        if (confirm('真的要删除当前选择的设备吗?')) {
            const fac = state.get(stateKey_selFacility);
            Facilities.remove(fac._id);
        }
    }
});

Template.facilityRow.helpers({
    getTypeName(type){
        const rec = FacilityTypes.findOne({type: Number(type)});
        if (rec)
            return rec.name;
        return "[unknown for ${type}]";
    },
    isSelected(){
        const fac = state.get(stateKey_selFacility);
        return fac != undefined && fac._id == this._id;
    }
});

Template.facilityRow.events({
    'click tr.facrow'(){
        state.set(stateKey_selFacility, this);
    }
});

Template.facilityForm.events({
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
        if (Router.name == 'admin.facility.modify')
            Facilities.update(this._id, {$set: {type: type, addr: addr, created_at: (new Date()).getTime()}});
        else
            Facilities.insert({type: type, addr: addr, created_at: (new Date()).getTime()});
        Router.go('admin.facility');
        return false;
    }
});

Template.facilityForm.helpers({
    curModel(){
        return state.get(stateKey_curFacility);
    },
    createMode(){
        return (Router.name == 'admin.facility.create');
    },
    modifyMode(){
        return (Router.name == 'admin.facility.modify');
    },
    types(){
        return FacilityTypes.find({});
    },
    isCurType(type){
        const fac = state.get(stateKey_selFacility);
        return fac != undefined && fac.type == type;
    }
});