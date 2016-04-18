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
        Meteor.call("addEditingUser", Session.get("docid"));
      });
    };
  }
});

Template.editingUsers.helpers({
  users: function() {
    setupCurrentDocument();
    // return Session.get("docid");
    var doc, eusers, users;
    doc = Documents.findOne({_id:Session.get("docid")});
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
  canEdit: function() {
    var doc;
    doc = Documents.findOne({_id:Session.get('docid')});
    if (doc) {
      if (doc.owner == Meteor.userId()) {
        return true;
      }
    }
    return false;
  }
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
      return Documents.find({});
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