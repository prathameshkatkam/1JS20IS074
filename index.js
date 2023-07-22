const express = require('express');
const axios = require('axios');

const app = express();
const port = 8008;
const TIMEOUT_MS = 500; // Timeout in milliseconds

// Endpoint for managing numbers from URLs
app.get('/numbers', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter (url) is required.' });
  }

  try {
    // Handle cases where a single URL or multiple URLs are passed
    const urls = Array.isArray(url) ? url : [url];
    const uniqueNumbersSet = new Set();

    // Create an array of promises to fetch data from each URL
    const fetchPromises = urls.map((url) => fetchDataFromURL(url));

    // Wait for all promises to resolve or timeout
    const results = await Promise.all(
      fetchPromises.map((promise) => Promise.race([promise, timeoutPromise(TIMEOUT_MS)]))
    );

    // Merge the unique numbers from all the URLs
    results.forEach((data) => {
      if (data && data.numbers && Array.isArray(data.numbers)) {
        data.numbers.forEach((number) => uniqueNumbersSet.add(number));
      }
    });

    const mergedNumbers = Array.from(uniqueNumbersSet).sort((a, b) => a - b);
    res.json({ numbers: mergedNumbers });
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while processing the request.' });
  }
});

// Helper function to fetch data from URL
async function fetchDataFromURL(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from URL: ${url}`, error.message);
    return null;
  }
}

// Helper function to create a timeout promise
function timeoutPromise(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});