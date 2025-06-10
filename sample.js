import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import * as fs from "fs";
import path from "path";

import dotenv from 'dotenv';
dotenv.config();


const token = process.env["GITHUB_TOKEN"];
if (!token) {
  throw new Error("GITHUB_TOKEN environment variable is not set or is empty.");
}
const endpoint = "https://models.github.ai/inference";
const model = "meta/Llama-4-Maverick-17B-128E-Instruct-FP8";

export async function main() {

   const imagePath = path.join(process.cwd(),("contoso_layout_sketch.jpg"));
   const imageBuffer = fs.readFileSync(imagePath);
   const base64Image = imageBuffer.toString("base64");

  const client = ModelClient(
    endpoint,
    new AzureKeyCredential(token),
  );

  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role:"system", content: "You are a helpful assistant." },
        { role:"user", content: "What is the capital of France?" },
        { role: "user", content: [
            {
            type: "text",
            text: "Write html and css code for a webpage based on the following sketch.",
            },
            {
            type: "image_url",
            image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
            }
            }
        ]}
      ],
      temperature: 1.0,
      top_p: 1.0,
      max_tokens: 1000,
      model: model
    }
  });

  if (isUnexpected(response)) {
    throw response.body.error;
  }

  console.log(response.body.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});

