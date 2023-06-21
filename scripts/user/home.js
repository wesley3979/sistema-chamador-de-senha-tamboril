$(document).ready(function() {
    ChamarSenha()
    EditMyPassword()
    EditMyUser()
    RegerarSenha()
    FinalizarSenha()
    BaixarRelatório()

    $("#FilaAtendimentoToPdf").hide()
});

const socket = io();

socket.on('connect', () => {});

socket.on('senhas pendentes', (senhas) => {
    $("#tableFilaAtendimento tbody").html("");

    let index = 0 
    senhas.forEach(senha => {
        if(senha.Setor.id == $("#userSetorId").val()){
            $("#tableFilaAtendimento tbody").append(
                `<tr>
                    <th scope="row">${index + 1}°</th>
                    <td>${senha.Numero}</td>
                    <td>${senha.Paciente}</td>
                    <td>${senha.Preferencial ? "Sim" : "Não"}</td>
                    <td>
                        <i class="fas fa-solid fa-circle" style="color: #2196F3;"></i>
                        Na Fila
                    </td>
                </tr>`
            )
            
            index++;
        }
    })
    
    var rowCount = $("#tableFilaAtendimento tbody tr").length;
    $("#quantidadeSenhaPendente").html(rowCount)
    
    if(rowCount == 0){
        $("#tableFilaAtendimento tbody").append(
            `<tr class="text-center">
                <td colspan="5">Não há pacientes na fila</td>
            </tr>`
        )
    }
});

socket.on('senhas atendidas', (senhas) => {
    $("#tableHistoricoAtendimento tbody").html("");

    username = $("#username").html().split(".");

    username[1] = username[1].replace(/(^\w{1})|(\s+\w{1})/g, letra => letra.toUpperCase());
    username[2] = username[2].replace(/(^\w{1})|(\s+\w{1})/g, letra => letra.toUpperCase());

    let index = 0 
    senhas.forEach(senha => {
        if(senha.Setor.id == $("#userSetorId").val()){
            $("#tableHistoricoAtendimento tbody").append(
                `<tr>
                    <th scope="row">${index + 1}°</th>
                    <td>${senha.Numero}</td>
                    <td>${senha.Paciente}</td>
                    <td>${senha.Preferencial ? "Sim" : "Não"}</td>
                    <td>
                        <i class="fas fa-solid fa-circle" style="color: #18a974;"></i>
                        Atendido
                    </td>
                </tr>`
            )
            
            //table for pdf
            $("#TableFilaAtendimentoToPdf tbody").append(
                `<tr>
                    <td>${senha.Numero}</td>
                    <td>${senha.Paciente}</td>
                    <td>${username[1]} ${username[2]}</td>
                    <td>${senha.Setor.Nome}</td>
                </tr>`
            )

            index++;
        }
    })

    var rowCount = $("#tableHistoricoAtendimento tbody tr").length;

    if(rowCount == 0){
        $("#tableHistoricoAtendimento tbody").append(
            `<tr class="text-center">
                <td colspan="5">Não há pacientes atendidos</td>
            </tr>`
        )
    }

    //table for pdf
    $("#totalPdf").html(`Número de atendimentos: ${rowCount}`)
});

function setIdModal(id) {
    $("#senhaIdForCancel").val(id)
}

function GetMyUserInfosForEdit(){
    $("#btnMeuUsuario").click(function() {
        loadPageAnimation(true)

        $.ajax({
            type: 'GET',
            url: "/user/getMyUserById",
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente fazer login novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {

                    const userName = result.user.Login.split("."); 

                    $("#myUserName").val(userName[0])
                    $("#myUserLastName").val(userName[1])
                    $("#myUserIdForEdit").val(result.user.id)

                    setTimeout(function() {
                        loadPageAnimation(false)                    
                        $('#editMyUserModal').modal('show'); 
                    }, 300)

                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });

    })
}

function LoadEditPasswordModal(){
    $("#btnLoadEditPasswordModal").click(function() {
        $('#editMyUserModal').modal('hide'); 
        $('#editMyPasswordModal').modal('show'); 
    })
}

function EditMyPassword(){
    $("#editMyPasswordForm").submit(function(event) {

        loadPageAnimation(true)

        event.preventDefault();
        
        if($("#newPassword").val() != $("#confirmNewPassword").val()){
            loadPageAnimation(false)
            loadToastNotification("A nova senha e a confirmação da nova senha devem ser iguais", "danger")
            $('#editMyPasswordModal').modal('hide'); 

            setTimeout(function() {
                $('#editMyPasswordModal').modal('show'); 
            }, 1500)

            return;
        }

        var formData = {
            oldPassword: $("#oldPassword").val(),
            newPassword: $("#newPassword").val(),
        };

        $.ajax({
            type: 'POST',
            url: "/user/changeMyPassword",
            data: formData,
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente fazer login novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "success")
                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });

        $('#editMyPasswordModal').modal('hide'); 
    })
}

function ChamarSenha(){
    $("#chamarSenha").click(function() {
        loadPageAnimation(true)
        
        var formData = {
            setorId: $("#userSetorId").val(),
        };
    
        $.ajax({
            type: 'POST',
            url: "/chamarSenha",
            data: formData,
            error: function (error) {
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadToastNotification("Paciente chamado", "success")

                    $("#atendimentoAtual").fadeOut()

                    if(result.senha){
                        $("#atendimentoAtual").html(`
                            <div class="col mr-2">
                                <div class="text font-weight-bold text-success text-uppercase mb-1">
                                    Atendimento Atual
                                </div>
                                <div id="nomePacienteAtual" class="h5 mb-0 font-weight-bold text-gray-800">
                                    ${result.senha.Paciente}
                                </div>
                                <div id="senhaPacienteAtual" class="text-xs h5 mb-0 font-weight-bold text-gray-800">
                                    ${result.senha.Numero}
                                </div>
                            </div>
                            <div class="col-auto">
                                <a href="#" title="Chamar novamente" id="btnRegerarSenha" data-id="${result.senha.id}" style="text-decoration: none;">
                                    <i class="fas fa-sync-alt fa-2x" style="color: #ffd43b"></i>
                                </a>
                                <a class="mx-3" href="#" title="Encerrar Atendimento" id="btnEncerrarSenha" data-id="${result.senha.id}" style="text-decoration: none;">
                                    <i class="fas fa-check fa-2x" style="color: #18a974"></i>
                                </a>
                            </div>
                        `)
                    }else{
                        $("#atendimentoAtual").html(`
                            <div class="col mr-2">
                                <div class="text font-weight-bold text-success text-uppercase mb-1">
                                    Atendimento Atual
                                </div>
                                <div id="nomePacienteAtual" class="h5 mb-0 font-weight-bold text-gray-800">(Não há paciente em atendimento)</div>
                                <div id="senhaPacienteAtual" class="text-xs h5 mb-0 font-weight-bold text-gray-800"></div>
                            </div>
                        `)
                    }

                    $("#atendimentoAtual").fadeIn()

                    $('#btnRegerarSenha').off('click'); 
                    RegerarSenha()

                    $('#btnEncerrarSenha').off('click'); 
                    FinalizarSenha()
                    
                }else if(result.status === 'false'){
                    loadToastNotification(result.message, "danger")
                }else{
                    loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
                }
            }
        });
        
        loadPageAnimation(false)
    })
}

function EditMyPassword(){
    $("#editMyPasswordForm").submit(function(event) {

        loadPageAnimation(true)

        event.preventDefault();
        
        if($("#newPassword").val() != $("#confirmNewPassword").val()){
            loadPageAnimation(false)
            loadToastNotification("A nova senha e a confirmação da nova senha devem ser iguais", "danger")
            $('#editMyPasswordModal').modal('hide'); 

            setTimeout(function() {
                $('#editMyPasswordModal').modal('show'); 
            }, 1500)

            return;
        }

        var formData = {
            oldPassword: $("#oldPassword").val(),
            newPassword: $("#newPassword").val(),
        };

        $.ajax({
            type: 'POST',
            url: "/user/changeMyPassword",
            data: formData,
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "success")
                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });

        $('#editMyPasswordModal').modal('hide'); 
    })
}

function EditMyUser(){
    $("#editMyUserForm").submit(function(event) {

        loadPageAnimation(true)

        event.preventDefault();

        const name = removeSpecialChars($("#myUserName").val().toLowerCase());
        const lastName = removeSpecialChars($("#myUserLastName").val().toLowerCase());

        var formData = {
            login:  `${name}.${lastName}`,
            userId: $("#userId").val()
        };

        $.ajax({
            type: 'PUT',
            url: "/user/myUpdate",
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

                    const userCredential = `Novo Login: <h4>${result.user.Login}</h4><br />`

                    $('#userCredentialModal .modal-body').append(userCredential); 

                    $('#editUserModal').modal('hide'); 

                    setTimeout(function() {
                        $('#userCredentialModal').modal('show'); 
                    }, 700)

                    $("#username").html(result.user.Login)

                }else{
                    loadPageAnimation(false)                    
                    loadToastNotification(result.message, "danger")
                }
            }
        });

        $('#editMyUserModal').modal('hide'); 
    })
}

function RegerarSenha(){
    $("#btnRegerarSenha").click(function() {
        loadPageAnimation(true)
        var formData = {
            senhaId:  $(this).attr("data-id")
        };
            
        $.ajax({
            type: 'POST',
            url: "/regerarSenha",
            data: formData,
            error: function (error) {
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadToastNotification("O paciente foi chamado novamente", "success")
                }else if(result.status === 'false'){
                    loadToastNotification(result.message, "danger")
                }else{
                    loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
                }
            }
        });
        
        loadPageAnimation(false)                    
    })
}

function FinalizarSenha(){
    $("#btnEncerrarSenha").click(function() {
        loadPageAnimation(true)

        var formData = {
            senhaId:  $(this).attr("data-id")
        };
            
        $.ajax({
            type: 'POST',
            url: "/finalizarSenha",
            data: formData,
            error: function (error) {
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) { 
                if(result.status === 'success') {
                    loadToastNotification("Atendimento finalizado", "success")

                    $("#atendimentoAtual").html(`
                            <div class="col mr-2">
                                <div class="text font-weight-bold text-success text-uppercase mb-1">
                                    Atendimento Atual
                                </div>
                                <div id="nomePacienteAtual" class="h5 mb-0 font-weight-bold text-gray-800">(Não há paciente em atendimento)</div>
                                <div id="senhaPacienteAtual" class="text-xs h5 mb-0 font-weight-bold text-gray-800"></div>
                            </div>
                    `)

                }else if(result.status === 'false'){
                    loadToastNotification(result.message, "danger")
                }else{
                    loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
                }
            }
        });
        
        loadPageAnimation(false)                    
    })
}

function BaixarRelatório(){
    $('#btnBaixarRelatorio').click(function () {
        $("#FilaAtendimentoToPdf").show()

        var date = new Date().
        toLocaleString('pt-BR', {year: 'numeric', month: '2-digit', day: '2-digit'}).
        replace(/(\d+)\/(\d+)\/(\d+)/, '$1-$2-$3');

        $("#datePdf").html(`Data: ${date.replaceAll("-", "/")}`)

        var pdf = new jsPDF('p', 'pt', 'letter');

        source = $('#FilaAtendimentoToPdf')[0];
        specialElementHandlers = {
            '#bypassme': function (element, renderer) {
                return true
            }
        };
        margins = {
            top: 40,
            bottom: 60,
            left: 40,
            width: 522
        };
        
        pdf.fromHTML(
        source, 
        margins.left,
        margins.top, { 
            'width': margins.width,
            'elementHandlers': specialElementHandlers
        },

        function (dispose) {
            pdf.save(`Relatorio_${date}.pdf`);
        }, margins);

        $("#FilaAtendimentoToPdf").hide()
    });
}