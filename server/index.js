import express from "express";

const app = express();
const PORT = 3001;

app.use(express.json({ limit: "20kb" }));

const SYSTEM_PROMPT = `
You are AI Chef, an assistant that creates practical recipes from ingredients provided by a user.

The user will provide ingredients in free-form text.

Return ONLY valid JSON.
Do not use Markdown.
Do not wrap the JSON in code fences.
Do not add explanations before or after the JSON.

The JSON must have exactly this general structure:

{
  "title": "Recipe title",
  "description": "Short description",
  "servings": 2,
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": 200,
      "unit": "g",
      "optional": false
    }
  ],
  "steps": [
    {
      "id": 1,
      "instruction": "Step description"
    }
  ],
  "swaps": [
    {
      "ingredient": "ingredient name",
      "swap": "possible replacement",
      "note": "short explanation"
    }
  ]
}

Rules:

1. Use ingredients supplied by the user whenever practical.
2. Additional ingredients are allowed, but keep them reasonable.
3. Amount must be a number when measurable.
4. If an ingredient is naturally "to taste", amount may be null and unit can be "to taste".
5. servings must be a positive integer.
6. Include clear numbered cooking steps.
7. Include useful ingredient substitutions when possible.
8. Do not return conversational text.
9. Return valid JSON only.
`;

function cleanJsonResponse(content) {
  let cleaned = content.trim();

  // Remove Markdown code fences if the model accidentally adds them.
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");

  // If the model added text around the JSON, try to isolate the object.
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  return cleaned;
}

function isValidRecipe(recipe) {
  if (!recipe || typeof recipe !== "object") {
    return false;
  }

  if (typeof recipe.title !== "string" || recipe.title.trim() === "") {
    return false;
  }

  if (
    typeof recipe.description !== "string" ||
    recipe.description.trim() === ""
  ) {
    return false;
  }

  if (
    !Number.isInteger(recipe.servings) ||
    recipe.servings <= 0
  ) {
    return false;
  }

  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    return false;
  }

  if (!Array.isArray(recipe.steps) || recipe.steps.length === 0) {
    return false;
  }

  if (!Array.isArray(recipe.swaps)) {
    return false;
  }

  for (const ingredient of recipe.ingredients) {
    if (
      !ingredient ||
      typeof ingredient.name !== "string" ||
      ingredient.name.trim() === "" ||
      typeof ingredient.unit !== "string"
    ) {
      return false;
    }

    if (
      ingredient.amount !== null &&
      (typeof ingredient.amount !== "number" ||
        !Number.isFinite(ingredient.amount))
    ) {
      return false;
    }

    if (typeof ingredient.optional !== "boolean") {
      return false;
    }
  }

  for (const step of recipe.steps) {
    if (
      !step ||
      !Number.isInteger(step.id) ||
      typeof step.instruction !== "string" ||
      step.instruction.trim() === ""
    ) {
      return false;
    }
  }

  for (const swap of recipe.swaps) {
    if (
      !swap ||
      typeof swap.ingredient !== "string" ||
      typeof swap.swap !== "string" ||
      typeof swap.note !== "string"
    ) {
      return false;
    }
  }

  return true;
}

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "AI Chef backend"
  });
});

app.post("/api/recipe", async (req, res) => {
  const { ingredients } = req.body;

  if (
    typeof ingredients !== "string" ||
    ingredients.trim().length === 0
  ) {
    return res.status(400).json({
      error: "Please provide at least one ingredient.",
      code: "EMPTY_INPUT"
    });
  }

  if (ingredients.trim().length > 2000) {
    return res.status(400).json({
      error: "Please keep the ingredient list under 2000 characters.",
      code: "INPUT_TOO_LONG"
    });
  }

  const controller = new AbortController();

  // Protect the server from an Ollama request that takes too long.
  const timeout = setTimeout(() => {
    controller.abort();
  }, 120000);

  try {
    const ollamaResponse = await fetch(
      "http://127.0.0.1:11434/api/chat",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "llama3.2:3b",
          stream: false,
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPT
            },
            {
              role: "user",
              content: `Create a recipe using these ingredients:

${ingredients}`
            }
          ],
          options: {
            temperature: 0.2
          }
        })
      }
    );

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();

      console.error("Ollama error:", errorText);

      return res.status(502).json({
        error:
          "The local AI service could not generate a recipe. Make sure Ollama is running and the llama3.2:3b model is available.",
        code: "OLLAMA_ERROR"
      });
    }

    const data = await ollamaResponse.json();

    const content = data?.message?.content;

    if (
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      return res.status(502).json({
        error: "The AI returned an empty response. Please try again.",
        code: "EMPTY_AI_RESPONSE"
      });
    }

    const cleanedJson = cleanJsonResponse(content);

    let recipe;

    try {
      recipe = JSON.parse(cleanedJson);
    } catch (parseError) {
      console.error("Invalid AI JSON:", content);

      return res.status(502).json({
        error:
          "The AI returned an invalid recipe format. Please try again.",
        code: "INVALID_AI_JSON"
      });
    }

    if (!isValidRecipe(recipe)) {
      console.error("Wrong recipe shape:", recipe);

      return res.status(502).json({
        error:
          "The AI returned an unexpected recipe structure. Please try again.",
        code: "INVALID_RECIPE_SHAPE"
      });
    }

    return res.json(recipe);
  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(504).json({
        error:
          "The AI took too long to respond. Please try again.",
        code: "AI_TIMEOUT"
      });
    }

    console.error("Server error:", error);

    return res.status(500).json({
      error:
        "Something went wrong while generating the recipe.",
      code: "SERVER_ERROR"
    });
  } finally {
    clearTimeout(timeout);
  }
});

app.listen(PORT, () => {
  console.log(`AI Chef backend running at http://localhost:${PORT}`);
});