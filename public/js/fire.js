$(document).ready(function() {
  // Initialize Cloud Firestore through Firebase
  firebase.initializeApp({
    apiKey: "AIzaSyAMF1BdBxetxkQQdnl2lwMBdJF6hMnFNoY",
    authDomain: "akpsi-attendance.firebaseapp.com",
    projectId: "akpsi-attendance"
  });

  var db = firebase.firestore();
  let meetingId = window.location.pathname.split("/")[2]
  console.log("meetingId: " + meetingId);

  db.collection("Meetings").doc(meetingId).onSnapshot(function(doc) {
    var source = doc.metadata.hasPendingWrites ? "Local" : "Server";

    // get the last attended
    let data = doc.data();
    // console.log("Last bro to sign in: ", lastBro.name);
    $("#signedInBro").empty();

    for (var i = 0; i < data.attended.length; i++) {
      let html = `<li class="list-group-item">${ data.attended[i].name }</li>`
      $("#signedInBro").prepend(html);
    }


  });
})
