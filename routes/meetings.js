var QRCode = require('qrcode');
const mid = require('../middleware');
const firebase = require("firebase");
const express = require('express');
const db = firebase.firestore();
let router = express.Router();

// ==============================================================
//                        MEETINGS
// ==============================================================
router.get('/all', mid.isAuth, async function(req, res, next) {
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

router.get('/:id', mid.isAuth, async function(req, res, next) {
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
    console.log(e);
  }
});

router.get('/', mid.isAuth, async function(req, res, next) {
  res.render("meeting");
});

module.exports = router;
