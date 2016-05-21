/**
 * Created by jones on 16/5/21.
 */

Template.adminFacility.events({
    'submit form'(event){
        let type = event.target.fac_type.value;
        let addr = event.target.fac_addr.value;
        if (!type) {
            alert('请选择类型');
            return false;
        }
        if (!addr || !addr.length) {
            alert('请填写所在地');
            return false;
        }
        let url = Router.current().route.getName();
        if (url == 'admin.facility') {
            Facilities.update(this._id, {$set: {type: type, addr: addr}}, function (error) {
                error && alert(error.reason);
            });
        }
        else {
            Facilities.insert({type: type, addr: addr, createdAt: (new Date()).getTime()}, function(error) {
                error && alert(error.reason);
            });
        }
        Router.go('admin.facilities');
        return false;
    }
});

Template.adminFacility.helpers({
    createMode(){
        return (Router.current().route.getName() == 'admin.facilities.create');
    },
    types(){
        return FacilityTypes.find({});
    },
    isCurType(type){
        return type == this.type;
    }
});