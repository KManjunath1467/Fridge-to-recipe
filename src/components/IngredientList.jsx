function formatAmount(amount) {
  if (amount === null) {
    return "";
  }

  if (Number.isInteger(amount)) {
    return amount;
  }

  return Number(
    amount.toFixed(2)
  );
}

export default function IngredientList({
  ingredients,
  baseServings,
  currentServings
}) {
  const multiplier =
    currentServings / baseServings;

  return (
    <section className="recipe-section">
      <div className="section-heading">
        <h3>Ingredients</h3>

        <span>
          {currentServings} serving
          {currentServings !== 1 ? "s" : ""}
        </span>
      </div>

      <ul className="recipe-ingredients">
        {ingredients.map(
          (ingredient, index) => {
            const scaledAmount =
              ingredient.amount === null
                ? null
                : ingredient.amount * multiplier;

            return (
              <li key={`${ingredient.name}-${index}`}>
                <div>
                  <strong>
                    {ingredient.name}
                  </strong>

                  {ingredient.optional && (
                    <span className="optional-tag">
                      optional
                    </span>
                  )}
                </div>

                <span className="ingredient-amount">
                  {scaledAmount === null
                    ? ingredient.unit
                    : `${formatAmount(
                        scaledAmount
                      )} ${ingredient.unit}`}
                </span>
              </li>
            );
          }
        )}
      </ul>
    </section>
  );
}