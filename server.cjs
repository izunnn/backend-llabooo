const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Parse JSON requests

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

mongoose.connect('mongodb+srv://faeznz:faeznz@data.h3xudui.mongodb.net/llabooo?retryWrites=true&w=majority')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Failed to connect to MongoDB:', error);
    });

// Define the item schema and model (assuming you have an Item model)
const itemSchema = new mongoose.Schema({
    tanggal: Date,
    nama: String,
    harga: Number
});

const Item = mongoose.model('Item', itemSchema);

// Endpoint for adding a new item
app.post('/item', async (req, res) => {
    try {
        const newItem = new Item(req.body);
        const savedItem = await newItem.save();
        res.json(savedItem);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add item' });
    }
});

app.get('/item', async (req, res) => {
    try {
        let query = {};

        // Check if month and year parameters are provided in the query string
        if (req.query.month && req.query.year) {
            const month = parseInt(req.query.month);
            const year = parseInt(req.query.year);

            // Construct a query to filter items based on the provided month and year
            query = {
                tanggal: {
                    $gte: new Date(year, month - 1, 1),
                    $lt: new Date(year, month, 1)
                }
            };
        }

        const items = await Item.find(query);

        // Format tanggal field in each item to DD-MM-YYYY
        const formattedItems = items.map(item => ({
            ...item._doc,
            tanggal: new Date(item.tanggal).toLocaleDateString('id-ID')
        }));

        res.json(formattedItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});


app.get('/', (req, res) => {
    res.send('API for llaboooApp');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
