$(document).ready(function() {
    GetUserList()
    GetSetorList()
    CreateUser()
    DeleteUser()
    RegeneratePasswordUser()
    EditUser()
    GetSetorListForOptions()
    CreateSetor()
    DeleteSetor()
    GetUbsListForOptions()
    CreateUbs()
    DeleteUbs()
    GetVideoListForOptions()
    CreateVideo()
    DeleteVideo()
    GetLocalListForOptions()
    CreateLocal()
    DeleteLocal()
});

function GetUserList(){
    $("#btnUsuarios").click(function() {
        loadPageAnimation(true)

        $.ajax({
            type: 'GET',
            url: "/user/getUsers",
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    $(".userItem").remove()

                    result.userList.forEach(user => {
                        const newRow = `
                        <tr id="userIdItem_${user.id}" class="userItem">
                            <td>
                                ${user.Login}
                            </td>
                            <td>
                                ${user.Setor.Nome}
                            </td>
                            <td>
                                ${user.Setor.Ub.Nome}
                            </td>
                            <td>
                                <input class="userId" type="text" value="${user.id}" hidden>
                                <input class="setorId" type="text" value="${user.Setor.id}" hidden>
                                <span style="cursor: pointer;" onClick="setInfosForEditUserModal(${user.id})">
                                    <img title="Editar usuário" src="/icons/pencil-square.svg" alt="Editar usuário" height="20rem">
                                </span>
                                <span style="cursor: pointer;" onClick="setForUserRegeneratePasswordModal(${user.id})">
                                    <img title="Resetar senha" src="/icons/key-fill.svg" alt="Resetar senha" height="20rem">
                                </span>
                                <span style="cursor: pointer;" onClick="setIdModal(${user.id})">
                                    <img title="Excluir usuário" src="/icons/x-circle-fill.svg" alt="Excluir usuário" height="20rem">
                                </span>
                            </td>
                        </tr>
                        `
                        $("#userListTable tbody").append(newRow)
                    });

                    setTimeout(function() {
                        loadPageAnimation(false)                    
                        $('#modalUserList').modal('show'); 
                    }, 300)

                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });

    })
}

function GetSetorList(){
    $("#btnAddUser").click(function() {
        loadPageAnimation(true)

        $('#modalUserList').modal('hide'); 

        $.ajax({
            type: 'GET',
            url: "/setor/getSetores",
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    $("#ubsIdForAddUser").html('<option value="" selected>Selecione</option');
                    $("#setorIdForAddUser").html('<option value="" selected>Selecione</option');

                    result.setorList.forEach(setor => {
                        if($('#ubsIdForAddUser').find('[value="' + setor.Ub.id + '"]').length)
                            return
                        
                        $("#ubsIdForAddUser").append(`<option value="${setor.Ub.id}">${setor.Ub.Nome}</option>`)
                    });

                    result.setorList.forEach(setor => {
                        $("#setorIdForAddUser").append(`<option class="ubsIdForSetorSelect ubsIdForSetorSelect_${setor.Ub.id}" value="${setor.id}">${setor.Nome}</option>`)
                    });

                    setTimeout(function() {
                        loadPageAnimation(false)                    
                        $('#addUserModal').modal('show'); 
                    }, 300)

                ValidateAddUserModal()

                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });

    })
}

function CreateUser(){
    $("#createUserForm").submit(function(event) {

        loadPageAnimation(true)

        event.preventDefault();

        const name = removeSpecialChars($("#name").val().toLowerCase());
        const lastName = removeSpecialChars($("#lastName").val().toLowerCase());

        var formData = {
            login:  `${name}.${lastName}`,
            setorId: $("#setorIdForAddUser").val(),
        };

        $.ajax({
            type: 'POST',
            url: "/user/insert",
            data: formData,
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "success")

                    $("#name").val("")
                    $("#lastName").val("")
                    $("#setorIdForAddUser").val("")
                    $("#UbsIdForAddUser").val("")

                    $('#userCredentialModal .modal-body').html("");

                    const userCredential = `Login: <h4>${result.user.Login}</h4><br />Senha: <h4>${result.user.Password}</h4>`

                    $('#userCredentialModal .modal-body').append(userCredential); 

                    setTimeout(function() {
                        $('#userCredentialModal').modal('show'); 
                    }, 700)

                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });

        $('#addUserModal').modal('hide'); 
    })
}

function setIdModal(id) {
    $('#modalUserList').modal('hide'); 
    $("#userIdForRemove").val(id)
    $('#userDeleteModal').modal('show'); 
}

function DeleteUser(){
    $("#btnDeleteUserModal").click(function() {

        loadPageAnimation(true)

        const userId = $("#userIdForRemove").val()

        $.ajax({
            type: 'DELETE',
            url: "/user/remove/" + userId,
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "success")

                    $("#userIdItem_" + userId).remove()
                    
                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });
        
        $('#userDeleteModal').modal('hide');
    })
}

function setForUserRegeneratePasswordModal(id) {
    $('#modalUserList').modal('hide'); 
    $("#userRegeneratePasswordModal").val(id)
    $('#userRegeneratePasswordModal').modal('show'); 
}

function RegeneratePasswordUser(){
    $("#btnUserRegeneratePassword").click(function() {

        loadPageAnimation(true)

        const userId = $("#userRegeneratePasswordModal").val()

        $.ajax({
            type: 'POST',
            url: "/user/regeneratePassword/" + userId,
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "success")

                    $('#userCredentialModal .modal-body').html("");

                    const userCredential = `Login: <h4>${result.user.Login}</h4><br />Nova Senha: <h4>${result.user.NewPassword}</h4>`

                    $('#userCredentialModal .modal-body').append(userCredential); 

                    setTimeout(function() {
                        $('#userCredentialModal').modal('show'); 
                    }, 700)
                    
                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });
        
        $('#userRegeneratePasswordModal').modal('hide');
    })
}

function setInfosForEditUserModal(id) {
    $('#modalUserList').modal('hide'); 

    loadPageAnimation(true)

    $.ajax({
        type: 'GET',
        url: "/user/getUserById/" + id,
        error: function (error) {
            loadPageAnimation(false)
            loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
        },
        success: function (result) { 
            if(result.status === 'success') {                
                $("#userIdforEditUser").val(result.user.id)

                const userName = result.user.Login.split("."); 

                $("#nameEditUser").val(userName[1])
                $("#lastNameEditUser").val(userName[2])

                setTimeout(function() {
                    loadPageAnimation(false)                    
                    $('#editUserModal').modal('show'); 
                }, 300)
            }else{
                loadPageAnimation(false)                    
                loadToastNotification(result.message, "danger")
            }
        }
    });
}

function EditUser(){
    $("#editUserForm").submit(function(event) {

        loadPageAnimation(true)

        event.preventDefault();

        
        const name = removeSpecialChars($("#nameEditUser").val().toLowerCase());
        const lastName = removeSpecialChars($("#lastNameEditUser").val().toLowerCase());

        var formData = {
            login:  `${name}.${lastName}`,
            userId: $("#userIdforEditUser").val()
        };

        $.ajax({
            type: 'PUT',
            url: "/user/update",
            data: formData,
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "success")

                    $('#userCredentialModal .modal-body').html("");

                    const userCredential = `Login: <h4>${result.user.Login}</h4><br />`

                    $('#userCredentialModal .modal-body').append(userCredential); 

                    $('#editUserModal').modal('hide'); 

                    setTimeout(function() {
                        $('#userCredentialModal').modal('show'); 
                    }, 700)

                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });

        $('#editUserModal').modal('hide'); 
    })
}

function GetSetorListForOptions(){
    $("#btnSetores").click(function() {
        loadPageAnimation(true)

        $.ajax({
            type: 'GET',
            url: "/setor/getSetores",
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    $(".setorItem").remove()

                    result.setorList.forEach(setor => {
                        const newRow = `
                        <tr id="setorIdItem_${setor.id}" class="setorItem">
                            <td>
                                ${setor.Nome}
                            </td>
                            <td>
                                ${setor.Ub.Nome}
                            </td>
                            <td>
                                <span style="cursor: pointer;" onClick="setIdForRemoveSetorModal(${setor.id})">
                                    <img title="Excluir setor" src="/icons/x-circle-fill.svg" alt="Excluir setor" height="20rem">
                                </span>
                            </td>
                        </tr>
                        `
                        $("#setorListTable tbody").append(newRow)
                    });

                    setTimeout(function() {
                        loadPageAnimation(false)                    
                        $('#modalSetorList').modal('show'); 
                    }, 300)

                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });

    })
}

function CreateSetor(){
    $("#btnAddSetor").click(function() {
        $('#modalSetorList').modal('hide'); 
        $('#addSetorModal').modal('show');

        $.ajax({
            type: 'GET',
            url: "/ubs/getAll",
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    $("#ubsIdForAddSetor").html('<option value="" selected>Selecione</option>');
                    
                    result.ubsList.forEach(ubs => {
                        $("#ubsIdForAddSetor").append(`<option value="${ubs.id}">${ubs.Nome}</option>`)
                    });

                }else if(result.status === 'false'){
                    $('#addSetorModal').modal('hide');
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }else{
                    $('#addSetorModal').modal('hide');
                    loadPageAnimation(false)
                    loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
                }

            }
        });
    })

    $("#createSetorForm").submit(function(event) {

        loadPageAnimation(true)

        event.preventDefault();

        var formData = {
            name: $("#setorName").val(),
            ubsId: $("#ubsIdForAddSetor").val()
        };

        $.ajax({
            type: 'POST',
            url: "/setor/insert",
            data: formData,
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "success")

                    $('#userCredentialModal .modal-body').html("");

                    const userCredential = `Setor: <h4>${$("#setorName").val()}</h4> cadastrado com sucesso`

                    $('#userCredentialModal .modal-body').append(userCredential); 
                    
                    $("#ubsIdForAddSetor").val("")
                    $("#setorName").val("")

                    setTimeout(function() {
                        $('#userCredentialModal').modal('show'); 
                    }, 700)

                }else if(result.status === 'false'){
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }else{
                    loadPageAnimation(false)
                    loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
                }
            }
        });

        $('#addSetorModal').modal('hide'); 
    })
}

function setIdForRemoveSetorModal(id) {
    $('#modalSetorList').modal('hide'); 
    $("#setorIdForRemove").val(id)
    $('#setorDeleteModal').modal('show'); 
}

function DeleteSetor(){
    $("#btnDeleteSetorModal").click(function() {

        loadPageAnimation(true)

        const setorId = $("#setorIdForRemove").val()

        $.ajax({
            type: 'DELETE',
            url: "/setor/remove/" + setorId,
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "success")

                    $("#setorIdItem_" + setorId).remove()
                    
                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });
        
        $('#setorDeleteModal').modal('hide');
    })
}

function GetUbsListForOptions(){
    $("#btnUbs").click(function() {
        try {
            loadPageAnimation(true)
    
            $.ajax({
                type: 'GET',
                url: "/ubs/getAll",
                error: function (error) {
                    loadPageAnimation(false)
                    loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
                },
                success: function (result) { 
                    if(result.status === 'success') {
                        $(".ubsItem").remove()
    
                        result.ubsList.forEach(ubs => {
                            const newRow = `
                            <tr id="ubsIdItem_${ubs.id}" class="ubsItem">
                                <td>
                                    ${ubs.Nome}
                                </td>
                                <td>
                                    <span style="cursor: pointer;" onClick="setIdForRemoveUbsModal(${ubs.id})">
                                        <img title="Excluir UBS" src="/icons/x-circle-fill.svg" alt="Excluir UBS" height="20rem">
                                    </span>
                                </td>
                            </tr>
                            `
                            $("#ubsListTable tbody").append(newRow)
                        });
    
                        setTimeout(function() {
                            loadPageAnimation(false)                    
                            $('#modalUbsList').modal('show'); 
                        }, 300)
    
                    }else if(result.status === 'false'){
                        loadPageAnimation(false)                    
                        loadToastNotification(result.message, "danger")
                    }else{
                        loadPageAnimation(false)
                        loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
                    }

                }
            });
        } catch (error) {
            loadPageAnimation(false)
            loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
        }

    })
}

function CreateUbs(){
    $("#btnAddUbs").click(function() {
        $('#modalUbsList').modal('hide'); 
        $('#addUbsModal').modal('show'); 
    })

    $("#createUbsForm").submit(function(event) {

        loadPageAnimation(true)

        event.preventDefault();

        var formData = {
            name: $("#ubsName").val()
        };

        $.ajax({
            type: 'POST',
            url: "/ubs/insert",
            data: formData,
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "success")

                    $('#userCredentialModal .modal-body').html("");

                    const userCredential = `Unidade Básica de Saúde: <h4>${$("#ubsName").val()}</h4> cadastrado com sucesso`

                    $('#userCredentialModal .modal-body').append(userCredential); 

                    $('#addUbsModal').modal('hide'); 

                    $("#ubsName").val("")

                    setTimeout(function() {
                        $('#userCredentialModal').modal('show'); 
                    }, 700)

                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });

        $('#addUbsModal').modal('hide'); 
    })
}

function setIdForRemoveUbsModal(id) {
    $('#modalUbsList').modal('hide'); 
    $("#ubsIdForRemove").val(id)
    $('#ubsDeleteModal').modal('show'); 
}

function DeleteUbs(){
    $("#btnDeleteUbsModal").click(function() {

        loadPageAnimation(true)

        const ubsId = $("#ubsIdForRemove").val()

        $.ajax({
            type: 'DELETE',
            url: "/ubs/remove/" + ubsId,
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "success")

                    $("#ubsIdItem_" + ubsId).remove()
                    
                }else if(result.status === 'false'){
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }else {
                    loadPageAnimation(false)
                    loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
                }
            }
        });
        
        $('#setorDeleteModal').modal('hide');
    })
}

function ValidateAddUserModal(){
    $('#ubsIdForAddUser').on('change', function() {
        if(!this.value)
            $("#setorIdForAddUser").prop("disabled", true);
        else{
            $("#setorIdForAddUser").find('option[text="Selecione"]').attr("selected", true);
            $(".ubsIdForSetorSelect").hide();
            $(`.ubsIdForSetorSelect_${this.value}`).show();
            $('#setorIdForAddUser option:first').prop('selected',true);
            $("#setorIdForAddUser").prop("disabled", false);
        }
    });
}

function GetVideoListForOptions(){
    $("#btnVideos").click(function() {
        try {
            loadPageAnimation(true)
    
            $.ajax({
                type: 'GET',
                url: "/video/getAll",
                error: function (error) {
                    loadPageAnimation(false)
                    loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
                },
                success: function (result) { 
                    if(result.status === 'success') {
                        $(".videoItem").remove()
                        result.videoList.forEach(video => {
                            const newRow = `
                            <tr id="videoIdItem_${video.id}" class="videoItem">
                                <td>
                                    ${video.Ub.Nome}
                                </td>
                                <td>
                                    <a href="${video.Path}" target="_blank" style="cursor: pointer; text-decoration: none;">
                                        <img title="Assistir Vídeo" src="/icons/file-earmark-play-fill.svg" alt="Assistir Vídeo" height="20rem">
                                    </a>
                                </td>
                                <td>
                                    <span style="cursor: pointer;" onClick="setIdForRemoveVideoModal(${video.id})">
                                        <img title="Excluir Vídeo" src="/icons/x-circle-fill.svg" alt="Excluir Vídeo" height="20rem">
                                    </span>
                                </td>
                            </tr>
                            `
                            $("#videoListTable tbody").append(newRow)
                        });
    
                        setTimeout(function() {
                            loadPageAnimation(false)                    
                            $('#modalVideoList').modal('show'); 
                        }, 300)
    
                    }else if(result.status === 'false'){
                        loadPageAnimation(false)                    
                        loadToastNotification(result.message, "danger")
                    }else{
                        loadPageAnimation(false)
                        loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
                    }

                }
            });
        } catch (error) {
            loadPageAnimation(false)
            loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
        }

    })
}

function CreateVideo(){
    $("#btnAddVideo").click(function() {
        $('#modalVideoList').modal('hide'); 
        $('#addVideoModal').modal('show'); 

        $.ajax({
            type: 'GET',
            url: "/ubs/getAll",
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    $("#ubsIdForAddVideo").html('<option value="" selected>Selecione</option>');
                    
                    result.ubsList.forEach(ubs => {
                        $("#ubsIdForAddVideo").append(`<option value="${ubs.id}">${ubs.Nome}</option>`)
                    });
    
                }else if(result.status === 'false'){
                    $('#addVideoModal').modal('hide');
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }else{
                    $('#addVideoModal').modal('hide');
                    loadPageAnimation(false)
                    loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
                }
    
            }
        });
    })

    $("#createVideoForm").submit(function(event) {

        loadPageAnimation(true)

        event.preventDefault();

        var formData = new FormData(this);

        const extension = $('input[type=file]').val().replace(/C:\\fakepath\\/i, '').split('.').pop();
        if(extension != "mp4"){

            loadPageAnimation(false)

            loadToastNotification("Somente arquivos no formato mp4 são permitidos", "danger")
            
            return
        }

        $.ajax({
            type: 'POST',
            enctype: 'multipart/form-data',
            url: "/video/insert",
            data: formData,
            processData: false,
            contentType: false,
            cache: false,
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Não foi possível adicionar o vídeo", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "success")
                                        
                    $("ubsIdForAddVideo").val("")
                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });

        $('#addVideoModal').modal('hide'); 
    })
}

function setIdForRemoveVideoModal(id) {
    $('#modalVideoList').modal('hide'); 
    $("#videoIdForRemove").val(id)
    $('#videoDeleteModal').modal('show'); 
}

function DeleteVideo(){
    $("#btnDeleteVideoModal").click(function() {

        loadPageAnimation(true)

        const videoId = $("#videoIdForRemove").val()

        $.ajax({
            type: 'DELETE',
            url: "/video/remove/" + videoId,
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "success")

                    $("#videoIdItem_" + videoId).remove()
                    
                }else if(result.status === 'false'){
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }else {
                    loadPageAnimation(false)
                    loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
                }
            }
        });
        
        $('#videoDeleteModal').modal('hide');
    })
}

function GetLocalListForOptions(){
    $("#btnLocals").click(function() {
        loadPageAnimation(true)

        $.ajax({
            type: 'GET',
            url: "/local/getAllLocals",
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    $(".localItem").remove()

                    result.localList.forEach(local => {
                        const newRow = `
                        <tr id="localIdItem_${local.id}" class="localItem">
                            <td>
                                ${local.Nome}
                            </td>
                            <td>
                                ${local.Ub.Nome}
                            </td>
                            <td>
                                <span style="cursor: pointer;" onClick="setIdForRemoveLocalModal(${local.id})">
                                    <img title="Excluir consultório" src="/icons/x-circle-fill.svg" alt="Excluir consultório" height="20rem">
                                </span>
                            </td>
                        </tr>
                        `
                        $("#localListTable tbody").append(newRow)
                    });

                    setTimeout(function() {
                        loadPageAnimation(false)                    
                        $('#modalLocalList').modal('show'); 
                    }, 300)

                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });

    })
}

function CreateLocal(){
    $("#btnAddLocal").click(function() {
        $('#modalLocalList').modal('hide'); 
        $('#addLocalModal').modal('show');

        $.ajax({
            type: 'GET',
            url: "/ubs/getAll",
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    $("#ubsIdForAddLocal").html('<option value="" selected>Selecione</option>');
                    
                    result.ubsList.forEach(ubs => {
                        $("#ubsIdForAddLocal").append(`<option value="${ubs.id}">${ubs.Nome}</option>`)
                    });

                }else if(result.status === 'false'){
                    $('#addLocalModal').modal('hide');
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }else{
                    $('#addLocalModal').modal('hide');
                    loadPageAnimation(false)
                    loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
                }

            }
        });
    })

    $("#createLocalForm").submit(function(event) {

        loadPageAnimation(true)

        event.preventDefault();

        var formData = {
            name: $("#localName").val(),
            ubsId: $("#ubsIdForAddLocal").val()
        };

        $.ajax({
            type: 'POST',
            url: "/local/insert",
            data: formData,
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "success")

                    $('#userCredentialModal .modal-body').html("");

                    const userCredential = `Local: <h4>${$("#localName").val()}</h4> cadastrado com sucesso`

                    $('#userCredentialModal .modal-body').append(userCredential); 
                    
                    $("#ubsIdForAddLocal").val("")
                    $("#localName").val("")

                    setTimeout(function() {
                        $('#userCredentialModal').modal('show'); 
                    }, 700)

                }else if(result.status === 'false'){
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }else{
                    loadPageAnimation(false)
                    loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
                }
            }
        });

        $('#addLocalModal').modal('hide'); 
    })
}

function setIdForRemoveLocalModal(id) {
    $('#modalLocalList').modal('hide'); 
    $("#localIdForRemove").val(id)
    $('#localDeleteModal').modal('show'); 
}

function DeleteLocal(){
    $("#btnDeleteLocalModal").click(function() {

        loadPageAnimation(true)

        const localId = $("#localIdForRemove").val()

        $.ajax({
            type: 'DELETE',
            url: "/local/remove/" + localId,
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "success")

                    $("#localIdItem_" + localId).remove()
                    
                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });
        
        $('#localDeleteModal').modal('hide');
    })
}