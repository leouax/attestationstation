const urlMetadata = require('url-metadata');
const cors = require('cors'); // Import the cors package
const express = require('express');
const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:3000', // Allow only your frontend URL
  methods: 'GET,POST,PUT,DELETE,OPTIONS', // Allow specific HTTP methods
  allowedHeaders: 'Content-Type,Authorization' // Allow specific headers
}));

// Middleware
app.use(express.json());

// Route handling string input via query parameter
app.get('/api/fetch', async (req, res) => {
    console.log("received a request!")
    const url = req.query.url; // Access query parameter 'name'
    try {
        if (typeof url === 'string') {
            const data = await urlMetadata(url)
            console.log(data)
            res.json(data);
        } else {
            res.status(400).json({ error: 'url query parameter is required and must be a string.' });
        }
    } catch  {
         res.status(400).json({ error: 'something went wrong' });
    }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});