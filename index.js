const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mid = require('./middleware');
const firebase = require("firebase");
const helper = require("./helpers/functions");
var QRCode = require('qrcode')
firebase.initializeApp({
  apiKey: "AIzaSyAMF1BdBxetxkQQdnl2lwMBdJF6hMnFNoY",
  authDomain: "akpsi-attendance.firebaseapp.com",
  projectId: "akpsi-attendance"
});
const db = firebase.firestore();
const brothers = require('./routes/brothers')
const meetings = require('./routes/meetings')
// app.use(expressSession({secret: 'your secret', saveUninitialized: true, resave: false}));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/meetings', meetings);
app.use('/brothers', brothers);

app.get('/login', function(req, res, next) {
  res.render('login', {
    error: "none"
  });
});

app.get('/logout', async function(req, res, next) {
  try {
    await firebase.auth().signOut();
    res.redirect('/');
  } catch (e) {
    res.redirect('/');
  }
});

app.post('/login', async function(req, res, next) {
  console.log(req.body);
  try {
    if (req.body.password != "squirtleKnight") {
      res.render('login', {
        error: "Wrong Password, please try again."
      });
    } else {
      let user = await firebase.auth().signInWithEmailAndPassword("nuchieboard@gmail.com", "akpsiHelp");
      res.redirect('/');
    }
  } catch (e) {
    console.log(e);
    res.render('login', {
      error: e.message
    });
  }
});

app.get('/', mid.isAuth, function(req, res, next) {
  res.render("index");
});

app.get('/bidvote', mid.isAuth, function(req, res, next) {
  res.render("bidvote");
});

app.get('/bidvote/:id', mid.isAuth, async function(req, res, next) {
  try {
    let voteId = req.params.id
    let voteRef = db.collection("BidVote").doc(voteId);
    let voteQuery = await voteRef.get();
    let voteDoc = voteQuery.data();

    // create qr code to put on the page

    res.render("bidvotedetail", {
      vote: voteDoc
    });
  } catch (e) {
    console.log(e);
  }
});

app.post('/newbidvote', mid.isAuth, function(req, res, next) {
  let password = req.body.password
  console.log(password);
  if (password != "squirtleKnight") {
    res.json({
      error: "Wrong admin password, please try again"
    });
  } else {
    let voteRef = db.collection("BidVote").doc();
    let data = {
      id: voteRef.id,
      dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
      voted: []
    }
    voteRef.set(data);
    res.json({
      id: voteRef.id
    });
  }
});

// ==============================================================
//                        Settings
// ==============================================================
app.get('/settings', mid.isAuth, async function(req, res, next) {
  try {
    res.render("settings", {
      error: "none"
    });
  } catch (e) {
    console.log();
  }
});

app.post('/resetinfo', mid.isAuth, async function(req, res, next) {

  try {
    // remove all meetings
    let meetingRef = db.collection("Meetings");
    let meetQuery = await meetingRef.get();
    let meetingDocs = meetQuery.docs;

    meetingDocs.forEach((docSnapshot) => {
      let meetingId = docSnapshot.id;
      meetingRef.doc(meetingId).delete();
    });

    // reset brothers dues, absents and tardies
    let broRef = db.collection("Brothers");
    let docQuery = await broRef.get();
    let brotherDocs = docQuery.docs;

    brotherDocs.forEach((docSnapshot) => {
      let broId = docSnapshot.data().id;
      let data = {
        duesPaid: false,
        finesDue: 0,
        absent: [],
        tardy: []
      }
      broRef.doc(broId).update(data);
    });
    res.render('settings', {
      error: `Successfully resetted all info.`
    });
  } catch (e) {
    console.log(e);
    res.render('settings', {
      error: `An error occured, please try again.`
    });
  }
});

app.post('/addbro', mid.isAuth, async function(req, res, next) {
  try {
    let broRef = db.collection("Brothers").doc();
    let data = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.email,
      duesPaid: false,
      finesDue: 0,
      graduationYear: req.body.graduationYear,
      major: req.body.major,
      absent: [],
      tardy: [],
      classification: req.body.classification,
      id: broRef.id
    }
    await broRef.set(data);

    res.render('settings', {
      error: `Successfully added ${data.name}`
    });
  } catch (e) {
    console.log(e);
    res.render('settings', {
      error: `An error occured, please try again.`
    });
  }
});

app.post('/removeall', mid.isAuth, async function(req, res, next) {
  try {
    let broRef = db.collection("Brothers");
    let docQuery = await broRef.get();
    let brotherDocs = docQuery.docs;

    brotherDocs.forEach((docSnapshot) => {
      let broId = docSnapshot.data().id;
      broRef.doc(broId).delete();
    });

    res.render('settings', {
      error: `Successfully deleted all brothers.`
    });
  } catch (e) {
    res.render('settings', {
      error: `An error occured, please try again.`
    });
  }
});

app.post('/paid/:id', async function(req, res, next) {
  try {
    let broRef = db.collection('Brothers').doc(req.params.id);
    let docSnapshot = await broRef.get();
    let data = docSnapshot.data();
    let paidBoolean = data.duesPaid
    await broRef.update({
      duesPaid: !paidBoolean
    })
    console.log("Document successfully updated!");
    res.redirect(`/brothers/${req.params.id}`);
  } catch (error) {
    // The document probably doesn't exist.
    console.error("Error updating document: ", error);
  }

})

app.post('/updatedues/:id', async function(req, res, next) {
  try {
    let broRef = db.collection('Brothers').doc(req.params.id);
    let amount = req.body.amount;

    await broRef.update({
      finesDue: amount
    })
    console.log("Document successfully updated!");
    res.redirect(`/brothers/${req.params.id}`);
  } catch (error) {
    // The document probably doesn't exist.
    console.error("Error updating document: ", error);
  }

});

app.post('/newmeeting', mid.isAuth, async function(req, res, next) {
  console.log(req.body);
  let docRef = db.collection('Meetings').doc();
  let startTime = await helper.getTime(req.body.appt);
  let data = {
    type: req.body.type,
    time: startTime,
    dateCreated: firebase.firestore.FieldValue.serverTimestamp(),
    password: req.body.password
  }
  console.log(data);
  data.meetingId = docRef.id
  docRef.set(data);

  res.redirect(`/${docRef.id}`)
});

app.get('/:id/signin', async function(req, res, next) {
  // get all of the BROTHERS and display it in a select html
  try {
    let docRef = db.collection("Brothers").orderBy("name", "asc");
    let docSnapshot = await docRef.get();
    let docs = docSnapshot.docs;

    var brothers = [];

    docs.forEach((item) => {
      brothers.push(item.data());
    });

    res.render("meetingSignin", {
      brothers: brothers
    });
  } catch (e) {
    console.log(`Error: ${e}`);
    res.render("meetingSignin", {
      brothers: []
    });
  }
});

app.post('/:id/startmeeting', async function(req, res, next) {
  try {
    let meetingRef = db.collection("Meetings").doc(req.params.id);
    let date = new Date();
    date.setDate(date.getDate());
    meetingRef.update({
      startTime: firebase.firestore.FieldValue.serverTimestamp()
    });

    let meetingSnap = await meetingRef.get();
    let meetingDoc = meetingSnap.data();

    res.json(date);
  } catch (e) {
    console.log(`salomon's error: ${e}`);
    res.json(e);
  }
});

app.post('/:id/endmeeting', async function(req, res, next) {
  try {
    console.log('we got hit');
    let meetingRef = db.collection("Meetings").doc(req.params.id);
    let now = firebase.firestore.FieldValue.serverTimestamp()
    let date = new Date();
    date.setDate(date.getDate());
    meetingRef.update({
      endTime: now
    });

    let meetingSnap = await meetingRef.get();
    let meetingDoc = meetingSnap.data();
    await helper.closeMeeting(firebase, db, meetingRef, meetingDoc.attended);
    res.json(date);
  } catch (e) {
    console.log(e);
    res.json(e);
  }
});

app.post('/:id/signin', async function(req, res, next) {
  // get all of the BROTHERS and display it in a select html
  try {
    let broId = req.body.broId
    let broRef = db.collection("Brothers").doc(broId);
    let meetingRef = db.collection("Meetings").doc(req.params.id);
    let docSnapshot = await broRef.get();
    let meetingSnap = await meetingRef.get();
    let broDoc = docSnapshot.data();
    let meetingDoc = meetingSnap.data();

    // check if person already signed into meeting
    meetingDoc.attended.forEach((bro, i) => {
      if (bro.id == broId) {
        res.json({
          message: "It looks like you're signed in already",
          status: 400
        });
      }
    });


    if (meetingDoc.startTime != null) {
      // meeting has begun, anyone who signs in after is late
      var now = new Date();
      var ftmin = 15 * 60 * 1000;
      now.setDate(now.getDate());

      //
      console.log(helper.lessThanFTMinAgo(meetingDoc.startTime.toDate()));

      let lateDoc = {
        brother: broDoc,
        timeSignedIn: firebase.firestore.FieldValue.serverTimestamp()
      }
      console.log(lateDoc);
      meetingRef.update({
        late: firebase.firestore.FieldValue.arrayUnion(broDoc)
      });
      broRef.update({
        tardy: firebase.firestore.FieldValue.arrayUnion(meetingDoc)
      });

    }
    meetingRef.update({
      attended: firebase.firestore.FieldValue.arrayUnion(broDoc)
    });
    res.json({
      message: "Successfully signed in",
      status: 200
    });
  } catch (e) {
    console.log(`Error: ${e}`);
    res.json({
      message: "An error occured. Please refresh and try again",
      status: 400
    });
  }
});

app.get('/:id', mid.isAuth, async function(req, res, next) {
  try {
    var qrData = `https://akpsi-galactus.herokuapp.com/${req.params.id}/signin`
    var meetingRef = db.collection("Meetings").doc(req.params.id);
    let meetingSnap = await meetingRef.get();
    let meeting = meetingSnap.data();
    var url = await QRCode.toDataURL(JSON.stringify(qrData));

    res.render("meetingdetail", {
      url: url,
      meeting: meeting,
    });
  } catch (e) {

  }
});

app.get('/:id/statistics', mid.isAuth, async function(req, res, next) {
  try {
    var meetingRef = db.collection("Meetings").doc(req.params.id);
    let meetingSnap = await meetingRef.get();
    let meeting = meetingSnap.data();

    res.render("meetingstatistics", {
      meeting: meeting,
    });
  } catch (e) {
    console.log();
  }
});

app.post('/notes/:id', mid.isAuth, async function(req, res, next) {
  try {
    var meetingRef = db.collection("Meetings").doc(req.params.id);
    let notes = req.files.notes;
    await meetingRef.update({
      notes: {
        name: notes.name,
        mimetype: notes.mimetype,
        size: notes.size
      }
    })
  } catch (e) {
    console.log(e);
    res.redirect(`/${req.params.id}/statistics`)
  }
})

app.listen(process.env.PORT || 3000, function() {
    console.log("legs goo");
})
