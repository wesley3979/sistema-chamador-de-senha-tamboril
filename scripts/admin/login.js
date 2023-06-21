$(document).ready(function() {
    Login()
});

function Login(){
    $("#loginForm").submit(function(event) {

        loadPageAnimation(true)

        event.preventDefault();

        var formData = {
            login: $("#login").val(),
            password: $("#password").val(),
        };

        $.ajax({
            type: 'POST',
            url: "/admin/login",
            data: formData,
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente fazer login novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "success")

                    setTimeout(function() {
                        $(location).prop('href', '/admin')
                    }, 1000)
                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });

    })
}