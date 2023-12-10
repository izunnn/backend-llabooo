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

        // Format tanggal field in each item to DD (only the day)
        const formattedItems = items.map(item => ({
            ...item._doc,
            tanggal: new Date(item.tanggal).getDate() // Get only the day part
        }));

        res.json(formattedItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch items' });
    }
});

// Endpoint for deleting an item by ID
app.delete('/item/:id', async (req, res) => {
    try {
        const itemId = req.params.id;

        // Validate if the provided ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(itemId)) {
            return res.status(400).json({ error: 'Invalid item ID' });
        }

        // Attempt to find and remove the item
        const deletedItem = await Item.findByIdAndDelete(itemId);

        if (!deletedItem) {
            return res.status(404).json({ error: 'Item not found' });
        }

        res.json({ message: 'Item deleted successfully', deletedItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete item' });
    }
});

app.get('/weekly-expenses', async (req, res) => {
    try {
        const weeks = [[1, 7], [8, 14], [15, 21], [22, 28]];

        const weeklyExpenses = await Promise.all(weeks.map(async (week) => {
            const [startDay, endDay] = week;

            const startDate = new Date(req.query.startDate);
            const endDate = new Date(req.query.endDate);

            const query = {
                tanggal: {
                    $gte: startDate,
                    $lt: endDate
                }
            };

            const items = await Item.find(query);
            const totalExpense = items.reduce((sum, item) => sum + item.harga, 0);

            return { week, totalExpense };
        }));

        res.json(weeklyExpenses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch weekly expenses' });
    }
});

app.get('/', (req, res) => {
    res.send('API for llaboooApp');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
