/**
 * Created by jones on 16/5/15.
 */
Facilities = new Mongo.Collection('facilities');
FacilityTypes = new Mongo.Collection('facility_types');

Facilities.allow({
    insert: function(userId, model) { return true; },
    update: function(userId, model) { return true; },
    remove: function(userId, model) { return true; }
});

Facilities.deny({
    update: function(userId, model, fieldNames) {
        ['_id', 'createdAt', 'createdBy'].forEach(function(e){
            if (fieldNames.indexOf(e) >= 0)
                return true;
        });
        return false;
    }
});

FacilityState = {
    Created: 0,// 新建
    Placed: 1,// 就位
    Opened: 2,// 开启
    Donating: 4,// 捐赠中
    Maintaining: 8// 维护中
};

FacilityStateNames = [
    '新建', '就位', '开启', '捐赠中', '维护中'
];

Meteor.methods({
    //postInsert: function(postAttributes) {
    //    check(this.userId, String);
    //    check(postAttributes, {
    //        title: String,
    //        url: String
    //    });
    //
    //    var errors = validatePost(postAttributes);
    //    if (errors.title || errors.url)
    //        throw new Meteor.Error('invalid-post', "You must set a title and URL for your post");
    //
    //    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    //    if (postWithSameLink) {
    //        return {
    //            postExists: true,
    //            _id: postWithSameLink._id
    //        }
    //    }
    //
    //    var user = Meteor.user();
    //    var post = _.extend(postAttributes, {
    //        userId: user._id,
    //        author: user.username,
    //        submitted: new Date(),
    //        commentsCount: 0,
    //        upvoters: [],
    //        votes: 0
    //    });
    //
    //    var postId = Posts.insert(post);
    //
    //    return {
    //        _id: postId
    //    };
    //},
    //
    //upvote: function(postId) {
    //    check(this.userId, String);
    //    check(postId, String);
    //
    //    var affected = Posts.update({
    //        _id: postId,
    //        upvoters: {$ne: this.userId}
    //    }, {
    //        $addToSet: {upvoters: this.userId},
    //        $inc: {votes: 1}
    //    });
    //
    //    if (! affected)
    //        throw new Meteor.Error('invalid', "You weren't able to upvote that post");
    //}
});

if (Meteor.isServer) {

    // Global API configuration
    let api = new Restivus({
        useDefaultAuth: true,
        prettyJson: true
    });

    api.addCollection(Facilities);

    api.addRoute('facility/donate', {authRequired: false}, {
        put: function () {
            let q = this.queryParams;
            if (q.user_id && !Meteor.users.findOne(q.user_id))
                return {status: 'fail', data: {message: 'user not found'}};
            let fac = q.facility_id ? Facilities.findOne(q.facility_id) : null;
            if (!fac)
                return {status: 'fail', data: {message: 'facility not found'}};
            let weight = Number(q.weight);
            if (weight < 0)
                return {status: 'fail', data: {message: 'invalid weight'}};
            let dn = fac.donating ? fac.donating : {};
            dn.weight = weight;
            Facilities.update({_id: q.facility_id}, {
                $set: {donating: dn, state: (fac.state | FacilityState.Donating)}
            });
            if (dn.userId){
                Meteor.users.update({_id: dn.userId}, {
                    $set: {'profile.donating': {facilityId: fac._id, weight: weight}}
                });
            }
            return {status: 'success', data: {message: 'current facility donation updated'}};
        }
    });

    api.addRoute('facility/bind-user', {authRequired: false}, {
        put: function () {
            let q = this.queryParams;
            let user = q.user_id ? Meteor.users.findOne(q.user_id) : null;
            if (!user)
                return {status: 'fail', data: {message: 'user not found'}};
            let fac = q.facility_id ? Facilities.findOne(q.facility_id) : null;
            if (!fac)
                return {status: 'fail', data: {message: 'facility not found'}};
            if (!fac.donating)
                return {status: 'fail', data: {message: 'facility is not donating'}};
            fac.donating.userId = user._id;
            Facilities.update({_id: fac._id}, {$set: {donating: fac.donating}});
            Meteor.users.update({_id: user._id}, {
                $set: {'profile.donating': {facilityId: fac._id, weight: fac.donating.weight}}
            });
            return {status: 'success', data: {message: 'donating facility user binded'}};
        }
    });

    api.addRoute('facility/donate-cancel', {authRequired: false}, {
        put: function () {
            let q = this.queryParams;
            let fac = q.facility_id ? Facilities.findOne(q.facility_id) : null;
            if (!fac)
                return {status: 'fail', data: {message: 'facility not found'}};
            if (!fac.donating)
                return {status: 'fail', data: {message: 'facility is not donating'}};
            if (fac.donating.userId){
                Meteor.users.update({_id: fac.donating.userId}, {
                    $unset: {'profile.donating': 1}
                });
            }
            Facilities.update({_id: q.facility_id}, {
                $set: {state: (fac.state & (~FacilityState.Donating))},
                $unset: {donating: 1}
            });
            return {status: 'success', data: {message: 'facility donation cancelled'}};
        }
    });
}