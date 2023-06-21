$(document).ready(function () {
    CadastrarSenha()
    EditMyPassword()
    EditMyUser()
    PrinterSenha()
    cancelarSenha()
    BaixarRelatório()

    $("#FilaAtendimentoToPdf").hide()
    $("#imprimirDiv").hide()
});

// Cria uma conexão com o servidor
const socket = io();

// Escuta o evento 'connect' quando a conexão é estabelecida
socket.on('connect', () => { });

// Escuta o evento 'cadastro senha' enviado pelo servidor
socket.on('senhas pendentes', (senhas) => {
    $("#tableFilaAtendimento tbody").html("");

    let index = 0
    senhas.forEach(senha => {
        if (senha.Setor.UbsId == $("#userUbsId").val()) {
            $("#tableFilaAtendimento tbody").append(
                `<tr>
                    <th scope="row">${index + 1}°</th>
                    <td>${senha.Numero}</td>
                    <td>${senha.Paciente}</td>
                    <td>${senha.Setor.Nome}</td>
                    <td>${senha.Preferencial ? "Sim" : "Não"}</td>
                    <td>
                        <i class="fas fa-solid fa-circle" style="color: #f7c23e;"></i>
                        Na Fila
                    </td>
                    <td>
                        <a onClick="setIdModal(${senha.id})" href="" class="d-flex justify-content-center" style="text-decoration: none;" data-toggle="modal" data-target="#cancelarSenhaModal">
                            <i class="fas fa-times" style="color: #dc3545;"></i>
                        </a>
                    </td>
                </tr>`
            )
            index++
        }
    })

    var rowCount = $("#tableFilaAtendimento tbody tr").length;
    $("#quantidadeSenhaPendente").html(rowCount)

    if (rowCount == 0) {
        $("#tableFilaAtendimento tbody").append(
            `<tr class="text-center">
                <td colspan="7">Não há pacientes na fila</td>
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
        if (senha.Setor.UbsId == $("#userUbsId").val()) {
            $("#tableHistoricoAtendimento tbody").append(
                `<tr>
                    <th scope="row">${index + 1}°</th>
                    <td>${senha.Numero}</td>
                    <td>${senha.Paciente}</td>
                    <td>${senha.Setor.Nome}</td>
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
                    <th scope="row">${index + 1}°</th>
                    <td>${senha.Numero}</td>
                    <td>${username[1]} ${username[2]}</td>
                    <td>${senha.Setor.Nome}</td>
                </tr>`
            )

            index++;
        }
    })

    var rowCount = $("#tableHistoricoAtendimento tbody tr").length;
    $("#quantidadeSenhaFinalizada").html(rowCount)

    if (rowCount == 0) {
        $("#tableHistoricoAtendimento tbody").append(
            `<tr class="text-center">
                <td colspan="6">Não há pacientes atendidos</td>
            </tr>`
        )
    }

    //table for pdf
    $("#totalPdf").html(`Número de atendimentos: ${rowCount}`)
});

function setIdModal(id) {
    $("#senhaIdForCancel").val(id)
}

function GetMyUserInfosForEdit() {
    $("#btnMeuUsuario").click(function () {
        loadPageAnimation(true)

        $.ajax({
            type: 'GET',
            url: "/user/getMyUserById",
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente fazer login novamente em instantes", "danger")
            },
            success: function (result) {
                if (result.status === 'success') {

                    const userName = result.user.Login.split(".");

                    $("#myUserName").val(userName[0])
                    $("#myUserLastName").val(userName[1])
                    $("#myUserIdForEdit").val(result.user.id)

                    setTimeout(function () {
                        loadPageAnimation(false)
                        $('#editMyUserModal').modal('show');
                    }, 300)

                } else {
                    loadPageAnimation(false)
                    loadToastNotification(result.message, "danger")
                }
            }
        });

    })
}

function LoadEditPasswordModal() {
    $("#btnLoadEditPasswordModal").click(function () {
        $('#editMyUserModal').modal('hide');
        $('#editMyPasswordModal').modal('show');
    })
}

function EditMyPassword() {
    $("#editMyPasswordForm").submit(function (event) {

        loadPageAnimation(true)

        event.preventDefault();

        if ($("#newPassword").val() != $("#confirmNewPassword").val()) {
            loadPageAnimation(false)
            loadToastNotification("A nova senha e a confirmação da nova senha devem ser iguais", "danger")
            $('#editMyPasswordModal').modal('hide');

            setTimeout(function () {
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
                if (result.status === 'success') {
                    loadPageAnimation(false)
                    loadToastNotification(result.message, "success")
                } else {
                    loadPageAnimation(false)
                    loadToastNotification(result.message, "danger")
                }
            }
        });

        $('#editMyPasswordModal').modal('hide');
    })
}

function PrinterSenha() {
    $("#btnPrinter").click(function () {
        $('#imprimir').attr("hidden", false)
        $("#imprimirDiv").addClass("d-flex justify-content-start");
        $('#imprimirDiv').printThis({
            importCSS: true,
        });

        setTimeout(function () {
            $('#imprimir').attr("hidden", true)
            $("#imprimirDiv").removeClass("d-flex justify-content-start");
            $('#imprimirModal').modal('hide');
        }, 3000)
    })
}

function CadastrarSenha() {
    $("#cadastrarSenhaForm").submit(function (event) {
        loadPageAnimation(true)
        event.preventDefault();

        let preferencial = 0

        if ($('#preferencial').is(":checked"))
            preferencial = 1

        var formData = {
            paciente: $("#nomePaciente").val(),
            setorId: $("#setorSelect").val(),
            preferencial,
            UbsId: $("#userUbsId").val(),
        };

        $.ajax({
            type: 'POST',
            url: "/criarSenha",
            data: formData,
            error: function (error) {
                loadPageAnimation(false)
                $("#cadastrarSenhaModal").modal('hide');
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) {
                $("#cadastrarSenhaModal").modal('hide');
                loadPageAnimation(false)

                if (result.status === 'success') {
                    loadToastNotification("Senha Cadastrada com sucesso", "success")

                    setTimeout(function () {
                        $('#imprimirModal').modal('show');
                    }, 500)

                    $("#nomeImpressao").text(` ${result.senha.Paciente}`)
                    $("#setorImpressao").text(` ${result.setor.Nome}`)
                    $("#senhaImpressao").text(` ${result.senha.Numero}`)

                    $("#nomePaciente").val("")
                    $("#setorSelect").val("")

                } else if (result.status === 'false') {
                    loadToastNotification(result.message, "danger")
                } else {
                    loadToastNotification("Senha Cadastrada com sucesso", "success")
                }
            }
        });

    })
}

function EditMyPassword() {
    $("#editMyPasswordForm").submit(function (event) {

        loadPageAnimation(true)

        event.preventDefault();

        if ($("#newPassword").val() != $("#confirmNewPassword").val()) {
            loadPageAnimation(false)
            loadToastNotification("A nova senha e a confirmação da nova senha devem ser iguais", "danger")
            $('#editMyPasswordModal').modal('hide');

            setTimeout(function () {
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
                if (result.status === 'success') {
                    loadPageAnimation(false)
                    loadToastNotification(result.message, "success")
                } else {
                    loadPageAnimation(false)
                    loadToastNotification(result.message, "danger")
                }
            }
        });

        $('#editMyPasswordModal').modal('hide');
    })
}

function EditMyUser() {
    $("#editMyUserForm").submit(function (event) {

        loadPageAnimation(true)

        event.preventDefault();

        const name = removeSpecialChars($("#myUserName").val().toLowerCase());
        const lastName = removeSpecialChars($("#myUserLastName").val().toLowerCase());

        var formData = {
            login: `${name}.${lastName}`,
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
                if (result.status === 'success') {
                    loadPageAnimation(false)
                    loadToastNotification(result.message, "success")

                    $('#userCredentialModal .modal-body').html("");

                    const userCredential = `Novo Login: <h4>${result.user.Login}</h4><br />`

                    $('#userCredentialModal .modal-body').append(userCredential);

                    $('#editUserModal').modal('hide');

                    setTimeout(function () {
                        $('#userCredentialModal').modal('show');
                    }, 700)

                    $("#username").html(result.user.Login)

                } else {
                    loadPageAnimation(false)
                    loadToastNotification(result.message, "danger")
                }
            }
        });

        $('#editMyUserModal').modal('hide');
    })
}

function cancelarSenha() {
    $("#cancelarSenhaForm").submit(function (event) {

        loadPageAnimation(true)

        event.preventDefault();

        var formData = {
            senhaId: $("#senhaIdForCancel").val()
        };

        $.ajax({
            type: 'POST',
            url: "/cancelarSenha",
            data: formData,
            error: function (error) {
                loadPageAnimation(false)
                loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
            },
            success: function (result) {
                if (result.status === 'success') {
                    loadPageAnimation(false)
                    loadToastNotification(result.message, "success")

                } else if (result.status === 'false') {
                    loadPageAnimation(false)
                    loadToastNotification(result.message, "danger")
                } else {
                    loadPageAnimation(false)
                    loadToastNotification("Erro interno, estamos solucionando o problema, tente novamente em instantes", "danger")
                }
            }
        });

        $('#cancelarSenhaModal').modal('hide');
    })
}

function BaixarRelatório() {
    $('#btnBaixarRelatorio').click(function () {
        $("#FilaAtendimentoToPdf").show()

        var date = new Date().
            toLocaleString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' }).
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
