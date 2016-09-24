/**
 * Created by jones on 16/5/21.
 */
const utils = {
    facilityName(id){
        let fac = id ? Facilities.findOne(id) : null;
        if (!fac)
            return '<无效设备>';
        let t = FacilityTypes.findOne({type: Number(fac.type)});
        let ids = id.substr(0, 4);
        return `${t.name}(${ids})-${fac.addr}`;
    }
};

Template.adminDonations.helpers({
    facilityFilters(){
        let lst = [{_id: 'all', name: '(全部)'}];
        Facilities.find({}).forEach(function(fac){
            lst.push({_id: fac._id, name: utils.facilityName(fac._id)});
        });
        return lst;
    },
    isCurFacilityFilter(){
        return Session.get('admin.donations.filterFacility') === this._id;
    }
});

Template.adminDonations.events({
    'change #filterFacility'(e){
        Session.set('admin.donations.filterFacility', e.target.value);
    },
    'change #filterUser'(e){
        Session.set('admin.donations.filterUser', e.target.value);
    }
});


Template.donationRow.helpers({
    isVisible(){
        let facId = Session.get('admin.donations.filterFacility');
        let userKey = Session.get('admin.donations.filterUser');
        if (facId && facId != 'all' && this.facilityId != facId)
            return false;
        if (userKey && userKey.length > 0) {
            let user = Meteor.users.findOne(this.userId);
            let hitId = user._id.includes(userKey);
            let hitName = user.profile.wxinfo.nickname.includes(userKey);
            if (!hitId && !hitName)
                return false;
        }
        return true;
    },
    isSelected(){
        const fac = Session.get('admin.donations.cursel');
        return fac != undefined && fac._id == this._id;
    },
    timeText(){
        if (!this.time) return '';
        return moment(this.time).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
    },
    facilityName(){
        return utils.facilityName(this.facilityId);
    },
    userName(){
        if (!this.userId)
            return '<匿名用户>';
        let user = Meteor.users.findOne(this.userId);
        if (!user || !user.profile || !user.profile.wxinfo)
            return '<无效用户>';
        let imgs = '';
        let info = user.profile.wxinfo;
        if (info.headImageUrl)
            imgs = `<img src="${info.headImageUrl}" width="25">`;
        let name = info.nickname;
        let id = this.userId;
        return `<a href="/admin/users#${id}">${imgs}${name}</a>`;
    },
    weight2kg(){
        if (!this.weight) return 0;
        return (Number(this.weight) * 0.001).toFixed(3);
    }
});

Template.donationRow.events({
    'click tr.donrow'(){
        Session.set('admin.donations.cursel', this);
    }
});
