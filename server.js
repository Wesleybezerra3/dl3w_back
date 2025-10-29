const express = require('express');
const cors = require('cors');

const app = express();
const db = require('./src/config/db');
const admRoutes = require('./src/routes/Adm');

app.use(express.json());
app.use(cors());


app.use('/adm', admRoutes);



app.listen(8180, ()=>{
    console.log('Server is running on port 8180');
})