
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
