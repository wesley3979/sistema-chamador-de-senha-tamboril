var primeiraSenha = false;
var senhasParaChamar = [];

$(document).ready(function () {
  relogio();

  setInterval(async function () {
    if (senhasParaChamar[0]) {
      $("#principalPage").fadeOut();

      //MOVE AS SENHAS ANTIGAS
      const ultimaSenha_paciente = primeiraSenha
        ? $("#principalPage_paciente").html()
        : "";
      const ultimaSenha_numero = primeiraSenha
        ? $("#principalPage_numero").html()
        : "";
      const ultimaSenha_setor = primeiraSenha
        ? $("#principalPage_setor").html()
        : "";

      const penultimaSenha_paciente = $("#ultimaSenha_paciente").html();
      const penultimaSenha_numero_setor = $("#ultimaSenha_numero_setor").html();

      const antepenultimaSenha_paciente = $("#penultimaSenha_paciente").html();
      const antepenultimaSenha_numero_setor = $(
        "#penultimaSenha_numero_setor"
      ).html();

      $("#ultimaSenha_paciente").html(ultimaSenha_paciente);

      if ($("#principalPage_preferencial").val()) {
        $("#ultimaSenha_numero_setor").html(
          `<div class="w-75 rounded-pill justify-content-center align-items-center mx-5 p-1" style="background-color: #0080c1; border-radius: 30px;">
                        <span style="font-size: 1.3rem;">N°: </span>
                        <span style="font-size: 1.6rem;">${ultimaSenha_numero}</span>
                        <span style="font-size: 1.3rem;">Setor: </span>
                        <span style="font-size: 1.6rem;">${ultimaSenha_setor}</span>
                    </div>`
        );
      } else if ($("#principalPage_paciente").html() == "") {
        $("#ultimaSenha_numero_setor").html(
          `<div class="w-75 rounded-pill justify-content-center align-items-center mx-5 p-1" style="background-color: #2196F3; border-radius: 30px;">
                        <span style="font-size: 1.3rem;">N°: </span>
                        <span style="font-size: 1.6rem;">${ultimaSenha_numero}</span>
                        <span style="font-size: 1.3rem;">Setor: </span>
                        <span style="font-size: 1.6rem;">${ultimaSenha_setor}</span>
                    </div>`
        );
      }

      $("#penultimaSenha_paciente").html(penultimaSenha_paciente);
      $("#penultimaSenha_numero_setor").html(penultimaSenha_numero_setor);

      $("#antepenultimaSenha_paciente").html(antepenultimaSenha_paciente);
      $("#antepenultimaSenha_numero_setor").html(
        antepenultimaSenha_numero_setor
      );

      //DEFINE NOVA SENHA
      $("#principalPage_paciente").html(senhasParaChamar[0].Paciente);
      $("#principalPage_numero").html(senhasParaChamar[0].Numero);
      $("#principalPage_setor").html(senhasParaChamar[0].Setor.Nome);
      $("#principalPage_preferencial").val(senhasParaChamar[0].Preferencial);

      $("#chamadaSenhaPage_paciente").html(senhasParaChamar[0].Paciente);
      $("#chamadaSenhaPage_numero").html(senhasParaChamar[0].Numero);
      $("#chamadaSenhaPage_setor").html(senhasParaChamar[0].Setor.Nome);

      $("#chamadaSenhaPage").fadeIn();
      PlayAudioFunction(
        `${senhasParaChamar[0].Paciente} compareça ao ${senhasParaChamar[0].Setor.Nome}`
      );

      setTimeout(function () {
        $("#chamadaSenhaPage").fadeOut();
        $("#principalPage").fadeIn();
      }, 5000);

      senhasParaChamar.shift();
    }
  }, 7000);
});

// Cria uma conexão com o servidor
const socket = io();

// Escuta o evento 'connect' quando a conexão é estabelecida
socket.on("connect", () => {});

socket.on("painel", (senha) => {
  if (senha.Setor.UbsId == window.location.pathname.replace("/painel/", "")) {
    senhasParaChamar.push(senha);
  }
});

function PlayAudioFunction(texto) {
  var x = document.createElement("AUDIO");

  x.setAttribute("src", "audio/chamada.wav");
  x.setAttribute("autoplay", "");
  document.body.appendChild(x);

  var synth = window.speechSynthesis;
  var voices = synth.getVoices();

  var toSpeak = new SpeechSynthesisUtterance(texto);

  try {
    if (voices[16].Lang != "pt-BR") {
      voices.forEach((voice) => {
        if (voice.Lang == "pt-BR") toSpeak.voice = voice;
      });
    }
  } catch (error) {
    primeiraSenha = true;
  }

  setTimeout(function () {
    synth.speak(toSpeak);
  }, 700);
}

function relogio() {
  const horas = document.getElementById("horas");
  const minutos = document.getElementById("minutos");
  const segundos = document.getElementById("segundos");

  const relogio = setInterval(function time() {
    let dateToday = new Date();
    let hr = dateToday.getHours();
    let min = dateToday.getMinutes();
    let seg = dateToday.getSeconds();

    horas.textContent = dateToday.toLocaleTimeString();
  });
}
