const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

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

app.get('/', (req, res) => {
   res.send('API for llaboooApp');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
