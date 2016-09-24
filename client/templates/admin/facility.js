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
        let state = 0;
        for (let k in FacilityState){
            let v = FacilityState[k];
            if (v > 0 && $('#state' + v)[0].checked)
                state |= v;
        }
        let url = Router.current().route.getName();
        if (url == 'admin.facility') {
            Facilities.update(this._id, {$set: {type: type, addr: addr, state: state}}, function (error) {
                error && alert(error.reason);
            });
        }
        else {
            Facilities.insert({type: type, addr: addr, state: state, createdAt: (new Date()).getTime()}, function(error) {
                error && alert(error.reason);
            });
        }
        Router.go('admin.facilities');
        return false;
    },
    'change .state-check:checkbox'(event){
        if (event.target.value <= 0)
            return;
        if (event.target.checked)
            $('#state0')[0].checked = false;
        else{
            let nonecheck = true;
            for (let k in FacilityState){
                let v = FacilityState[k];
                let e = $('#state' + v);
                if (v > 0 && e.length && e[0].checked) {
                    nonecheck = false;
                    break;
                }
            }
            if (nonecheck)
                $('#state0')[0].checked = true;
        }
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
    },
    allStates(){
        let states = [{
            id: 'state' + FacilityState.Created, value: FacilityState.Created, caption: FacilityStateNames[0]
        }];
        for (let i = 0; i < FacilityStateNames.length - 1; ++i){
            let n = 1 << i;
            states.push({
                id: 'state' + n, value: n, caption: FacilityStateNames[i + 1]
            });
        }
        !this.state && (this.state = 0);
        for (let i = 0; i < states.length; ++i){
            let v = states[i].value;
            states[i].checked = ((this.state == 0 && i == 0) || ((this.state & v) != 0)) ? 'checked' : false;
            states[i].disabled = (v === FacilityState.Created || v === FacilityState.Donating);
            states[i].target = this;
        }
        return states;
    }
});