this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");
if (Meteor.isClient) {

  Template.editor.helpers({
    docid: function() {
      var doc = Documents.findOne();
      if (doc) {
        return Documents.findOne()._id;
      }
      else {
        return undefined;
      }

    },

    config: function() {
      return function(editor) {
        editor.setOption("lineNumbers", true);
        editor.setOption("mode","html");
        editor.setOption("theme", "cobalt");
        editor.on("change", function(cm_editor, info) {
          console.log(cm_editor.getValue());
          $("#preview_iframe").contents().find("html").html(cm_editor.getValue());
          Meteor.call("addEditingUser");
        });
      };
    }
  });

  Template.editingUsers.helpers({
    users: function() {
      var doc, eusers, users;
      doc = Documents.findOne();
      if(!doc) {return;} //give up
      eusers = EditingUsers.findOne({docid: doc._id});
      if(!eusers) {return;} //give up
      console.log('asdfasd');
      users = [];
      var i = 0;
      for (var user_id in eusers.users) {
        console.log('adding user');
        users[i] = fixObjectKeys(eusers.users[user_id]);
        i++;
      }
      return users;
    },
  });

    Template.editor.events({
    "click #foo": function(event, template){

    }
  });

    Template.navigation.events({
      'click .js-add-doc': function (event) {
        event.preventDefault();
        console.log('add new doc');
      }
    });

}// end is client

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    if(!Documents.findOne()) {
      Documents.insert({title: "new document"});
    }
  });
}


Meteor.methods({
  addEditingUser: function() {
    var doc, user, eusers;
    doc = Documents.findOne();
    if (!doc) {return;} //no doc give up
    if(!this.userId){return;} //no logged in user give up

    // now I have a doc and possibly a user
    user = Meteor.user().profile;
    eusers = EditingUsers.findOne({docid: doc._id});
    if (!eusers) {
      eusers = {
        docid: doc._id,
        users: {},
      };
    }
    console.log('eusers:' +eusers);
    user.lastEdit = new Date();
    eusers.users[this.userId] = user;
    EditingUsers.upsert({_id: eusers._id},eusers);
    console.log(EditingUsers.findOne());
  }
});


// allow use of hyphen in spacebars
function fixObjectKeys(obj) {
  var newObj = {};
  for ( var key in obj) {
    var key2 = key.replace("-", "");
    newObj[key2] = obj[key];
  }
  return newObj;
}
