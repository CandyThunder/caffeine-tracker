const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse JSON request body
app.use(express.json());

// Helper functions to read and write to JSON file
const readDrinksFromFile = () => {
  const dataPath = path.join(__dirname, 'data', 'drinks.json');
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
};

const saveDrinksToFile = (drinks) => {
  const dataPath = path.join(__dirname, 'data', 'drinks.json');
  fs.writeFileSync(dataPath, JSON.stringify(drinks, null, 2));
};

// Endpoint to get all drinks data
app.get('/api/drinks', (req, res) => {
  try {
    const drinks = readDrinksFromFile();
    res.json(drinks);
  } catch (err) {
    res.status(500).json({ message: 'Error reading data' });
  }
});

// Endpoint to add a new drink
app.post('/api/drinks', (req, res) => {
  const newDrink = req.body;
  
  try {
    const drinks = readDrinksFromFile();
    drinks.push(newDrink);
    saveDrinksToFile(drinks);
    res.status(201).json(newDrink); // Return the added drink as response
  } catch (err) {
    res.status(500).json({ message: 'Error saving data' });
  }
});

// Route to reset (clear) the entire drinks file (DELETE request)
app.delete('/api/drinks', (req, res) => {
  try {
    saveDrinksToFile([]); // Clear the drinks data
    res.status(200).json({ message: 'All drinks cleared successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting data' });
  }
});

// Route to delete a specific drink by its time (DELETE request)
// Route to delete a specific drink by its time (DELETE request)
app.delete('/api/drinks/:time', (req, res) => {
    const { time } = req.params;
  
    console.log(`Deleting drink with time: ${time}`);  // Log incoming time value
  
    try {
      let drinks = readDrinksFromFile();
      const originalLength = drinks.length;
  
      // Filter out the deleted drink
      drinks = drinks.filter(drink => drink.time !== time);
  
      if (drinks.length === originalLength) {
        // If the drink wasn't found
        return res.status(404).json({ message: 'Drink not found' });
      }
  
      saveDrinksToFile(drinks);
      res.status(200).json({ message: 'Drink deleted successfully' });
    } catch (err) {
      console.error(err);  // Log any errors
      res.status(500).json({ message: 'Error deleting drink' });
    }
  });
  

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
