import {
  useEffect,
  useRef,
  useState
} from "react";

import { getRecipeFromChefAI } from "../ai";
import { validateRecipe } from "../utils/validateRecipe";
import RecipeView from "./RecipeView";

export default function Main() {
  const [ingredients, setIngredients] = useState("");
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);
  const abortControllerRef = useRef(null);
  const recipeSectionRef = useRef(null);

  useEffect(() => {
    if (recipe && recipeSectionRef.current) {
      recipeSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }, [recipe]);

  async function generateRecipe() {
    const trimmedIngredients = ingredients.trim();

    if (!trimmedIngredients) {
      setError(
        "Please enter at least one ingredient."
      );
      return;
    }

    // Cancel any previous request.
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();

    abortControllerRef.current = controller;

    // Each request gets a unique ID.
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError("");
    setRecipe(null);

    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 120000);

    try {
      const generatedRecipe =
        await getRecipeFromChefAI(
          trimmedIngredients,
          controller.signal
        );

      // Ignore an older request if a newer one has started.
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!validateRecipe(generatedRecipe)) {
        throw new Error(
          "The AI returned an unexpected recipe format."
        );
      }

      setRecipe(generatedRecipe);
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      if (err.name === "AbortError") {
        setError(
          "The request took too long. Make sure Ollama is running and try again."
        );
      } else {
        setError(
          err.message ||
            "Unable to generate the recipe. Please try again."
        );
      }
    } finally {
      clearTimeout(timeoutId);

      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    generateRecipe();
  }

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      (event.ctrlKey || event.metaKey)
    ) {
      generateRecipe();
    }
  }

  return (
    <main>
      <section className="hero-section">
        <h2>
          Turn your ingredients into a recipe
        </h2>

        <p>
          Tell AI Chef what you have in your fridge,
          and get an interactive recipe you can actually
          cook.
        </p>

        <form
          className="ingredient-form"
          onSubmit={handleSubmit}
        >
          <label htmlFor="ingredients">
            What ingredients do you have?
          </label>

          <textarea
            id="ingredients"
            value={ingredients}
            onChange={(event) =>
              setIngredients(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder="Example: chicken, rice, onions, tomatoes, garlic and some spinach"
            rows={5}
            disabled={loading}
          />

          <div className="form-footer">
            <span>
              {ingredients.length}/2000 characters
            </span>

            <button
              type="submit"
              disabled={
                loading ||
                ingredients.trim().length === 0
              }
            >
              {loading
                ? "Cooking..."
                : "Generate Recipe"}
            </button>
          </div>
        </form>
      </section>

      {loading && (
        <section className="state-card loading-card">
          <div className="spinner"></div>

          <h3>Chef is thinking...</h3>

          <p>
            Creating your recipe with Ollama.
          </p>
        </section>
      )}

      {error && !loading && (
        <section className="state-card error-card">
          <h3>Something went wrong</h3>

          <p>{error}</p>

          <button
            type="button"
            onClick={generateRecipe}
            disabled={
              ingredients.trim().length === 0
            }
          >
            Try Again
          </button>
        </section>
      )}

      {!loading &&
        !error &&
        !recipe && (
          <section className="state-card empty-card">
            <div className="empty-icon">🍳</div>

            <h3>Ready when you are</h3>

            <p>
              Enter the ingredients you have and
              AI Chef will build a recipe for you.
            </p>
          </section>
        )}

      {recipe && !loading && (
        <div ref={recipeSectionRef}>
          <RecipeView recipe={recipe} />
        </div>
      )}
    </main>
  );
}