this.Documents = new Mongo.Collection("documents");
EditingUsers = new Mongo.Collection("editingUsers");

if (Meteor.isClient) {

  Meteor.subscribe("documents");
  Meteor.subscribe("editingUsers");

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



  Template.docMeta.helpers({
    document: function(){
       return Documents.findOne({_id:Session.get('docid')});
    },
  });

  Template.docMeta.events({
    'click .js-private': function(event){
       var doc = {_id:Session.get('docid'), isPrivate: event.target.checked };
       Meteor.call('updateDocPrivacy', doc);
    },
  });

  Template.editableText.helpers({
    userCanEdit: function(doc, Collection) {
      // can edit if the current doc is owned by the user
      doc = Documents.findOne({_id:Session.get('docid'), owner: Meteor.userId()});
      if (doc) {
        return true;
      } else {
        return false;
      }
    }
  });

    Template.editor.events({
    "click #foo": function(event, template){

    }
  });


    Template.navbar.helpers({
      documents: function(){
        return Documents.find({isPrivate:false});
      },
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
      'click .js-load-doc': function(event) {
        console.log(this);
        Session.set('docid', this._id);
      }
    });

}// end is client

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    if(!Documents.findOne()) {
      // Documents.insert({title: "new document"});
    }
  });

  Meteor.publish("documents", function(){
    return Documents.find({isPrivate:false});
  });

  Meteor.publish("editingUsers", function(){
    return EditingUsers.find({});
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
      console.log(Documents.findOne({_id:id}));
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
  },
  updateDocPrivacy: function(doc) {
    console.log(doc);
    var realDoc = Documents.findOne({_id: doc._id, owner: this.userId});
    if (realDoc) {
      realDoc.isPrivate = doc.isPrivate;
      Documents.update({_id: doc._id}, realDoc);
    }
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
