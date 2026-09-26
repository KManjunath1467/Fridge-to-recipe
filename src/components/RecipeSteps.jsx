import { useState } from "react";

export default function RecipeSteps({
  steps
}) {
  const [completedSteps, setCompletedSteps] =
    useState({});

  function toggleStep(id) {
    setCompletedSteps((previous) => ({
      ...previous,
      [id]: !previous[id]
    }));
  }

  const completedCount =
    Object.values(completedSteps).filter(
      Boolean
    ).length;

  return (
    <section className="recipe-section">
      <div className="section-heading">
        <h3>Cooking Steps</h3>

        <span>
          {completedCount}/{steps.length} completed
        </span>
      </div>

      <ol className="recipe-steps">
        {steps.map((step) => {
          const completed =
            Boolean(completedSteps[step.id]);

          return (
            <li
              key={step.id}
              className={
                completed
                  ? "step completed"
                  : "step"
              }
            >
              <label>
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={() =>
                    toggleStep(step.id)
                  }
                />

                <span className="step-number">
                  {step.id}
                </span>

                <span className="step-text">
                  {step.instruction}
                </span>
              </label>
            </li>
          );
        })}
      </ol>
    </section>
  );
}