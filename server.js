// server.js
const express = require('express');
const bodyParser = require('body-parser'); // For parsing JSON and URL-encoded bodies
const fs = require('fs'); // For file system operations (saving data to JSON files)
const path = require('path'); // For working with file paths

const app = express();
const PORT = process.env.PORT || 3000; // Use port 3000 by default, or Replit's assigned port

// --- Middleware ---
// Parse incoming JSON requests (e.g., from fetch API with Content-Type: application/json)
app.use(bodyParser.json());

// Parse incoming URL-encoded requests (e.g., from traditional HTML forms, though we're using JSON for forms here)
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the current directory (where server.js resides).
// This is crucial for serving index.html, CSS, JavaScript, and all your images.
// If your static files (like index.html, images, etc.) were inside a folder named 'public',
// you would use: app.use(express.static('public'));
app.use(express.static(__dirname));

// Define a route for the root URL ('/') to explicitly send your index.html file.
// This is redundant if index.html is in a folder served by express.static,
// but it ensures index.html is served correctly when directly in the root.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Contact Form Endpoint ---
// Handles POST requests to /submit-contact
app.post('/submit-contact', (req, res) => {
    const contactData = req.body; // The data sent from your contact form
    console.log('Received contact message:', contactData); // Log to Replit console

    const filePath = path.join(__dirname, 'contact_messages.json'); // Path to your data file

    // Read existing messages, append new one, and write back
    fs.readFile(filePath, (err, data) => {
        let messages = [];
        if (!err && data.length > 0) {
            try {
                // Try to parse existing data, handle potential parsing errors
                messages = JSON.parse(data);
            } catch (parseErr) {
                console.error("Error parsing contact messages file:", parseErr);
                // If file is corrupted, initialize with an empty array
                messages = [];
            }
        }

        // Add a timestamp to the message
        messages.push({ ...contactData, timestamp: new Date().toISOString() });

        // Write the updated messages array back to the file
        fs.writeFile(filePath, JSON.stringify(messages, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error saving contact message:', writeErr);
                // Send a 500 status code for server error
                return res.status(500).json({ message: 'Failed to save message. Please try again.' });
            }
            // Send a success response
            res.status(200).json({ message: 'Message sent successfully!' });
        });
    });
});

// --- Order Placement Endpoint ---
// Handles POST requests to /place-order
app.post('/place-order', (req, res) => {
    const orderDetails = req.body; // The complete order details from the frontend
    console.log('Received order:', orderDetails); // Log to Replit console

    // Generate a simple, unique order ID (for demonstration purposes)
    const orderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const filePath = path.join(__dirname, 'orders.json'); // Path to your orders data file

    // Read existing orders, append new one, and write back
    fs.readFile(filePath, (err, data) => {
        let orders = [];
        if (!err && data.length > 0) {
            try {
                // Try to parse existing data, handle potential parsing errors
                orders = JSON.parse(data);
            } catch (parseErr) {
                console.error("Error parsing orders file:", parseErr);
                orders = [];
            }
        }

        // Add the generated order ID and a timestamp to the order details
        orders.push({ ...orderDetails, orderId: orderId, timestamp: new Date().toISOString() });

        // Write the updated orders array back to the file
        fs.writeFile(filePath, JSON.stringify(orders, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error saving order:', writeErr);
                // Send a 500 status code for server error
                return res.status(500).json({ message: 'Failed to place order. Please try again.' });
            }
            // Send a success response with the generated order ID
            res.status(200).json({ message: 'Order placed successfully!', orderId: orderId });
        });
    });
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access your website at: http://localhost:${PORT} (or Replit's public URL)`);
});