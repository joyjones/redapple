/**
 * Created by jones on 16/5/22.
 */

if (Meteor.isServer) {

    // Global API configuration
    let api = new Restivus({
        useDefaultAuth: true,
        prettyJson: true
    });

    api.addCollection(Meteor.users);
}