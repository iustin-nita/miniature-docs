this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");
if (Meteor.isClient) {

  Template.editor.helpers({
    docid: function() {
      setupCurrentDocument();
      return Session.get("docid");

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
      setupCurrentDocument();
      // return Session.get("docid");
      var doc, eusers, users;
      doc = Documents.findOne();
      if(!doc) {return;} //give up
      eusers = EditingUsers.findOne({docid: doc._id});
      if(!eusers) {return;} //give up
      users = [];
      var i = 0;
      for (var user_id in eusers.users) {
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

    Template.navbar.events({
      "click .js-add-doc":function(event){
        event.preventDefault();
        console.log("Add a new doc!");
        if (!Meteor.user()){// user not available
            alert("You need to login first!");
        }
        else {
          // they are logged in... lets insert a doc
          var id = Meteor.call("addDoc", function(err, res){
            if (!err){// all good
              console.log("event callback received id: "+res);
              Session.set("docid", res);
            }
          });
        }
      },
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
  // method to add a new document
  addDoc:function(){
    var doc;
    if (!this.userId){// not logged in
      return;
    }
    else {
      doc = {owner:this.userId, createdOn:new Date(),
            title:"my new doc"};
      var id = Documents.insert(doc);
      console.log("addDoc method: got an id "+id);
      return id;
    }
  },
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

function setupCurrentDocument() {
  var doc;
  if (!Session.get("docid")) { //no doc id set yet
    doc = Documents.findOne();
    if (doc) {
      Session.set("docid", doc._id);
    }
  }
}
