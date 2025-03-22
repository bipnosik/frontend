import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

const BASE_URL = 'https://meowsite-backend-production.up.railway.app';

function RecipeCard({ recipe, onClick, onDelete, onEdit, user }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const categories = Array.isArray(recipe.categories) ? recipe.categories.slice(0, 2) : [];

  // Проверка статуса избрhhаннdого при загрузке компоненkkта
  useEffect(() => {
    if (user) {
      checkFavoriteStatus();
    }
  }, [user]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/favorites/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const favorites = await response.json();
      const isFav = favorites.some(fav => fav.recipe.id === recipe.id);
      setIsFavorite(isFav);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  // Обработка добавления/удаления из избранного
  const toggleFavorite = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Пожалуйста, авторизуйтесь, чтобы добавить в избранное!');
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (isFavorite) {
        await fetch(`${BASE_URL}/api/favorites/${recipe.id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setIsFavorite(false);
      } else {
        await fetch(`${BASE_URL}/api/favorites/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ recipe_id: recipe.id })
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const imageUrl = recipe.image
    ? recipe.image.startsWith('http')
      ? recipe.image
      : `${BASE_URL}${recipe.image}`
    : '/default-image.jpg';

  return (
    <div
      className={`recipe-card ${recipe.userCreated ? 'user-recipe' : ''}`}
      style={styles.card}
    >
      <Link to={`/recipe/${recipe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <img
          src={imageUrl}
          alt={recipe.name}
          style={styles.image}
        />
        <div style={styles.info}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={styles.title}>{recipe.name}</h3>
            <FaHeart
              onClick={toggleFavorite}
              style={{
                color: isFavorite ? '#BA5371' : '#ccc',
                cursor: 'pointer',
                fontSize: '20px',
                marginRight: '10px'
              }}
            />
          </div>
          <p><strong>Cooking time:</strong> {recipe.cooking_time} mins</p>
          <p><strong>Calories:</strong> {recipe.calories} kcal</p>
          <div style={styles.categories}>
            {categories.map((category, index) => (
              <span key={index} style={styles.category}>{category}</span>
            ))}
          </div>
        </div>
      </Link>
      {recipe.userCreated && (
        <div style={styles.buttons}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(recipe); }}
            style={styles.editButton}
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(recipe.id); }}
            style={styles.deleteButton}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// Стили остаются без изменений
const styles = {
  card: {
    width: '230px',
    height: '330px',
    border: '2px solid #ccc',
    borderRadius: '12px',
    margin: '10px',
    cursor: 'pointer',
    transition: 'transform 0.3s ease',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    background: '#fff',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '170px',
    objectFit: 'cover',
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
  },
  info: {
    padding: '15px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 'calc(100% - 170px)',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  categories: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
    flexWrap: 'wrap',
  },
  category: {
    backgroundColor: '#f0f0f0',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#666',
  },
  buttons: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px',
  },
  editButton: {
    background: '#4CAF50',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background 0.3s ease',
  },
  deleteButton: {
    background: '#ff4444',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background 0.3s ease',
  },
};

export default RecipeCard;