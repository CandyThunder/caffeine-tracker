// Fetch drinks from the server
function loadDrinks() {
    fetch('/api/drinks')
      .then(response => response.json())
      .then(data => {
        drinks.length = 0;  // Clear existing drinks in memory
        drinks.push(...data);  // Add the loaded data to the drinks array
        updateGraph();  // Update the graph with the loaded data
        displayDrinks();  // Update the drink list on the UI
      })
      .catch((error) => {
        console.error('Error loading drinks:', error);
      });
  }
  
  document.getElementById('caffeine-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const presetDrink = document.getElementById("preset-drink");
    const caffeine = presetDrink.options[presetDrink.selectedIndex].value;
    const drink = presetDrink.options[presetDrink.selectedIndex].text;
    const time = new Date(document.getElementById("time").value).toISOString(); 
  
    // Add the drink to the backend
    fetch('/api/drinks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drink, caffeine, time }),
    })
      .then(response => response.json())
      .then(data => {
        drinks.push(data);  // Add the new drink to the local drinks array
        updateGraph();  // Update the graph
        displayDrinks();  // Update the list of drinks on the UI
      })
      .catch((error) => {
        console.error('Error saving drink:', error);
      });
  });
  
  // Ensure the modal opens when the "Manage Drinks" button is clicked
  document.getElementById('manage-btn').addEventListener('click', () => {
      document.getElementById('popup-modal').style.display = 'flex';  // Show modal
  });
  
  // Ensure the modal closes when the "Close" button inside the modal is clicked
  document.getElementById('close-modal').addEventListener('click', () => {
      document.getElementById('popup-modal').style.display = 'none';  // Hide modal
  });
  
  // Load drinks when the page loads
  window.onload = () => {
    loadDrinks();  // Load drinks from the server
    updateGraph();  // Update the graph with the loaded data
  };
  