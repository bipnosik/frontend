// frontend/src/RecipeCard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

const BASE_URL = 'https://meowsite-backend-production.up.railway.app';

function RecipeCard({ recipe, onDelete, onEdit, user }) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user, recipe.id]); // Добавляем recipe.id в зависимости, чтобы обновлять статус избранного при изменении рецепта

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/favorites/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Ошибка при проверке статуса избранного');
      }
      const favorites = await response.json();
      const isFav = favorites.some(fav => fav.recipe.id === recipe.id);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Ошибка проверки статуса избранного:', error);
    }
  };

  const toggleFavorite = async (e) => {
    e.preventDefault(); // Предотвращаем переход по ссылке при клике на кнопку избранного
    if (!user) {
      alert('Пожалуйста, авторизуйтесь, чтобы добавить в избранное!');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (isFavorite) {
        // Удаляем из избранного
        const response = await fetch(`${BASE_URL}/api/favorites/${recipe.id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Ошибка при удалении из избранного');
        }
        setIsFavorite(false);
      } else {
        // Добавляем в избранное
        const response = await fetch(`${BASE_URL}/api/favorites/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ recipe_id: recipe.id }),
        });
        if (!response.ok) {
          throw new Error('Ошибка при добавлении в избранное');
        }
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Ошибка при переключении статуса избранного:', error);
    }
  };

  // Формируем URL изображения
  const imageUrl = recipe.image
    ? recipe.image.startsWith('http')
      ? recipe.image
      : `${BASE_URL}${recipe.image}`
    : '/default-image.jpg';

  // Проверяем, является ли текущий пользователь создателем рецепта
  const isUserCreated = user && recipe.user && user.username === recipe.user;

  return (
    <div className="recipe-card">
      <Link to={`/recipe/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div className="recipe-card-image-container">
          <img src={imageUrl} alt={recipe.name} className="recipe-card-image" />
          <button onClick={toggleFavorite} className="favorite-btn">
            <FaHeart className={`favorite-icon ${isFavorite ? 'active' : ''}`} />
          </button>
        </div>
        <div className="recipe-card-info">
          <h3 className="recipe-card-title">{recipe.name}</h3>
          <div className="recipe-card-attributes">
            <span className="attribute">Cooking time: {recipe.cooking_time} mins</span>
            <span className="attribute">Calories: {recipe.calories} kcal</span>
          </div>
        </div>
      </Link>
      {isUserCreated && (
        <div className="recipe-card-buttons">
          <button onClick={(e) => { e.stopPropagation(); onEdit(recipe); }} className="edit-btn">
            Edit
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(recipe.id); }} className="delete-btn">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default RecipeCard;