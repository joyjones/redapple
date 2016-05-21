/**
 * Created by jones on 16/5/21.
 */
Template.adminDonations.events({
});

Template.donationRow.helpers({
    isSelected(){
        const fac = Session.get('admin.donations.cursel');
        return fac != undefined && fac._id == this._id;
    },
    timeText(t){
        if (!t) return '';
        return moment(t).format('YYYY-MM-DD HH:mm:ss');
    },
    g2kg(g){
        if (!g) return 0;
        return Number(g) * 0.001;
    }
});

Template.donationRow.events({
    'click tr.donrow'(){
        Session.set('admin.donations.cursel', this);
    }
});
