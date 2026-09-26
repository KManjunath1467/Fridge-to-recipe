export default function IngredientSwaps({
  swaps
}) {
  return (
    <section className="recipe-section">
      <div className="section-heading">
        <h3>Ingredient Swaps</h3>
      </div>

      {swaps.length === 0 ? (
        <p className="muted-text">
          No substitutions were suggested for
          this recipe.
        </p>
      ) : (
        <div className="swap-list">
          {swaps.map(
            (swap, index) => (
              <article
                className="swap-card"
                key={`${swap.ingredient}-${index}`}
              >
                <div className="swap-main">
                  <strong>
                    {swap.ingredient}
                  </strong>

                  <span>→</span>

                  <strong>
                    {swap.swap}
                  </strong>
                </div>

                <p>{swap.note}</p>
              </article>
            )
          )}
        </div>
      )}
    </section>
  );
}