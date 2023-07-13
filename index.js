const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

require('dotenv').config();

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({extended:true}))

// database connection
mongoose.connect('mongodb+srv://reacteev:teamPDAMproject@pdamtc.rr8ai5j.mongodb.net/')
// database connection

// routes
const userRoutes = require('./routers/user')
// routes
app.use(userRoutes)



app.get('/', (req, res) => {
    res.send('bismillah hirrohman nirrohim');
});

app.listen(process.env.local_port, () => {
    console.log(`Server dimulai pada server ${process.env.local_port}`);
});
  