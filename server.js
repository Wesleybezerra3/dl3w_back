const express = require("express");
const cors = require("cors");

const app = express();
const db = require("./src/config/db");
const admRoutes = require("./src/routes/Adm");
const studentsRoutes = require("./src/routes/Students");
const classRoutes = require("./src/routes/Class");
const courseRoutes = require("./src/routes/Course");
const teacherRoutes = require("./src/routes/Tearcher");
const roomsRoutes = require("./src/routes/Rooms");
const reportsRoutes = require("./src/routes/Reports");
const disciplinesRoutes = require("./src/routes/Discipline");

app.use(express.json());
app.use(
    cors({
        origin: "*", // TEMPORÁRIO
    })
);

app.use("/api/v1/adm", admRoutes);
app.use("/api/v1/alunos", studentsRoutes);
app.use("/api/v1/alunos", reportsRoutes);
app.use("/api/v1/turmas", classRoutes);
app.use("/api/v1/cursos", courseRoutes);
app.use("/api/v1/professores", teacherRoutes);
app.use("/api/v1/salas", roomsRoutes);
app.use("/api/v1/disciplinas", disciplinesRoutes);

app.listen(8180, () => {
    console.log("Server is running on port 8180");
});