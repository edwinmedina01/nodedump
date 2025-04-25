const express = require('express');
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const cors = require('cors');


const app = express();
const port = process.env.PORT || 8080;
const upload = multer({ dest: "/tmp" });


let lastFilename = ""; // Para descarga o restore del último dump
app.use(cors({
  origin: ['http://localhost:3000', 'https://fundacion-intur.vercel.app']
}));

// 👉 Ruta: Generar backup .sql
app.get("/", async (req, res) => {
  const filename = `backup-${Date.now()}.sql`;
  const filepath = `/tmp/${filename}`;
  lastFilename = filename;

  const cmd = `mysqldump -h ${process.env.MYSQL_HOST} -P ${process.env.MYSQL_PORT} -u ${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} ${process.env.MYSQL_DATABASE} > ${filepath}`;

  exec(cmd, (error) => {
    if (error) {
      console.error("❌ Error al generar backup:", error);
      return res.status(500).send("❌ Error al generar backup");
    }

    res.status(200).json({
      message: "✅ Backup generado correctamente",
      file: filepath,
      download: "/download",
      restore: "/restore",
    });
  });
});

// 👉 Ruta: Descargar backup generado
app.get("/download", (req, res) => {
  if (!lastFilename) {
    return res.status(404).send("❌ No hay backup disponible para descargar.");
  }

  const filePath = path.join("/tmp", lastFilename);
  res.download(filePath, (err) => {
    if (err) {
      console.error("❌ Error al descargar el archivo:", err);
      res.status(500).send("❌ Error al descargar el backup.");
    }
  });
});

// 👉 Ruta: Restaurar último backup generado
app.post("/restore", (req, res) => {
  if (!lastFilename) {
    return res.status(404).send("❌ No hay backup para restaurar.");
  }

  const filePath = path.join("/tmp", lastFilename);
  const cmd = `mysql -h ${process.env.MYSQL_HOST} -P ${process.env.MYSQL_PORT} -u ${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} ${process.env.MYBBDDTEST} < ${filePath}`;

  exec(cmd, (error) => {
    if (error) {
      console.error("❌ Error al restaurar backup:", error);
      return res.status(500).send("❌ Error al restaurar la base.");
    }

    res.status(200).send("✅ Backup restaurado exitosamente.");
  });
});

// 👉 Ruta: Restaurar desde archivo subido manualmente a una DB específica
app.post("/restore-manual", upload.single("sqlfile"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("❌ No se subió ningún archivo.");
  }

  const dbName = req.query.db || process.env.MYBBDDTEST;
  const filePath = req.file.path;

  const cmd = `mysql -h ${process.env.MYSQL_HOST} -P ${process.env.MYSQL_PORT} -u ${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} ${dbName} < ${filePath}`;

  exec(cmd, (error) => {
    if (error) {
      console.error(`❌ Error al restaurar en ${dbName}:`, error);
      return res.status(500).send(`❌ Error al restaurar en la base ${dbName}`);
    }

    res.status(200).send(`✅ Base de datos ${dbName} restaurada con éxito desde archivo subido.`);
  });
});

app.listen(port, () => {
  console.log(`🚀 Servidor corriendo en puerto ${port}`);
});
