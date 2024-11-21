// Array to hold drinks data
let drinks = [];

// Function to update the graph
function updateGraph() {
  const now = new Date();

  const startTime = new Date(now);
  startTime.setHours(6, 0, 0, 0); 

  const futureTimes = [];
  const caffeineLevels = [];

  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j++) { 
      const time = new Date(startTime.getTime() + (i * 60 + j) * 60 * 1000); 
      let totalCaffeine = 0;

      drinks.forEach(({ caffeine, time: drinkTime }) => {
        const timeElapsed = (time - new Date(drinkTime)) / (60 * 60 * 1000); 
        if (timeElapsed >= 0) {
          totalCaffeine += calculateCaffeineDecay(caffeine, timeElapsed);
        }
      });

      futureTimes.push(time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      caffeineLevels.push(totalCaffeine);
    }
  }

  caffeineChart.data.labels = futureTimes;
  caffeineChart.data.datasets[0].data = caffeineLevels;
  caffeineChart.update();
}

// Calculate caffeine decay
function calculateCaffeineDecay(initialCaffeine, timeElapsed, halfLife = 5) {
  const absorptionTime = 0.75; 

  function easeIn(t) {
    return t * t;
  }

  if (timeElapsed < absorptionTime) {
    const easedTime = easeIn(timeElapsed / absorptionTime);  
    return initialCaffeine * (1 - Math.exp(-10 * easedTime));  
  }

  const effectiveTimeElapsed = timeElapsed - absorptionTime; 
  return initialCaffeine * Math.pow(0.5, effectiveTimeElapsed / halfLife); 
}

// Chart.js setup
const ctx = document.getElementById("caffeine-graph").getContext("2d");
const caffeineChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [], 
    datasets: [
      {
        label: "Caffeine Level (mg)",
        data: [], 
        borderColor: "rgb(75, 192, 192)",
        tension: 0.3,
        fill: false,
        pointRadius: 0,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: "Time" },
        min: 0,
        ticks: {
          autoSkip: true,
          maxTicksLimit: 24, 
        }
      },
      y: {
        title: { display: true, text: "Caffeine (mg)" },
        min: 0,
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
        mode: 'nearest', 
        intersect: false, 
        position: 'nearest',
        callbacks: {
          label: function(context) {
            const time = context.label;
            const caffeine = context.raw.toFixed(2);  
            return `Time: ${time}, Caffeine: ${caffeine} mg`;
          },
        },
      },
    },
  },
});
