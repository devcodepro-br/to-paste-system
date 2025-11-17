const fs = require("fs");
const { default: OpenAI } = require("openai");

if (!process.env.OPENAI_API_KEY) {
  console.log("API não fornecida");
  return;
}

const API_KEY = process.env.OPENAI_API_KEY;

async function getAnswer(image) {
  const client = new OpenAI({ apiKey: API_KEY });
  // const img_url = `http://191.252.93.88/uploads/1763387781249.png`;

  try {
    if (!image) {
      console.log("Imagem não enviada");
      return;
    }
    const responseImg = await client.responses.create({
      model: "gpt-5",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text", text: "Reescreva o conteúdo da imagem" },
            {
              type: "input_image",
              image_url: image,
            },
          ],
        },
      ],
    });

    if (!responseImg) {
      console.log("Erro ao finalizar a solicitação.");
      return;
    }

    const responseAnswer = await client.responses.create({
      model: "gpt-5",
      tools: [{ type: "web_search" }],
      input: `Procure a resposta e retorne a resposta correta da seguinte forma: A - [texto aqui], a questão é: ${responseImg.output_text}`,
    });

    return responseAnswer.output_text;
  } catch (err) {
    console.log(err);
    return;
  }
}

module.exports = getAnswer;
