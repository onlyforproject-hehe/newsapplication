// Import required modules
const express = require('express');
const axios = require('axios');

// Initialize the Express app
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

// Define a route for the root URL
app.get('/', (req, res) => {
  res.send('Welcome to the News Application!');
});

// Define a route to fetch news from Bing News API and display it in a readable HTML format with images
app.get('/news', async (req, res) => {
  try {
    const response = await axios.get('https://api.bing.microsoft.com/v7.0/news', {
      headers: { 'Ocp-Apim-Subscription-Key': '4e2f93c89dd04baa8f88e02d2862d15c' } // Replace with your actual API key
    });

    // Get the news articles from the API response
    const articles = response.data.value;

    // Create a simple HTML response with basic styling
    let html = `
      <html>
      <head>
        <title>News Application</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          h1 {
            text-align: center;
            color: #333;
            margin-top: 20px;
          }
          .news-container {
            max-width: 900px;
            margin: 20px auto;
            background: #fff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .news-item {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #ddd;
          }
          .news-item h3 {
            margin: 0;
            font-size: 24px;
            color: #007bff;
          }
          .news-item p {
            margin: 5px 0;
            color: #555;
          }
          .news-item img {
            width: 100%;
            height: auto;
            max-width: 400px;
            margin: 10px 0;
            border-radius: 5px;
          }
          .news-source {
            font-style: italic;
            color: #888;
          }
          a {
            text-decoration: none;
            color: #007bff;
          }
          a:hover {
            text-decoration: underline;
          }
          /* Floating translation box styles */
          .translate-container {
            position: fixed;
            right: 20px;
            top: 100px;
            width: 250px;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            padding: 20px;
            z-index: 1000;
          }
          .translate-container h2 {
            margin-top: 0;
          }
        </style>
        <script>
          async function translateText() {
            const text = document.getElementById('textToTranslate').value;
            const targetLanguage = document.getElementById('languageSelect').value;
            const response = await fetch('/translate', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ text, targetLanguage })
            });
            const data = await response.json();
            document.getElementById('translatedText').innerText = data.translatedText;
          }
        </script>
      </head>
      <body>
        <h1>Top News Stories</h1>
        <div class="news-container">
    `;

    // Loop through the articles and append them to the HTML response
    articles.forEach(article => {
      html += `
        <div class="news-item">
          <h3><a href="${article.url}" target="_blank">${article.name}</a></h3>
          <p>${article.description || 'No description available'}</p>
          ${article.image ? `<img src="${article.image.thumbnail.contentUrl}" alt="${article.name}">` : ''}
          <p class="news-source"><strong>Source:</strong> ${article.provider[0]?.name || 'Unknown source'}</p>
        </div>
      `;
    });

    html += `
        </div>
        <div class="translate-container">
          <h2>Translate Text</h2>
          <textarea id="textToTranslate" rows="3" placeholder="Enter text to translate" style="width: 100%;"></textarea><br>
          <select id="languageSelect" style="width: 100%;">
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
          </select>
          <button onclick="translateText()" style="width: 100%; margin-top: 10px;">Translate</button>
          <p><strong>Translated Text:</strong></p>
          <p id="translatedText"></p>
        </div>
      </body>
      </html>
    `;

    // Send the HTML response
    res.send(html);

  } catch (error) {
    res.status(500).send('Error fetching news');
  }
});

// Define the translation route
app.post('/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;

  try {
    const response = await axios.post(
      'https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=' + targetLanguage,
      [{ text }],
      {
        headers: {
          'Ocp-Apim-Subscription-Key': '03a513548c89455f9c39c0bc022310fe', // Your translation API key
          'Ocp-Apim-Subscription-Region': 'centralindia', // Your region
          'Content-Type': 'application/json'
        }
      }
    );

    const translatedText = response.data[0].translations[0].text;
    res.json({ translatedText });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: 'Error translating text', details: error.message });
  }
});

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
