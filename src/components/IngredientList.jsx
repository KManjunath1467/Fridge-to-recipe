import React from 'react'

export default function IngredientList(props) {
    const ingList = props.ingredients.map((ing, index) => {
        return (
            <li key={index}>{ing}</li>
        )
    })
    return (
        <section>
            <h2>List of ingredients: </h2>
            <ul key = {props.id} className='ingredients-list'>{ingList}</ul>
            {props.ingredients.length > 3 && <div className='get-recipe-container'>
                <div ref={props.ref}>
                    <h3>Time to cook?</h3>
                    <p>Generate a recipe based on your list of ingredients</p>
                </div>
                <button onClick={props.getRecipe}>Get recipe</button>
            </div>}
        </section>
    )
}
