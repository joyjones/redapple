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
        if (this.wxinfo.nickname.includes(filter))
            return true;
        return false;
    },
    userInfo(){
        let imgs = '';
        if (this.wxinfo.headImageUrl)
            imgs = `<img src="${this.wxinfo.headImageUrl}" width="25">`;
        return imgs + this.wxinfo.nickname + "(" + this._id.substr(0, 4) + ")";
    },
    userType(){
        return '捐赠用户';
    },
    sexType(){
        return this.wxinfo.sex == 0 ? '未知' : (this.wxinfo.sex == 1 ? '男' : '女');
    },
    comeFrom(){
        let place = this.wxinfo.province;
        if (place != this.wxinfo.city)
            place += this.wxinfo.city;
        return this.wxinfo.country + place;
    },
    registerTime(){
        return moment(this.createdAt).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss');
    },
    donateCount(){
        return 0;
    },
    accWeight(){
        return 0;
    },
    lastDonateTime(){
        //return moment(t).format('YYYY-MM-DD HH:mm:ss');
        return '';
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
