$(document).ready(function() {
  var count = 0;
  // Initialize Cloud Firestore through Firebase
  firebase.initializeApp({
    apiKey: "AIzaSyAMF1BdBxetxkQQdnl2lwMBdJF6hMnFNoY",
    authDomain: "akpsi-attendance.firebaseapp.com",
    projectId: "akpsi-attendance"
  });

  var db = firebase.firestore();
  let meetingId = window.location.pathname.split("/")[2]

  db.collection("Meetings").doc(meetingId).onSnapshot(function(doc) {
    count++;
    var source = doc.metadata.hasPendingWrites ? "Local" : "Server";

    // get the last attended
    let data = doc.data();
    let lastBro = data.attended[data.attended.length - 1];
    // console.log("Last bro to sign in: ", lastBro.name);
    if (count > 1) {
      let html = `<li class="list-group-item">${ lastBro.name }</li>`
      $("#signedInBro").prepend(html);
    }

  });
})
