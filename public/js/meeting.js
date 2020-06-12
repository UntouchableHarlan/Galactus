$(document).ready(async function() {
  console.log("ready");
  $('#loader').hide();
  $('#signIn').on('click', function(e) {
    $('.signin').hide();
    $('#loader').show();
    e.preventDefault();
    var broId = $("#brother")[0].value;
    $.ajax({
      type: 'POST',
      url: `/${window.location.href.split("/")[3]}/signin`,
      data: {
        broId: broId
      },
      success: function(data) {
        console.log(data);
        $('#loader').hide();
        $('.alert-success')[0].textContent = data.message
        $('.alert-success').removeAttr('hidden');
      },
      error: function(err) {
        console.log(err);
        $('#loader').hide();
        $('.alert-danger')[0].textContent = data.message
        $('.alert-danger').removeAttr('hidden');
      }
    });
  });
})
