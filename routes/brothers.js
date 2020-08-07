const mid = require('../middleware');
const firebase = require("firebase");
const express = require('express');
const db = firebase.firestore();
let router = express.Router();

// ==============================================================
//                            BROTHERS
// ==============================================================
router.get('/', mid.isAuth, async function(req, res, next) {
  try {
    let docRef = db.collection('Brothers').orderBy('name', 'asc');
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

router.get('/:id', mid.isAuth, async function(req, res, next) {
  let broRef = db.collection('Brothers').doc(req.params.id);
  let docSnapshot = await broRef.get();
  let data = docSnapshot.data();
  res.render("brotherDetail", {
    brother: data
  });
});

router.post('/filter', mid.isAuth, async function(req, res, next) {
  var option = req.body.by;
  let broRef = db.collection('Brothers');
  console.log(option);
  switch (option) {
    case "absent":
      broRef = broRef.orderBy(option, "desc");
      break;
    case "tardy":
      broRef = broRef.orderBy(option, "desc");
      break;
    case "finesDue":
      broRef = broRef.orderBy(option, "desc");
      break;
    case "duesPaid":
      broRef = broRef.where(option, "==", false);
      break;
    default:

  }

  var brothers = [];
  let docSnapshot = await broRef.get();
  let data = docSnapshot.docs;
  docSnapshot.forEach((snapshot) => {
    brothers.push(snapshot.data());
  });
  res.json({
    brothers: brothers
  });
});

module.exports = router;
