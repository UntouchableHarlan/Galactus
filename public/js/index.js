$( document ).ready(function() {
  console.log("ready!");
  $('#startMeeting').on('click', async function(e) {
    e.preventDefault();
    $.ajax({
      type: 'POST',
      dataType: 'json',
      url: `/${window.location.href.split("/")[3]}/startmeeting`,
      success: function(res) {
        console.log(res);
        let date = new Date(res.toString());
        $("#start")[0].innerText = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        $("#buu").html("<button class=\"btn btn-danger\" type=\"button\" name=\"button\" id=\"endMeeting\">End Meeting</button>");
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
        let date = new Date(res.toString());
        $("#end")[0].innerText = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        $("#buu").html("<a href=\"/\" class=\"btn btn-primary\" style=\"display:flex;justify-content:center;\">View Details</a>");
      }
    });
  });
});
