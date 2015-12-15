$(document).ready(function() {
    $("form[name=reservation-form]").parsley();

    $("form[name=reservation-form]").on('submit', function(e) {
        var f = $(this);
        f.parsley().validate();

        if (f.parsley().isValid()) {
            $.ajax({
              dataType: 'jsonp',
              url: "http://getsimpleform.com/messages/ajax?form_api_token=ccc68879c9e9c7ab2b01502126346636",
              data: $('#reservation-form').serialize(),
              success: function(response) {
                     $('.success-message').css( "display", "block" );       
                },
              error: function() {

                }
            });

        } else {

        }

        e.preventDefault();
        $('#reservation-form')[0].reset();
    });
});