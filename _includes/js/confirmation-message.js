$("#reservation-form").submit(function() {
            // validate form with parsley.
            $(this).parsley().validate();
            // if this form is valid
            if ($(this).parsley().isValid()) {
                $.ajax({
                    dataType: 'jsonp',
                    url: "http://getsimpleform.com/messages/ajax?form_api_token=61cdf75d210a898a9c2caa21d0791ab8",
                    data: $('#reservation-form').serialize() 
                }).done(function() {
                    //callback which can be used to show a thank you message
                    //and reset the form
                    $('.success-message').css( "display", "block" );                    
                });               
            }

            // prevent default so the form doesn't submit. We can return true and
            // the form will be submited or proceed with a ajax request.
            event.preventDefault();
        });