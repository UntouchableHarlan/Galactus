const firebase = require("firebase");

module.exports = {
  isAuth: function(req, res, next) {
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log("User is signed in");
        console.log(user.uid);
        // req.session.userId = user.uid;
        return next();
      } else {
        console.log(req.session);
        console.log("User is signed out");
        return res.redirect('/login');
      }
    });
    // next();
  }
};
