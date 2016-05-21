/**
 * Created by jones on 16/5/21.
 */
Template.adminFacilities.helpers({
});

Template.adminFacilities.events({
    'click button.add'(){
        Router.go('admin.facilities.create');
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
        const fac = Session.get('admin.facilities.cursel');
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
