const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
        const weeks = [[1, 8], [9, 16], [17, 24], [25, 32]];

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

const menuSchema = new mongoose.Schema({
    menu: String
});

const Menu = mongoose.model('Menu', menuSchema);

app.post('/menu', async (req, res) => {
    try {
        const newMenu = new Menu(req.body);
        const savedMenu = await newMenu.save();
        res.json(savedMenu);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add menu' });
    }
});

app.get('/menu', async (req, res) => {
    try {
        const menus = await Menu.find();
        res.json(menus);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve menus' });
    }
});

app.delete('/menu/:id', async (req, res) => {
    const menuId = req.params.id;
  
    try {
      await Menu.findByIdAndDelete(menuId);
      res.status(200).json({ message: 'Menu deleted successfully' });
    } catch (error) {
      console.error('Error deleting menu:', error);
      res.status(500).json({ error: 'Failed to delete menu' });
    }
  });

const tabunganSchema = new mongoose.Schema({
    sisaBudget: Number,
    month: Number,
    year: Number
});

const Tabungan = mongoose.model('Tabungan', tabunganSchema);

app.get('/tabungan', async (req, res) => {
    try {
        const tabunganData = await Tabungan.find();

        res.json(tabunganData);
    } catch (error) {
        console.error('Failed to fetch tabungan data', error);
        res.status(500).json({ error: 'Failed to fetch tabungan data' });
    }
});

app.post('/tabungan', async (req, res) => {
    try {
        const { sisaBudget, month, year } = req.body;

        if (sisaBudget !== 1200000) {
            const existingEntry = await Tabungan.findOne({ month, year });

            if (existingEntry) {
                existingEntry.sisaBudget = sisaBudget;
                await existingEntry.save();
            } else {
                const newEntry = new Tabungan({ sisaBudget, month, year });
                await newEntry.save();
            }
        }

        res.json({ message: 'Sisa budget berhasil disimpan' });
    } catch (error) {
        console.error('Gagal menyimpan sisa budget', error);
        res.status(500).json({ error: 'Failed to save sisa budget' });
    }
});

app.delete('/tabungan/:id', async (req, res) => {
    try {
        const tabunganId = req.params.id;
        await Tabungan.findByIdAndDelete(tabunganId);

        res.json({ message: 'Data tabungan berhasil dihapus' });
    } catch (error) {
        console.error('Gagal menghapus data tabungan', error);
        res.status(500).json({ error: 'Gagal menghapus data tabungan' });
    }
});

app.get('/', (req, res) => {
    res.send('API for llaboooApp');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
