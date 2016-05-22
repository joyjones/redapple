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
        get: function () {
            var q = this.queryParams;
            if (q.user_id && !Meteor.users.findOne(q.user_id))
                return {status: 'fail', data: {message: 'user not found'}};
            if (!q.facility_id || !Facilities.findOne(q.facility_id))
                return {status: 'fail', data: {message: 'facility not found'}};
            if (!q.weight || Number(q.weight) <= 0)
                return {status: 'fail', data: {message: 'invalid weight'}};
            Donations.insert({userId: q.user_id, facilityId: q.facility_id, time: new Date().getTime(), weight: Number(q.weight)});
            return {status: 'success', data: {message: 'Document pushed'}};
        }
    });
}