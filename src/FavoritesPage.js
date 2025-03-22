import React, { useState, useEffect } from 'react';
import RecipeCard from './RecipeCard';

const BASE_URL = 'https://meowsite-backend-production.up.railway.app';

function FavoritesPage({ user }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/favorites/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      setFavorites(data.map(fav => fav.recipe));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  if (!user) {
    return <div>Пожалуйста, авторизуйтесь, чтобы увидеть избранное</div>;
  }

  return (
    <div className="favorites-page">
      <h1>Favorite Recipes</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {favorites.length > 0 ? (
          favorites.map(recipe => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              user={user}
            />
          ))
        ) : (
          <p>No favorite recipes yet</p>
        )}
      </div>
    </div>
  );
}

export default FavoritesPage;