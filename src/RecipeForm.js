// frontend/src/RecipeForm.js
import React, { useState, useEffect } from 'react';
import './RecipeForm.css';

function RecipeForm({ onSave, onClose, initialRecipe }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [image, setImage] = useState(null);
  const [stepImages, setStepImages] = useState(Array(10).fill(null));
  const [instructions, setInstructions] = useState('');
  const [attributes, setAttributes] = useState([{ name: 'calories', value: '415 kcal' }, { name: 'cooking time', value: '25 mins' }]);

  useEffect(() => {
    if (initialRecipe) {
      setName(initialRecipe.name || '');
      setDescription(initialRecipe.description || '');
      setIngredients(initialRecipe.ingredients_list.length > 0 ? initialRecipe.ingredients_list : ['']);
      setInstructions(initialRecipe.instructions || '');
      setAttributes(initialRecipe.attributes.length > 0 ? initialRecipe.attributes : [{ name: 'calories', value: '415 kcal' }, { name: 'cooking time', value: '25 mins' }]);
    }
  }, [initialRecipe]);

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, '']);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleStepImageChange = (index, file) => {
    const newStepImages = [...stepImages];
    newStepImages[index] = file;
    setStepImages(newStepImages);
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttributes = [...attributes];
    newAttributes[index][field] = value;
    setAttributes(newAttributes);
  };

  const addAttribute = () => {
    setAttributes([...attributes, { name: '', value: '' }]);
  };

  const removeAttribute = (index) => {
    if (attributes.length > 1) {
      setAttributes(attributes.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('instructions', instructions);
    if (image) {
      formData.append('image', image);
    }

    ingredients.forEach((ingredient, index) => {
      if (ingredient.trim()) {
        formData.append(`ingredient_${index}`, ingredient);
      }
    });

    stepImages.forEach((stepImage, index) => {
      if (stepImage) {
        formData.append(`step_image_${index}`, stepImage);
      }
    });

    attributes.forEach((attr, index) => {
      if (attr.name && attr.value) {
        formData.append(`attribute_name_${index}`, attr.name);
        formData.append(`attribute_value_${index}`, attr.value);
      }
    });

    onSave(formData);
    onClose();
  };

  return (
    <div className="recipe-form-overlay">
      <form className="recipe-form" onSubmit={handleSubmit}>
        <h2>{initialRecipe ? 'Edit Recipe' : 'Create New Recipe'}</h2>

        <div className="form-group">
          <label htmlFor="name">Recipe Name</label>
          <input
            id="name"
            type="text"
            placeholder="Enter recipe name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Ingredients</label>
          {ingredients.map((ingredient, index) => (
            <div key={index} className="ingredient-input">
              <input
                type="text"
                placeholder={`Ingredient ${index + 1}`}
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                required
              />
              <button type="button" onClick={() => removeIngredient(index)} disabled={ingredients.length === 1}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addIngredient}>Add Ingredient</button>
        </div>

        <div className="form-group">
          <label>Main Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />
          {image && <p>Selected: {image.name}</p>}
        </div>

        <div className="form-group">
          <label>Step Images (up to 10)</label>
          <div className="step-images-grid">
            {stepImages.map((stepImage, index) => (
              <div key={index} className="step-image-input">
                <span>{index + 1}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleStepImageChange(index, e.target.files[0])}
                />
                {stepImage && <p>Selected: {stepImage.name}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Attributes</label>
          {attributes.map((attr, index) => (
            <div key={index} className="attribute-input">
              <input
                type="text"
                placeholder="Attribute Name (e.g., calories)"
                value={attr.name}
                onChange={(e) => handleAttributeChange(index, 'name', e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Value (e.g., 415 kcal)"
                value={attr.value}
                onChange={(e) => handleAttributeChange(index, 'value', e.target.value)}
                required
              />
              <button type="button" onClick={() => removeAttribute(index)} disabled={attributes.length === 1}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addAttribute}>Add Attribute</button>
        </div>

        <div className="form-group">
          <label htmlFor="instructions">Instructions</label>
          <textarea
            id="instructions"
            placeholder="Enter step-by-step instructions (one per line)"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
          />
        </div>

        <div className="form-buttons">
          <button type="submit" className="save-btn">Save</button>
          <button type="button" className="cancel-btn" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default RecipeForm;