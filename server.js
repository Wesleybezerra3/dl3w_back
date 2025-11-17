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

app.use(express.json());
app.use(
  cors({
    origin: "*", // TEMPORÁRIO
  })
);

app.use("/api/v1/adm", admRoutes);
app.use("/api/v1/alunos", studentsRoutes);
app.use("/api/v1/turmas", classRoutes);
app.use("/api/v1/cursos", courseRoutes);
app.use("/api/v1/professores", teacherRoutes);
app.use("/api/v1/salas", roomsRoutes);

if (process.env.NODE_ENV !== "production") {
  app.listen(8180, () => console.log("Rodando localmente"));
}
