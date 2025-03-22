import React, { useState, useEffect } from 'react';
import './RecipeForm.css'; // Подключаем CSS

function RecipeForm({ onSave, onClose, initialRecipe }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState(''); // Оставляем строкой
  const [image, setImage] = useState(null); // Для файла изобasdasddражения
  const [cookingTime, setCookingTime] = useState(25); // По умолчанию 25
  const [calories, setCalories] = useState(145); // По умолчанию 145
  const [instructions, setInstructions] = useState(''); // Новое поле для инструкций

  // Если передан initialRecipe (для редактирования), заполняем форму
  useEffect(() => {
    if (initialRecipe) {
      setName(initialRecipe.name || '');
      setDescription(initialRecipe.description || '');
      setIngredients(initialRecipe.ingredients || '');
      setCookingTime(initialRecipe.cooking_time || 25);
      setCalories(initialRecipe.calories || 145);
      setInstructions(initialRecipe.instructions || ''); // Заполняем инструкции
      // Изображение не устанавливаем, так как это файл, а не URL
    }
  }, [initialRecipe]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Создаём объект с данными формы
    const newRecipe = {
      name,
      description,
      ingredients, // Отправляем как строку, бэкенд сам разберётся
      cooking_time: parseInt(cookingTime), // Преобразуем в число
      calories: parseInt(calories), // Преобразуем в число
      image: image || null, // Отправляем файл или null
      instructions, // Добавляем инструкции
    };

    onSave(newRecipe); // Передаём данные в App.js для отправки на сервер
    onClose(); // Закрываем форму

    // Сброс формы после отправки
    setName('');
    setDescription('');
    setIngredients('');
    setImage(null);
    setCookingTime(25);
    setCalories(145);
    setInstructions(''); // Сбрасываем инструкции
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // Устанавливаем файл
    }
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
          <label htmlFor="ingredients">Ingredients</label>
          <textarea
            id="ingredients"
            placeholder="Enter ingredients (comma-separated)"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="instructions">Instructions</label>
          <textarea
            id="instructions"
            placeholder="Enter step-by-step instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Image</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
          {image && <p>Selected: {image.name}</p>} {/* Показываем имя файла */}
        </div>

        <div className="form-group">
          <label htmlFor="cookingTime">Cooking Time (minutes)</label>
          <input
            id="cookingTime"
            type="number"
            placeholder="Cooking Time (mins)"
            value={cookingTime}
            onChange={(e) => setCookingTime(Math.max(1, e.target.value))} // Не меньше 1
            min="1"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="calories">Calories (kcal)</label>
          <input
            id="calories"
            type="number"
            placeholder="Calories (kcal)"
            value={calories}
            onChange={(e) => setCalories(Math.max(0, e.target.value))} // Не меньше 0
            min="0"
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