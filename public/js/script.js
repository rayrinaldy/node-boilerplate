'use strict';

$(function(){
    $.ajaxSetup({
        headers: { 'X-CSRF-TOKEN': $('input[name="_csrf"]').val() }
    });

    $('.btn-send_email').click(function(e){
        var userName = $(this).data('name');
        var userMail = $(this).data('email');
        $('.modal-header .user--name').html(userName);
        $('.modal-body input[name="mail_to"]').val(userMail);
    });

    // Edit User
    $('.btn_edit-user').click(function(e){
        var id = $(this).data('id');
        var username = $(this).data('username');
        var firstname = $(this).data('firstname');
        var lastname = $(this).data('lastname');
        var email = $(this).data('email');
        var phone = $(this).data('phone');
        var role = $(this).data('role');
        $('.form-edit-user').attr('action', '/api/users/update/' + id);

        $('#inputUsername').val(username);
        $('#inputFName').val(firstname);
        $('#inputLName').val(lastname);
        $('#inputPhone').val(phone);
        $('#inputEmail').val(email);
        $('#inputEmail').val(email);

        switch(role) {
            case 'admin':
                $('#selectRole option:selected').removeAttr('selected');
                $('#selectRole option[value="admin"').attr('selected', 'selected').trigger("change");
                break;
            case 'user':
                $('#selectRole option:selected').removeAttr('selected');
                $('#selectRole option[value="user"').attr('selected', 'selected').trigger("change");
                break;
            case 'staff':
                $('#selectRole option:selected').removeAttr('selected');
                $('#selectRole option[value="staff"').attr('selected', 'selected').trigger("change");
                break;
            case 'driver':
                $('#selectRole option:selected').removeAttr('selected');
                $('#selectRole option[value="driver"').attr('selected', 'selected').trigger("change");
                break;
        }
    })

    // Form Submission
    $('.btn-submit-data').click(function(e){
        e.preventDefault();
        var formUrl = $(this).closest('form').attr('action');
        var formData = $(this).closest('form').serialize();
        $('.invalid-feedback').removeClass('d-block').html('');

        $.ajax({
            type: "post",
            url: formUrl,
            data: formData,
            beforeSend: function() {

            }
        })
        .done(function(res) {
            location.reload();
        })
        .fail(function(err) {
            var formError = err.responseJSON.formError || err.responseText;

            _.each(formError, function(err, i) {
                $('input[name="' + err.param + '"]').closest('.form-group').find('.invalid-feedback').addClass('d-block').html(err.msg);
            })

            if(err.error) {
                $('.alert-failed-submission').removeClass('d-none').html(err.responseJSON.error || err.responseJSON.formError);
            }
        })
    })

    // Delete
    $('.btn-delete').click(function(){
        var formUrl = $(this).data('url');
        $('.btn-delete-data').attr('data-url', formUrl);
    })

    $('.btn-delete-data').click(function(e){
        e.preventDefault();
        var formUrl = $(this).data('url');

        $.ajax({
            type: "delete",
            url: formUrl,
            beforeSend: function() {

            }
        })
        .done(function(res) {
            location.reload();
        })
        .fail(function(err) {
            console.log(err);
            $('.alert-failed-submission').removeClass('d-none').html('Delete unsuccesful, please try again');
        })
    })
});