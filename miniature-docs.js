this.Documents = new Mongo.Collection("documents");

if (Meteor.isClient) {

  Template.editor.helpers({
    create: function(){

    },
    rendered: function(){

    },
    destroyed: function(){

    },
    docid: function() {
      var doc = Documents.findOne();
      if (doc) {
        return Documents.findOne()._id;
      }
      else {
        return undefined;
      }

    }
  });

  Template.editor.events({
    "click #foo": function(event, template){

    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
    if(!Documents.findOne()) {
      Documents.insert({title: "new document"});
    }
  });
}
