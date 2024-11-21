// Fetch drinks from the server and update the UI and graph
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


function deleteDrink(drinkId) {
  fetch(`http://localhost:3000/api/drinks/${encodeURIComponent(drinkId)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`Error deleting drink: ${response.statusText}`);
    }
    return response.json(); // Expecting JSON response
  })
  .then(data => {
    console.log('Drink deleted:', data);
    
    // After deleting, load the latest drinks data
    loadDrinks();  // This will automatically update both the drinks list and the graph
  })
  .catch(error => {
    console.error('Error deleting drink:', error);
  });
}


// Function to fetch and update the list of drinks
function updateDrinksList() {
fetch("http://localhost:3000/api/drinks")
  .then((response) => response.json())
  .then((data) => {
    const drinksListContainer = document.getElementById("drinks-list-modal");
    drinksListContainer.innerHTML = ""; // Clear current list

    data.forEach((drink) => {
      const drinkElement = document.createElement("div");
      drinkElement.classList.add("drink-item");
      drinkElement.innerHTML = `
          <div class="drink-info">
            ${drink.drink} - ${drink.time}
          </div>
          <button class="delete-btn" data-time="${drink.time}">Delete</button>
        `;
      drinksListContainer.appendChild(drinkElement);
    });

    // Attach event listeners to the new delete buttons
    const deleteButtons = drinksListContainer.querySelectorAll(".delete-btn");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const timeToDelete = event.target.dataset.time;
        deleteDrink(timeToDelete);
      });
    });

    // After updating the list, update the graph
    updateGraph(); // Ensure the graph is updated with the latest data
  })
  .catch((error) => console.error("Error updating drinks list:", error));
}

// Function to display the list of drinks on the modal (drinks-list-modal)
function displayDrinks() {
const drinkListElement = document.getElementById("drinks-list-modal");
drinkListElement.innerHTML = ""; // Clear the existing list

drinks.forEach((drink) => {
  const drinkItem = document.createElement("div");
  drinkItem.classList.add("drink-item");

  // Display the drink information
  drinkItem.innerHTML = `
    <span>${drink.drink} - ${new Date(drink.time).toLocaleString()} - ${
    drink.caffeine
  }mg</span>
    <button class="delete-btn" data-time="${drink.time}">Delete</button>
  `;

  // Attach event listener to the delete button
  drinkItem.querySelector(".delete-btn").addEventListener("click", (e) => {
    const time = e.target.getAttribute("data-time");
    deleteDrink(time);
  });

  // Append the drink item to the modal list
  drinkListElement.appendChild(drinkItem);
});
}
