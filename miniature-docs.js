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

    },

    config: function() {
      return function(editor) {
        editor.on("change", function(cm_editor, info) {
          console.log(cm_editor.getValue());
          $("#preview_iframe").contents().find("html").html(cm_editor.getValue());
        });
      };
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
