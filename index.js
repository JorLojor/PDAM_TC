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

const jadwalRoutes = require('./routers/jadwal')
const kelasRoutes = require('./routers/kelas')
const materiRoutes = require('./routers/materi')
const pesertaRoutes = require('./routers/peserta')
const userRoutes = require('./routers/user')
// routes



app.use('/jadwal/',jadwalRoutes)
app.use('/kelas/',kelasRoutes)
app.use('/materi/',materiRoutes)
app.use('/peserta/',pesertaRoutes)
app.use('/user/',userRoutes)



app.get('/', (req, res) => {
    res.send('bismillah hirrohman nirrohim');
});

app.listen(process.env.local_port, () => {
    console.log(`Server dimulai pada server ${process.env.local_port}`);
});
  