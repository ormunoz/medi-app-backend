// Load environment variables from a .env file for configuration
require('dotenv').config();

// Import required libraries and modules
const express = require('express');  // Use the Express.js framework
const path = require('path');        // Path manipulation for serving static files
const cors = require('cors');        // Enable Cross-Origin Resource Sharing
const userRoutes = require('./router/users.routes');  // Import user routes
const questionRoutes = require('./router/questionsOptions.routes'); // Import question routes
const bodyParser = require('body-parser');  // Parse HTTP request body
const app = express();  // Create an Express application
const PORT = process.env.PORT || 5000;  // Define the port to listen on (default to 5000)

// Enable Cross-Origin Resource Sharing for handling requests from different domains
app.use(cors());

// Serve static files from a specified directory (likely for your frontend)
app.use(express.static(path.join(__dirname, './public')));

// Parse incoming JSON data with a size limit of 50MB
app.use(express.json({ limit: '50mb' }));

// Parse incoming data with a size limit of 50MB (for extended form data)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
    limit: '50mb'
}));

app.get("/", (req, res) => {
    res.send({ msg: "hola mundo" });
});
// Define a default URL prefix for routes
const url_default = '/api/v1/';

// Attach user-related routes to the application under the 'auth' URL prefix
app.use(url_default + 'auth/', userRoutes);

// Attach question-related routes to the application under the 'question' URL prefix
app.use(url_default + 'question/', questionRoutes);

// Start the server and listen for incoming connections on the specified port
app.listen(PORT, err => {
    if (err) {
        console.error("Error listening: ", err);
        return;
    }
    console.log(`Listening on port ${PORT}`);
});
