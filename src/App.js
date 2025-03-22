import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import Sidebar from './Sidebar';
import RecipeCard from './RecipeCard';
import RecipeDetails from './RecipeDetails';
import RecipeForm from './RecipeForm';
import SearchPage from './SearchPage';
import FavoritesPage from './FavoritesPage';
import './App.css';

const BASE_URL = 'https://meowsite-backend-production.up.railway.app';

function App() {
  const [recipes, setRecipes] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    fetchRecipes();
    const token = localStorage.getItem('accessToken');
    if (token) {
      setUser({ accessToken: token, username: localStorage.getItem('username') });
    }
  }, []);

  const fetchRecipes = () => {
    fetch(`${BASE_URL}/api/recipes/`)
      .then(response => response.json())
      .then(data => {
        const updatedRecipes = data.map(recipe => ({
          ...recipe,
          image: recipe.image ? `${BASE_URL}${recipe.image}` : '/default-image.jpg',
        }));
        setRecipes(updatedRecipes);
      })
      .catch(error => console.error("Error fetching recipes:", error));
  };

  const handleSearch = (query, setSearchResults) => {
    fetch(`${BASE_URL}/api/recipes/?search=${query}`)
      .then(response => {
        if (!response.ok) throw new Error('Search failed');
        return response.json();
      })
      .then(data => {
        const updatedResults = data.map(recipe => ({
          ...recipe,
          image: recipe.image ? `${BASE_URL}${recipe.image}` : '/default-image.jpg',
        }));
        setSearchResults(updatedResults);
      })
      .catch(error => console.error("Error searching recipes:", error));
  };

  const refreshToken = () => {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) {
      return Promise.reject('No refresh token');
    }

    return fetch(`${BASE_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })
      .then(response => {
        if (!response.ok) throw new Error('Refresh token failed');
        return response.json();
      })
      .then(data => {
        localStorage.setItem('accessToken', data.access);
        setUser({ accessToken: data.access, username: localStorage.getItem('username') });
        return data.access;
      })
      .catch(error => {
        console.error('Error refreshing token:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/';
        throw error;
      });
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('accessToken', userData.accessToken);
    localStorage.setItem('username', userData.username);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    localStorage.removeItem('refreshToken');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const saveRecipe = (recipeData) => {
    const method = editingRecipe && editingRecipe.id ? 'PUT' : 'POST';
    const url = editingRecipe && editingRecipe.id
      ? `${BASE_URL}/api/recipes/${editingRecipe.id}/`
      : `${BASE_URL}/api/recipes/`;

    const formData = new FormData();
    formData.append('name', recipeData.name);
    formData.append('description', recipeData.description);
    formData.append('ingredients', recipeData.ingredients);
    formData.append('instructions', recipeData.instructions);
    formData.append('cooking_time', recipeData.cooking_time || 25);
    formData.append('calories', recipeData.calories || 145);
    if (recipeData.image) {
      formData.append('image', recipeData.image);
    }

    fetch(url, {
      method: method,
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
      body: formData,
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(`Failed to save recipe: ${response.status} - ${JSON.stringify(err)}`);
          });
        }
        return response.json();
      })
      .then(data => {
        setShowForm(false);
        fetchRecipes();
      })
      .catch(error => console.error('Error saving recipe:', error));
  };

  const deleteRecipe = (recipeId) => {
    const token = localStorage.getItem('accessToken');
    fetch(`${BASE_URL}/api/recipes/${recipeId}/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to delete');
        setRecipes(prev => prev.filter(r => r.id !== recipeId));
      })
      .catch(error => console.error("Error deleting recipe:", error));
  };

  const toggleForm = (recipe = null) => {
    if (!user && !recipe) {
      alert('Пожалуйста, авторизуйтесь, чтобы добавить рецепт!');
      return;
    }
    setEditingRecipe(recipe);
    setShowForm(!showForm);
  };

  return (
    <Router>
      <div className="App">
        <button className="toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          onAddRecipe={toggleForm}
          user={user}
          onLogout={handleLogout}
          onLogin={handleLogin}
          isLoginModalOpen={isLoginModalOpen}
          setIsLoginModalOpen={setIsLoginModalOpen}
          isRegisterModalOpen={isRegisterModalOpen}
          setIsRegisterModalOpen={setIsRegisterModalOpen}
        />
        <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <h1>Try it today</h1>
          {user && (
            <>
              {showForm && (
                <RecipeForm
                  onSave={saveRecipe}
                  onClose={toggleForm}
                  initialRecipe={editingRecipe}
                />
              )}
            </>
          )}

          <Routes>
            <Route
              path="/"
              element={
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {recipes.map(recipe => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      onDelete={deleteRecipe}
                      onEdit={toggleForm}
                      user={user}
                    />
                  ))}
                </div>
              }
            />
            <Route
              path="/recipe/:id"
              element={
                <RecipeDetails
                  recipes={recipes}
                  user={user}
                  onOpenLogin={() => setIsLoginModalOpen(true)}
                  onOpenRegister={() => setIsRegisterModalOpen(true)}
                />
              }
            />
            <Route
              path="/search"
              element={<SearchPage user={user} onSearch={handleSearch} />}
            />
            <Route
              path="/favorites"
              element={<FavoritesPage user={user} />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;