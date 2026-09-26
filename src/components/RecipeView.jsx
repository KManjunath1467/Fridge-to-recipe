import { useState } from "react";
import IngredientList from "./IngredientList";
import RecipeSteps from "./RecipeSteps";
import IngredientSwaps from "./IngredientSwaps";

export default function RecipeView({
  recipe
}) {
  const [servings, setServings] =
    useState(recipe.servings);

  function decreaseServings() {
    setServings((current) =>
      Math.max(1, current - 1)
    );
  }

  function increaseServings() {
    setServings((current) =>
      current + 1
    );
  }

  return (
    <section className="recipe-container">
      <div className="recipe-header">
        <span className="recipe-label">
          AI CHEF RECOMMENDS
        </span>

        <h2>{recipe.title}</h2>

        <p>{recipe.description}</p>
      </div>

      <div className="serving-control">
        <span>Servings</span>

        <button
          type="button"
          onClick={decreaseServings}
          disabled={servings <= 1}
          aria-label="Decrease servings"
        >
          −
        </button>

        <strong>{servings}</strong>

        <button
          type="button"
          onClick={increaseServings}
          aria-label="Increase servings"
        >
          +
        </button>
      </div>

      <IngredientList
        ingredients={recipe.ingredients}
        baseServings={recipe.servings}
        currentServings={servings}
      />

      <RecipeSteps
        steps={recipe.steps}
      />

      <IngredientSwaps
        swaps={recipe.swaps}
      />
    </section>
  );
}