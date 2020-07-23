$(document).ready(async function() {
  console.log("we here");

  // filtering brothers, call ajax function to index
  $("#brotherFilter").on('change', function() {
    var option = $("#brotherFilter").val();
    $.ajax({
      type: 'POST',
      url: '/brothers/filter',
      data: {
        by: option
      },
      success: function(res) {
        // remove whats inside of the id
        console.log(res);
        $("#data").empty();

        res.brothers.forEach((bro, index) => {
          // append each bro in there
          let html = `<tr>
            <td>${index + 1}</td>
            <td>${ bro.name }</td>
            <td>${ bro.email }</td>
            <td>${ bro.tardy ? bro.tardy.length : "0" }</td>
            <td>$${ bro.finesDue }</td>
            <td><button type="button" data-toggle="modal" data-target="#exampleModal" id="radical" class="btn btn-sm btn-${ bro.duesPaid ? 'success' : 'danger' }">${ bro.duesPaid ? "Paid" : "Not Paid" }</button></td>
            <td> <a class="btn btn-primary btn-sm" href="/brothers/${ bro.id }">View Info</a> </td>
          </tr>`
          $("#data").append(html);
        });
      }
    });
  });

  // change from not paid to paid
  $('.paid').on('click', function(e) {
    e.preventDefault();

    let broId = $('.paid').attr("class").split(" ")[3];
    $.ajax({
      type: 'POST',
      url: `/paid/${broId}`,
      success: function(res) {
        // reload
        location.reload();
      }
    });
  })

});
