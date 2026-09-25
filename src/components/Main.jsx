import { useEffect, useRef, useState } from "react";
import ClaudeRecipe from "./ClaudeRecipe";
import IngredientList from "./IngredientList";
import { getRecipeFromChefClaude } from "../ai";

export default function Main() {
  // states for ingredients and recipe
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState("");
  // reference to getRecipe button section
  const recipeSection = useRef(null);

  // side effect for auto-scrolling
  useEffect(() => {
    if (recipe !== "" && recipeSection !== null) {
      recipeSection.current.scrollIntoView({ behavior: "smooth" }); // auto-scroll
    }
  }, [recipe]);

  // take ingredients from user and add it to array
  function addIngredient(formData) {
    const newIngredient = formData.get("ingredient");
    setIngredients((prevIngredients) => [...prevIngredients, newIngredient]);
  }

  // send recipe to claude and store recipe in recipeMarkdown
  async function getRecipe() {
    const recipeMarkdown = await getRecipeFromChefClaude(ingredients);
    setRecipe(recipeMarkdown);
  }

  return (
    <main>
      <h1>Add your ingredients below and let's get cooking!</h1>
      {/* form to take ingredients from the user */}
      <form action={addIngredient} className="add-ingredient-form">
        <input
          type="text"
          placeholder="e.g. oregano"
          aria-label="Add ingredient"
          name="ingredient"
        />
        <button>Add ingredient</button>
      </form>
      <div className="centered-content-container">
        {/* list of user's ingredients */}
        {ingredients.length > 0 && (
          <IngredientList
            ref={recipeSection}
            ingredients={ingredients}
            getRecipe={getRecipe}
          />
        )}
        {/* generated recipe from claude */}
        {recipe && <ClaudeRecipe recipe={recipe} />}
      </div>
    </main>
  );
}
