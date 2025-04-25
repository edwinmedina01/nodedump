const express = require('express');
const { exec } = require("child_process");
const fs = require("fs");
const { google } = require("googleapis");

const app = express();
const port = process.env.PORT || 8080;

app.get("/", async (req, res) => {
  const filename = `backup-${Date.now()}.sql`;
  const filepath = `/tmp/${filename}`;

  const cmd = `mysqldump -h ${process.env.MYSQL_HOST} -P ${process.env.MYSQL_PORT} -u ${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} ${process.env.MYSQL_DATABASE} > ${filepath}`;

  exec(cmd, async (error) => {
    if (error) return res.status(500).send("❌ Error al generar backup");

 const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});


    const drive = google.drive({ version: "v3", auth: await auth.getClient() });

    const upload = await drive.files.create({
      requestBody: {
        name: filename,
        parents: [process.env.DRIVE_FOLDER_ID],
      },
      media: {
        mimeType: "application/sql",
        body: fs.createReadStream(filepath),
      },
      fields: "id, webViewLink",
    });
    

    res.status(200).json({
      message: "✅ Backup subido",
       // file: filepath,
        link: upload.data.webViewLink,
    });
  });
});

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
