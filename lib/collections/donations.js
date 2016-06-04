/**
 * Created by jones on 16/5/15.
 */
Donations = new Mongo.Collection('donations');


if (Meteor.isServer) {
    let api = new Restivus({
        useDefaultAuth: true,
        prettyJson: true
    });

    api.addCollection(Donations);

    api.addRoute('donation/push', {authRequired: false}, {
        put: function () {
            var q = this.queryParams;
            let fac = q.facility_id ? Facilities.findOne(q.facility_id) : null;
            if (!fac)
                return {status: 'fail', data: {message: 'facility not found'}};
            if (!fac.donating || fac.donating.weight <= 0)
                return {status: 'fail', data: {message: 'invalid current facility donating weight'}};
            const t = new Date().getTime();
            Donations.insert({facilityId: fac._id, userId: fac.donating.userId, time: t, weight: fac.donating.weight});
            let stats = Donations.aggregate([{
                $match: { facilityId: fac._id }
            },{
                $group: { _id: "$facilityId", total: {$sum: "$weight"}, counter: {$sum: 1} }
            }]);
            if (stats.length > 0){
                let dn = {
                    weight: fac.donating.weight + (fac.donation ? fac.donation.weight : 0),
                    totalWeight: stats[0].total,
                    latestTime: t,
                    counter: stats[0].counter
                };
                Facilities.update({_id: fac._id}, {$set: {donation: dn}});
            }
            Facilities.update({_id: fac._id}, {$set: {donating: null, state: (fac.state & (~FacilityState.Donating))}});

            let user = fac.donating.userId ? Meteor.users.findOne(fac.donating.userId) : null;
            if (user) {
                stats = Donations.aggregate([{
                    $match: {userId: user._id}
                }, {
                    $group: {_id: "$userId", total: {$sum: "$weight"}, counter: {$sum: 1}}
                }]);
                if (stats.length > 0) {
                    Meteor.users.update({_id: user._id}, {
                        $set: {
                            'profile.donation': {
                                totalWeight: stats[0].total,
                                latestTime: t,
                                counter: stats[0].counter
                            }
                        },
                        $unset: {
                            'profile.donating': 1
                        }
                    });
                    Meteor.users.update({_id: user._id}, {$unset: {'profile.donating': 1}});
                }
            }
            return {status: 'success', data: {message: 'new donation pushed'}};
        }
    });

    api.addRoute('donation/history', {authRequired: false}, {
        get: function () {
            var q = this.queryParams;
            let rsts = [];
            let ds = Donations.find({userId: q.user_id}).fetch();
            for (let i = 0; i < ds.length; ++i){
                let d = ds[i];
                let fac = Facilities.findOne({_id: d.facilityId});
                rsts.push({
                    time: moment(d.time).format('YYYY-MM-DD HH:mm:ss'),
                    facilityId: fac._id,
                    facilityName: fac.addr,
                    facilityType: fac.type,
                    weight: d.weight
                });
            }
            return rsts;
        }
    });
}