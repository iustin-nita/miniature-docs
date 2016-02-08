Accounts.ui.config({
  requestPermissions: {},
  requestOfflineToken: {},
  passwordSignupFields: "USERNAME_AND_OPTIONAL_EMAIL",
  extraSignupFields: [{
    fieldName: 'first-name',
    fieldLabel: 'First name',
    inputType: 'text',
    visible: true,
    validate: function(value, errorFunction) {
      if(!value) {
        errorFunction("Please write your first name");
        return false;
      } else {
        return true;
      }
    }
  }],
});
