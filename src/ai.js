export async function getRecipeFromChefAI(ingredients, signal) {
  const response = await fetch("/api/recipe", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    signal,
    body: JSON.stringify({
      ingredients
    })
  });

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok) {
    throw new Error(
      data?.error || "Unable to generate the recipe."
    );
  }

  return data;
}