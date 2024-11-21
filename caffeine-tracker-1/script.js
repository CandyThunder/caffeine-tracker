const presetDrinks = [
  { name: "Espresso", caffeine: 63 }, // Realistic caffeine content per shot
  { name: "Latte", caffeine: 75 }, // Realistic caffeine content for a regular latte
  { name: "Black Coffee", caffeine: 95 }, // Realistic caffeine content for an 8 oz cup
  { name: "Green Tea", caffeine: 30 }, // Realistic caffeine content for an 8 oz cup
  { name: "Energy Drink", caffeine: 80 }, // Realistic caffeine content for an energy drink (8 oz)
];

// Populate preset drink dropdown
const presetDropdown = document.getElementById("preset-drink");
presetDrinks.forEach((drink) => {
  const option = document.createElement("option");
  option.value = drink.caffeine;
  option.textContent = drink.name;
  presetDropdown.appendChild(option);
});

const drinks = [];

// Chart.js setup
const ctx = document.getElementById("caffeine-graph").getContext("2d");
const caffeineChart = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],  // Time labels
    datasets: [
      {
        label: "Caffeine Level (mg)",
        data: [],  // Caffeine data values
        borderColor: "rgb(75, 192, 192)",
        tension: 0.3,  // Smooth the line
        fill: false,   // Don't fill under the line
        pointRadius: 0, // Remove points at each data point
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
          maxTicksLimit: 24,  // Limit the number of x-axis labels
        }
      },
      y: {
        title: { display: true, text: "Caffeine (mg)" },
        min: 0,
      },
    },
    plugins: {
      tooltip: {
        enabled: true,  // Enable tooltips
        mode: 'nearest', // Tooltip will be displayed for the nearest data point
        intersect: false, // Tooltip is shown when hovering anywhere over the chart (not just on the line)
        position: 'nearest',  // Position the tooltip at the closest data point
        callbacks: {
          label: function(context) {
            const time = context.label;
            const caffeine = context.raw.toFixed(2);  // Format caffeine value to two decimal places
            return `Time: ${time}, Caffeine: ${caffeine} mg`;
          },
        },
      },
    },
  },
});

  


// Handle resizing dynamically
window.addEventListener("resize", () => {
  caffeineChart.resize(); // Manually resize the chart when the window resizes
});

// Save to localStorage
function saveDrinksToLocalStorage() {
  localStorage.setItem("drinks", JSON.stringify(drinks));
}

// Load from localStorage
function loadDrinksFromLocalStorage() {
  const savedDrinks = localStorage.getItem("drinks");
  if (savedDrinks) {
    drinks.push(...JSON.parse(savedDrinks));
    updateGraph();
  }
}

// Calculate caffeine decay with exponential growth during absorption and exponential decay after peak
function calculateCaffeineDecay(initialCaffeine, timeElapsed, halfLife = 5) {
    const absorptionTime = 0.75; // 45 minutes for absorption (in hours)
  
    // Ease-in function for smooth start (gradual increase)
    function easeIn(t) {
      return t * t; // Simple quadratic easing function (could adjust this)
    }
  
    // Phase 1: Exponential growth during absorption (first 45 minutes)
    if (timeElapsed < absorptionTime) {
      // Apply easing function to smooth the start of caffeine absorption
      const easedTime = easeIn(timeElapsed / absorptionTime);  // Normalize time for ease-in effect
      return initialCaffeine * (1 - Math.exp(-10 * easedTime));  // Exponential growth with easing
    }
  
    // Phase 2: Caffeine decay (after absorption, decay starts)
    const effectiveTimeElapsed = timeElapsed - absorptionTime; // Time after peak
    return initialCaffeine * Math.pow(0.5, effectiveTimeElapsed / halfLife);  // Exponential decay
  }
  
  
  // Update graph
function updateGraph() {
    const now = new Date();
  
    // Set start time to 6 AM today
    const startTime = new Date(now);
    startTime.setHours(6, 0, 0, 0); // Set hours to 6 AM and reset minutes, seconds, milliseconds
  
    const futureTimes = [];
    const caffeineLevels = [];
  
    // Generate the next 24 hours of data with 60 data points per hour
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j++) {  // Generate 60 data points per hour (one per minute)
        const time = new Date(startTime.getTime() + (i * 60 + j) * 60 * 1000); // Add one minute per iteration
        let totalCaffeine = 0;
  
        // Calculate caffeine decay for each drink
        drinks.forEach(({ caffeine, time: drinkTime }) => {
          const timeElapsed = (time - drinkTime) / (60 * 60 * 1000); // Calculate time elapsed in hours
          if (timeElapsed >= 0) {
            totalCaffeine += calculateCaffeineDecay(caffeine, timeElapsed);
          }
        });
  
        // Push formatted time and caffeine level
        futureTimes.push(time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
        caffeineLevels.push(totalCaffeine);
      }
    }
  
    // Update chart data
    caffeineChart.data.labels = futureTimes;
    caffeineChart.data.datasets[0].data = caffeineLevels;
    caffeineChart.update();
  }
  
  

// Form submission for adding a new drink
document.getElementById("caffeine-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const presetDrink = presetDropdown.options[presetDropdown.selectedIndex];
  const caffeine = presetDrink.value
    ? parseInt(presetDrink.value, 10) // Get the caffeine content of the preset drink
    : parseInt(document.getElementById("caffeine").value, 10); // Get the caffeine content from the custom input
  const drink = presetDrink.value
    ? presetDrink.text // Use preset name if available
    : document.getElementById("custom-drink").value; // Otherwise use custom drink name
  const time = new Date(document.getElementById("time").value); // Time the drink was consumed

  // Ensure both caffeine and time are provided
  if (!caffeine || !time) {
    alert("Please enter valid caffeine and time values.");
    return;
  }

  // Push the new drink data into the drinks array
  drinks.push({ drink, caffeine, time });

  // Save the updated drinks list to localStorage
  saveDrinksToLocalStorage();

  // Update the caffeine graph with the latest data
  updateGraph();
});

// Auto-refresh graph every minute (60,000 milliseconds)
setInterval(updateGraph, 60000);

// Load drinks from localStorage on page load
window.onload = loadDrinksFromLocalStorage;
