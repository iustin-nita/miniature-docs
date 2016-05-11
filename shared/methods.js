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
  //add comment
  addComment: function(comment) {
    console.log(comment);
    if(this.userId){
      comment.createdOn = new Date();
      comment.owner = this.userId;
      return Comments.insert(comment);
      console.log(comment);
    } else {
      console.log(wtf);
    }
  },
  addEditingUser: function(docid) {
    var doc, user, eusers;
    doc = Documents.findOne({_id: docid});
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