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

    //api.addRoute('facilities/:id', {authRequired: false}, {
    //    get: function () {
    //        return Facilities.findOne(this.urlParams.id);
    //    },
    //    delete: {
    //        roleRequired: ['author', 'admin'],
    //        action: function () {
    //            if (Facilities.remove(this.urlParams.id)) {
    //                return {status: 'success', data: {message: 'Document removed'}};
    //            }
    //            return {
    //                statusCode: 404,
    //                body: {status: 'fail', message: 'Document not found'}
    //            };
    //        }
    //    }
    //});
}