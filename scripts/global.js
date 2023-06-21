function loadPageAnimation(value){
    if(value == true){
        $("#loadPageAnimation").attr("hidden",false);
        $('body').css("overflow-y", "hidden");
        $('body').css("height", "100%");
    }else if(value == false){
        $("#loadPageAnimation").attr("hidden",true);
        $('body').css("overflow-y", "");
        $('body').css("height", "");
    }
}

function loadToastNotification(message, type){
    if(type == "success"){
        $('#toast-success .toast-body').text(message)
        $('#toast-success').toast('show');
    }

    if(type == "danger"){
        $('#toast-danger .toast-body').text(message)
        $('#toast-danger').toast('show');
    }

    if(type == "warning"){
        $('#toast-warning .toast-body').text(message)
        $('#toast-warning').toast('show');
    }
}

function removeSpecialChars(str) {
    let newStr = str.normalize("NFD")
    var specialChars = /[^a-zA-Z0-9 ]/g;
    return newStr.replace(specialChars, "").replace(/\s/g, "");
}