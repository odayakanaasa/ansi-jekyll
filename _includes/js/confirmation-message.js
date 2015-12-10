$(document).ready(function() {
    $("form[name=reservation-form]").parsley();
    $("form[name=reservation-form]").on('submit', function(e) {
        var f = $(this);
        f.parsley().validate();
        if (f.parsley().isValid()) {
            $.ajax({
              dataType: 'jsonp',
              url: "http://getsimpleform.com/messages/ajax?form_api_token=61cdf75d210a898a9c2caa21d0791ab8",
              data: $('#reservation-form').serialize(),
              success: function(response) {
                     $('.success-message').css( "display", "block" );       
                },
              error: function() {
                 $('.error-message').css( "display", "block" );
                }
            });
            console.log('event submit trigered');
        } else {
        }
        e.preventDefault();
        $('#reservation-form')[0].reset();
    });
});