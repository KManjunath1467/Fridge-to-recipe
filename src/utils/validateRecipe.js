export function validateRecipe(recipe) {
  if (!recipe || typeof recipe !== "object") {
    return false;
  }

  if (
    typeof recipe.title !== "string" ||
    recipe.title.trim() === ""
  ) {
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

  if (
    !Array.isArray(recipe.ingredients) ||
    recipe.ingredients.length === 0
  ) {
    return false;
  }

  if (
    !Array.isArray(recipe.steps) ||
    recipe.steps.length === 0
  ) {
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
      typeof ingredient.unit !== "string" ||
      typeof ingredient.optional !== "boolean"
    ) {
      return false;
    }

    if (
      ingredient.amount !== null &&
      (
        typeof ingredient.amount !== "number" ||
        !Number.isFinite(ingredient.amount)
      )
    ) {
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