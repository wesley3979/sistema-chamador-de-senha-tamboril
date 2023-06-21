$(document).ready(function() {
  GetSenhas()

  setInterval(async function() {
    GetSenhas()
  }, 1800000); //30min
});

function GetSenhas(){
  loadPageAnimation(true)

  $.ajax({
    type: 'GET',
    url: "/getSenhasCompletedToday",
    error: function (error) {
      loadPageAnimation(false)
      location.reload();
    },
    success: function (result) { 
      if(result.status === 'success') {
          loadCharts(result.senhas)
      }else{
          loadPageAnimation(false)                    
      }
    }
  });
}

function loadCharts(senhas){
  const mapeamentoDeArraysPorUbsId = {};
  for (const objeto of senhas) {
    const UbsId = objeto.Setor.UbsId;
    if (!mapeamentoDeArraysPorUbsId[UbsId]) {
      mapeamentoDeArraysPorUbsId[UbsId] = [];
    }
    mapeamentoDeArraysPorUbsId[UbsId].push(objeto);
  }
  
  const arraysSeparadosPorUbsId = Object.values(mapeamentoDeArraysPorUbsId);
  
  const tamanhosDosArrays = arraysSeparadosPorUbsId.map(array => array.length);

  const nomeDaUbsDosArrays = arraysSeparadosPorUbsId.map(array => array[0].Setor.Ub.Nome);

  new Chart(chart, {
    type: 'pie',
    data: {
      labels: nomeDaUbsDosArrays,
      datasets: [
        {
          data: tamanhosDosArrays,
          backgroundColor: [
            '#FF6633', '#FFB399', '#FF33FF', '#A90477', '#00B3E6', 
            '#E6B333', '#3366E6', '#999966', '#F03401', '#B34D4D',
            '#80B300', '#3BF9FF', '#2DEB99'
          ]
        }
      ]
    },
    plugins: [ChartDataLabels],
    options: {
      responsive: true,
      layout: {
        padding: {
          left: 235,
          right: 50
        }
      },
      borderWidth: 0,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          formatter: (value, context) => {
            const totalCount = context.dataset.data.reduce((a, b) => a + b);
            const percentage = Math.round(value / totalCount * 100);
            const minPercentage = 5; // Define o limite mínimo de porcentagem
            return percentage >= minPercentage ? `${value} (${percentage}%)` : value;
          },
          color: '#fff'
        },
        legend: {
          position: 'right',
        },
      },
      height: 150, // ajusta a altura do gráfico para 200 pixels
      width: 300 // ajusta a largura do gráfico para 300 pixels
    },
  });
}