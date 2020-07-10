// const firebase = require("firebase");
// const db = firebase.firestore();

exports.getTime = async function getTime(str) {
  // 12:00
  var time = str.split(':');
  let hour = time[0];
  let minutes = time[1];
  var now = new Date();
  now.setDate(now.getDate());
  now.setHours(hour);
  now.setMinutes(minutes);
  now.setMilliseconds(0);

  return now;
}

exports.closeMeeting = async function closeMeeting(meetingRef, meetingAttendance) {[]

  try {
    let brosRef = db.collection('Brothers').orderBy('name', 'desc');
    let docQuery = await brosRef.get();
    let brotherDocs = docQuery.docs;

    let meetingSnap = await meetingRef.get();
    let meetingDoc = meetingSnap.data();

    brotherDocs.forEach((bro, i) => {
      if (!meetingAttendance.contains(bro.data())) {
        let broRef = db.collection('Brothers').doc(bro.id);
        broRef.update({
          absent: firebase.firestore.FieldValue.arrayUnion(meetingDoc)
        });
      }
    });
  } catch (e) {

  }

}
