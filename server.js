const express = require('express');
const cors = require('cors');

const app = express();
const db = require('./src/config/db');
const admRoutes = require('./src/routes/Adm');
const studentsRoutes = require('./src/routes/Students');
const classRoutes = require('./src/routes/Class');

app.use(express.json());
app.use(cors());


app.use('/api/v1/adm', admRoutes);
app.use('/api/v1/alunos', studentsRoutes);
app.use('/api/v1/turmas', classRoutes);



app.listen(8180, ()=>{
    console.log('Server is running on port 8180');
})