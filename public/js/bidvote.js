$(document).ready(function() {
  console.log("we ready");

  $('#bidvote-new').on('submit', function(e) {
    e.preventDefault();
    let password = $('#password').val();
    $.ajax({
      type: 'POST',
      url: '/newbidvote',
      data: {
        password: password
      },
      success: function(res) {
        console.log(res);
        if (res.error) {
          let html = `<div class="alert alert-danger alert-dismissable fade show" role="alert">
                      ${res.error}
                      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                      </button>
                    </div>`;
          $(".modal-body").prepend(html);
        } else {
          window.location.href = `bidvote/${res.id}`
        }
      }
    });
  })

})
