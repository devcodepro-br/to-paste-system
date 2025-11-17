const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const getAnswer = require("./utils/openai.js");
const { randomUUID, randomInt } = require("crypto");

const app = express();
app.use(cors());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, "public")));

// garantir pasta uploads
const uploadPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

// configuração do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    console.log(randomUUID());
    const ext = `${randomUUID()}.${file.mimetype.split("/")[1]}`;
    cb(null, ext);
  },
});

const upload = multer({ storage });

// rota de upload
app.post("/upload", upload.single("file"), async (req, res) => {
  req.setTimeout(120000);
  if (!req.file) {
    return res.status(400).json({ error: "Nenhuma imagem enviada." });
  }

  if (!req.file.filename) {
    res.json({ message: "Imagem não enviada" });
    return;
  }

  // const image_link = `http://191.252.93.88/uploads/${req.file.filename}`;
  const image_link = `http://191.252.93.88/uploads/1763387781249.png`;

  if (!image_link) {
    console.log("Imagem não fornecida");
    return;
  }

  const response = await getAnswer(image_link);

  console.log(response);

  if (!response) {
    res.json({ message: "Erro ao buscar resposta" });
    return;
  }

  return res.json({
    question: response,
    message: "Upload concluído!",
    filename: req.file.filename,
    url: "/uploads/" + req.file.filename,
  });
});

// Rota para ver imagens que foram adicioandas
app.get("/see", (req, res) => {
  fs.readdir("./uploads", (err, files) => {
    if (err) {
      console.error("Erro ao ler a pasta");
      return;
    }

    const myImages = [];

    files.forEach((file) => {
      myImages.push({ img: file });
    });

    res.json(myImages);
  });
});

// Rota para deletar todas as imagens do servidor
app.delete("/delete-all-photos", async (req, res) => {
  try {
    fs.readdir("./uploads", (err, files) => {
      if (err) {
        res.json({ message: "Erro ao deletar imagens" });
        return;
      }

      if (files.length === 0) {
        res.json({ message: "Não há imagens no servidor" });
        return;
      }

      let pending = files.length;

      files.forEach((item) => {
        fs.unlink(`./uploads/${item}`, (err) => {
          if (err) {
            console.log(err);
            return;
          }

          pending--;

          if (pending === 0) {
            res.json({ message: "Images apagas com sucesso" });
            return;
          }
        });
      });
    });
  } catch (error) {
    console.log(error);
    return;
  }
});

// servir as imagens enviadas
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(80, () => {
  console.log("🔥 Servidor rodando na porta 80");
});
