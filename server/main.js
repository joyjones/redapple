Meteor.startup(() => {
  // code to run on server at startup
});

Meteor.publish("allUserData", function () {
    return Meteor.users.find({}, {fields: {'wxinfo': 1, 'createdAt': 1}});
});

Meteor.publish('facilities', function(){
    return Facilities.find({});
});

Meteor.publish('facilityTypes', function(){
    return FacilityTypes.find({});
});

Meteor.publish('donations', function(){
    return Donations.find({});
});

Meteor.publish('userDonations', function(userId){
    return Donations.find({userId: userId});
});