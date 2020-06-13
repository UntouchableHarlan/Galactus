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
// app.use(expressSession({secret: 'your secret', saveUninitialized: true, resave: false}));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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


// ==============================================================
//                            BROTHERS
// ==============================================================
app.get('/brothers', mid.isAuth, async function(req, res, next) {
  try {
    let docRef = db.collection('Brothers').orderBy('name', 'desc');
    let docQuery = await docRef.get();
    let brotherDocs = docQuery.docs;

    var brothers = [];

    brotherDocs.forEach((docSnapshot) => {
      brothers.push(docSnapshot.data());
    });
    res.render("brothers", {
      brothers: brothers
    })
  } catch (e) {
    console.log(e);
  }
});

app.get('/brothers/:id', mid.isAuth, async function(req, res, next) {
  let docRef = db.collection('Brothers').doc(req.params.id);
  res.render("brotherDetail");
});

// ==============================================================
//                        MEETINGS
// ==============================================================
app.get('/meetings/all', mid.isAuth, async function(req, res, next) {
  try {
    let meetingRef = db.collection("Meetings");
    let meetQuery = await meetingRef.get();
    let meetDocs = meetQuery.docs;

    var meetings = []

    meetDocs.forEach((meet) => {
      meetings.push(meet.data())
    });

    res.render("allmeetings", {
      meetings: meetings
    });
  } catch (e) {
    console.log(`Error: ${e}`);
    res.render("allmeetings", {
      meetings: []
    });
  }
});

app.get('/meetings', mid.isAuth, async function(req, res, next) {
  res.render("meeting");
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
    let now = firebase.firestore.FieldValue.serverTimestamp()
    let date = new Date();
    date.setDate(date.getDate());
    meetingRef.update({
      startTime: now
    });

    let meetingSnap = await meetingRef.get();
    let meetingDoc = meetingSnap.data();

    res.json(date);
  } catch (e) {
    res.json(e);
  }
});

app.post('/:id/endmeeting', async function(req, res, next) {
  try {
    let meetingRef = db.collection("Meetings").doc(req.params.id);
    let now = firebase.firestore.FieldValue.serverTimestamp()
    let date = new Date();
    date.setDate(date.getDate());
    meetingRef.update({
      endTime: now
    });

    let meetingSnap = await meetingRef.get();
    let meetingDoc = meetingSnap.data();

    res.json(date);
  } catch (e) {
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
    if (meetingDoc.startTime != null) {
      // meeting has begun, anyone 15 minutes late is considered late
      var now = new Date();
      var ftmin = 15 * 60 * 1000;
      now.setDate(now.getDate());
      if ((meetingDoc.startTime - now) < ftmin) {
        meetingRef.update({
          late: broDoc
        });
      }
    }
    meetingRef.update({
      attended: broDoc
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

app.listen(process.env.PORT || 3000, function() {
    console.log("legs goo");
})
