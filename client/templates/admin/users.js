/**
 * Created by jones on 16/5/22.
 */
Template.adminUsers.onRendered(function(){
    let filter = Iron.Location.get().hash;
    if (filter && filter.length > 1) {
        $('#userFilter').val(filter.substr(1)).change();
    }
});

Template.adminUsers.events({
    'change #userFilter'(e){
        Session.set('admin.users.filter', e.target.value);
    }
});

Template.userRow.helpers({
    isVisible(){
        let filter = Session.get('admin.users.filter');
        if (!filter || !filter.length)
            return true;
        if (this._id.indexOf(filter) >= 0)
            return true;
        if (this.profile.wxinfo.nickname.includes(filter))
            return true;
        return false;
    },
    userInfo(){
        let imgs = '';
        let info = this.profile.wxinfo;
        if (info.headimgurl)
            imgs = `<img src="${info.headimgurl}" width="25">`;
        return imgs + info.nickname + "(" + this._id + ")";
    },
    userType(){
        return '捐赠用户';
    },
    sexType(){
        let sex = this.profile.wxinfo.sex;
        return sex == 0 ? '未知' : (sex == 1 ? '男' : '女');
    },
    comeFrom(){
        let info = this.profile.wxinfo;
        let place = info.province;
        if (place != info.city)
            place += info.city;
        return info.country + place;
    },
    registerTime(){
        return moment(this.createdAt).format('YYYY-MM-DD HH:mm:ss');
    },
    donateCount(){
        return this.profile.donation ? this.profile.donation.counter : 0;
    },
    accWeight(){
        return this.profile.donation ? (this.profile.donation.totalWeight * 0.001).toFixed(3) : 0;
    },
    lastDonateTime(){
        if (this.profile.donation)
            return moment(this.profile.donation.latestTime).format('YYYY-MM-DD HH:mm:ss');
        return '-';
    },
    isSelected(){
        const fac = Session.get('admin.users.cursel');
        return fac != undefined && fac._id == this._id;
    }
});

Template.userRow.events({
    'click tr.donrow'(){
        Session.set('admin.users.cursel', this);
    }
});
