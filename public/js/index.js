$( document ).ready(function() {
  console.log("ready!");
  $('#startMeeting').on('click', async function(e) {
    e.preventDefault();
    $.ajax({
      type: 'POST',
      dataType: 'json',
      url: `/${window.location.href.split("/")[3]}/startmeeting`,
      success: function(res) {
        $("#start")[0].innerText = res.responseJSON.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }
    })
  });

  $('#endMeeting').on('click', async function(e) {
    e.preventDefault();
    $.ajax({
      type: 'POST',
      dataType: 'json',
      url: `/${window.location.href.split("/")[3]}/endmeeting`,
      complete: function(res) {
        console.log(res);
        let mSeconds = Date.parse(res.responseJSON);
        let date = new Date(mSeconds);
        console.log(date);
        $("#end")[0].innerText = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
      }
    })
  });
});
