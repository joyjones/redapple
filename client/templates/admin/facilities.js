/**
 * Created by jones on 16/5/21.
 */
Template.adminFacilities.onRendered(function(){
    let filter = Iron.Location.get().hash;
    if (filter && filter.length > 1) {
        $('#facilityFilter').val(filter.substr(1)).change();
    }
});

Template.adminFacilities.events({
    'click button.add'(){
        Router.go('admin.facilities.create');
    },
    'change #facilityFilter'(e){
        Session.set('admin.facilities.filter', e.target.value);
    }
});

Template.facilityRow.helpers({
    isVisible(){
        let filter = Session.get('admin.facilities.filter');
        if (!filter || !filter.length)
            return true;
        if (this._id.indexOf(filter) >= 0)
            return true;
        return this.addr.includes(filter);
    },
    getTypeName(type){
        const rec = FacilityTypes.findOne({type: Number(type)});
        if (rec)
            return rec.name;
        return "[unknown for ${type}]";
    },
    isSelected(){
        const fac = Session.get('admin.facilities.cursel');
        return fac != undefined && fac._id == this._id;
    },
    timeText(t){
        if (!t) return '';
        return moment(t).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
    },
    curTrayWeight(){
        if (!this.donating)
            return 0;
        return (Number(this.donating.weight) * 0.001).toFixed(3);
    },
    curTrayUser(){
        if (!this.donating || !this.donating.userId)
            return '';
        let user = Meteor.users.findOne(this.donating.userId);
        if (!user || !user.profile)
            return '<无效用户>';
        let imgs = '';
        let info = user.profile.wxinfo;
        if (info.headImageUrl)
            imgs = `<img src="${info.headImageUrl}" width="25">`;
        return imgs + info.nickname;
    },
    curDonateWeight(){
        if (!this.donation)
            return 0;
        return (Number(this.donation.weight) * 0.001).toFixed(3);
    },
    totalDonateWeight(){
        if (!this.donation)
            return 0;
        return (Number(this.donation.totalWeight) * 0.001).toFixed(3);
    },
    totalDonateCounter(){
        if (!this.donation)
            return 0;
        return Number(this.donation.counter);
    },
    curStatus(){
        let caption = FacilityStateNames[0];
        if (this.state > 0){
            caption = '';
            for (let i = 0; i < FacilityStateNames.length - 1; ++i){
                let n = 1 << i;
                if ((this.state & n) != 0) {
                    (caption.length > 0) && (caption += ', ');
                    caption += FacilityStateNames[i + 1];
                }
            }
        }
        return caption;
    }
});

Template.facilityRow.events({
    'click tr.facrow'(){
        Session.set('admin.facilities.cursel', this);
    },
    'click button.edit'(){
        Router.go('admin.facility', {_id: this._id});
    },
    'click button.remove'(){
        if (confirm('真的要删除当前选择的设备吗?')) {
            Facilities.remove(this._id);
            Session.set('admin.facilities.cursel', undefined);
        }
    }
});
