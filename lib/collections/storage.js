/**
 * Created by jones on 16/5/31.
 */
Storage = new Mongo.Collection('storage');

if (Meteor.isServer){
    if (!Storage.findOne()) {
        Storage.insert({
            weixin: {
                jsApiTicket: null,
                accessToken: null
            }
        });
    }
}