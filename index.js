const express = require('express');
const mongoose = require('mongoose');
const app = express();
const cors = require('cors');

require('dotenv').config();

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({extended:true}))

// database connection
mongoose.connect(process.env.mongodb)
// database connection

// routes


const kelasRoutes = require('./routers/kelas')
const materiRoutes = require('./routers/materi')
const userRoutes = require('./routers/user')
const tugasRoutes = require('./routers/tugas')
const sertifikatRoutes = require('./routers/sertifikat')
const kategoriRoutes = require('./routers/kategori')
// routes



app.use('/kelas/',kelasRoutes)
app.use('/materi/',materiRoutes)
app.use('/user/',userRoutes)
app.use('/tugas/',tugasRoutes)
app.use('/sertifikat/',sertifikatRoutes)
app.use('/kategori/',kategoriRoutes)

app.get('/', (req, res) => {
    res.send('bismillah hirrohman nirrohim');
});

app.listen(process.env.local_port, () => {
    console.log(`Server dimulai pada server ${process.env.local_port}`);
});
  