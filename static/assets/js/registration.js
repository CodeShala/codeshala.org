$(document).ready(function () {
    $('#registration-alert-danger').hide();
    $('#phone_number').keyup(function () {
        if (this.value.length == 10) {
            $(this).addClass('is-valid');
            $(this).removeClass('is-invalid');
            $('#getOTP').prop('disabled', false);
        } else {
            $(this).removeClass('is-valid');
            $(this).addClass('is-invalid');
            $('#getOTP').prop('disabled', true);
        }
    });

    $('#referer_number').keyup(function () {
        if (this.value.length == 10) {
            $.ajax({
                type: "GET",
                url: "/student/" + this.value,
                success: function (data) {
                    if (data != "No Student Found") {
                        $('#referer_message').html('Congratulations, you have successfully applied referral from ' + data.first_name + ' ' + data.last_name);
                    } else {
                        $('#referer_message').html('This referer has not yet registered with us, but you can still proceed with registration.');
                    }
                },
                error: function (data) {
                    console.log('Error in referal');
                }
            });
        }
    });

    $('#goToStep3').click(function () {
        $('#registration-alert-danger').html('You successfully verified your phone number and selected a batch, Now fill up your basic details');
        $('#process-step2').css('color', 'green');
        $('#process-step3').css('font-weight', 'bold');
        $('#step2').hide();
        $('#step3').show();
    })
});