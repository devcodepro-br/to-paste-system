const area = document.getElementById("area");
const preview = document.getElementById("preview");
const status = document.getElementById("status");

area.addEventListener("paste", async (e) => {
  e.preventDefault();
  status.textContent = "";
  preview.innerHTML = "";

  const items = e.clipboardData.items;

  for (const item of items) {
    if (item.type.includes("image")) {
      const file = item.getAsFile();
      showPreview(file);
      await upload(file);
      return;
    }
  }

  status.textContent = "Nenhuma imagem encontrada no Ctrl + V.";
});

function showPreview(file) {
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  preview.appendChild(img);
}

async function upload(file) {
  const fd = new FormData();
  fd.append("file", file);

  status.textContent = "Buscando resposta (pode levar até 1 minuto)";

  try {
    const res = await fetch("/upload", {
      method: "POST",
      body: fd,
    });

    const data = await res.json();
    console.log(data);

    if (res.ok) {
      status.innerHTML = `
        <b>${data.question}</b><br>
      `;
    } else {
      status.textContent = "Erro no upload.";
    }
  } catch (err) {
    status.textContent = "Erro de rede ao enviar a imagem.";
  }
}

area.focus();
