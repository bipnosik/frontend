// frontend/src/RecipeForm.js
import React, { useState, useEffect } from 'react';
import { FaImage, FaPencilAlt } from 'react-icons/fa';
import './RecipeForm.css';

function RecipeForm({ onSave, onClose, initialRecipe }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '' }]);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [stepImages, setStepImages] = useState([]);
  const [stepImagePreviews, setStepImagePreviews] = useState([]);
  const [instructions, setInstructions] = useState('');
  const [calories, setCalories] = useState('415 kcal');
  const [cookingTime, setCookingTime] = useState('25 mins');

  useEffect(() => {
    if (initialRecipe) {
      setName(initialRecipe.name || '');
      setDescription(initialRecipe.description || '');
      setIngredients(
        Array.isArray(initialRecipe.ingredients_list) && initialRecipe.ingredients_list.length > 0
          ? initialRecipe.ingredients_list.map(ing => {
              const match = ing.match(/^(\d+\s*\w*)\s*(.*)$/);
              return match ? { quantity: match[1], name: match[2] } : { quantity: '', name: ing };
            })
          : [{ name: '', quantity: '' }]
      );
      setInstructions(initialRecipe.instructions || '');
      setCalories(
        initialRecipe.attributes?.find(attr => attr.name === 'calories')?.value || '415 kcal'
      );
      setCookingTime(
        initialRecipe.attributes?.find(attr => attr.name === 'cooking time')?.value || '25 mins'
      );
      if (initialRecipe.image) {
        setImagePreview(initialRecipe.image);
      }
      if (Array.isArray(initialRecipe.step_images)) {
        setStepImagePreviews(initialRecipe.step_images);
      }
    }
  }, [initialRecipe]);

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '' }]);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleStepImageChange = (e, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    if (index !== null) {
      // Замена существующего изображения
      const newStepImages = [...stepImages];
      const newPreviews = [...stepImagePreviews];
      newStepImages[index] = file;
      newPreviews[index] = URL.createObjectURL(file);
      setStepImages(newStepImages);
      setStepImagePreviews(newPreviews);
    } else if (stepImages.length < 10) {
      // Добавление нового изображения
      setStepImages([...stepImages, file]);
      setStepImagePreviews([...stepImagePreviews, URL.createObjectURL(file)]);
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

    // Преобразуем ингредиенты в формат "количество название"
    ingredients.forEach((ingredient, index) => {
      if (ingredient.name.trim()) {
        const ingredientString = ingredient.quantity
          ? `${ingredient.quantity} ${ingredient.name}`
          : ingredient.name;
        formData.append(`ingredient_${index}`, ingredientString);
      }
    });

    stepImages.forEach((stepImage, index) => {
      if (stepImage) {
        formData.append(`step_image_${index}`, stepImage);
      }
    });

    // Добавляем калории и время как атрибуты
    formData.append('attribute_name_0', 'calories');
    formData.append('attribute_value_0', calories);
    formData.append('attribute_name_1', 'cooking time');
    formData.append('attribute_value_1', cookingTime);

    onSave(formData);
    onClose();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  return (
    <div className="recipe-form-overlay">
      <form className="recipe-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Название рецепта</label>
          <input
            id="name"
            type="text"
            placeholder="Введите название рецепта"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-content">
          <div className="image-section">
            <div className="main-image-container">
              {imagePreview ? (
                <img src={imagePreview} alt="Main" className="main-image" />
              ) : (
                <div className="image-placeholder">
                  <FaImage size={50} />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="image-input"
                id="main-image-input"
              />
              <label htmlFor="main-image-input" className="image-label">
                {imagePreview ? 'Заменить изображение' : 'Добавить изображение'}
              </label>
            </div>

            <div className="step-images-section">
              <div className="step-images-list">
                {stepImagePreviews.map((preview, index) => (
                  <div key={index} className="step-image-item">
                    <img src={preview} alt={`Step ${index + 1}`} className="step-image" />
                    <div className="edit-overlay">
                      <FaPencilAlt className="edit-icon" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleStepImageChange(e, index)}
                        className="image-input"
                        id={`step-image-input-${index}`}
                      />
                      <label htmlFor={`step-image-input-${index}`} className="edit-label" />
                    </div>
                  </div>
                ))}
              </div>
              {stepImages.length < 10 && (
                <div className="add-step-image">
                  <FaImage size={30} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStepImageChange}
                    className="image-input"
                    id="add-step-image"
                  />
                  <label htmlFor="add-step-image" className="add-image-label">
                    Добавить пошаговое изображение
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="details-section">
            <div className="form-group ingredients-group">
              <label>Ингредиенты</label>
              {ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-input">
                  <input
                    type="text"
                    placeholder="Название ингредиента"
                    value={ingredient.name}
                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                    onKeyPress={handleKeyPress}
                    required
                    className="ingredient-name-input"
                  />
                  <input
                    type="text"
                    placeholder="Количество"
                    value={ingredient.quantity}
                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="quantity-input"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                  >
                    Удалить
                  </button>
                </div>
              ))}
              <button type="button" onClick={addIngredient}>
                Добавить ингредиент
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="instructions">Инструкции</label>
              <textarea
                id="instructions"
                placeholder="Введите пошаговые инструкции (по одной на строку)"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                required
                className="instructions-textarea"
              />
            </div>

            <div className="form-group nutrition-group">
              <label>Питательная ценность</label>
              <div className="nutrition-input">
                <input
                  type="text"
                  placeholder="Калории (например, 415 kcal)"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Время приготовления (например, 25 mins)"
                  value={cookingTime}
                  onChange={(e) => setCookingTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Описание</label>
          <textarea
            id="description"
            placeholder="Введите описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-buttons">
          <button type="submit" className="save-btn">Сохранить</button>
          <button type="button" className="cancel-btn" onClick={onClose}>Отмена</button>
        </div>
      </form>
    </div>
  );
}

export default RecipeForm;