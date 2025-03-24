// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { FaBars, FaSearch } from 'react-icons/fa';
import Sidebar from './Sidebar';
import RecipeCard from './RecipeCard';
import RecipeDetails from './RecipeDetails';
import RecipeForm from './RecipeForm';
import SearchPage from './SearchPage';
import FavoritesPage from './FavoritesPage';
import './App.css';

const BASE_URL = 'https://meowsite-backend-production.up.railway.app';

// Дочерний компонент, который будет использовать useNavigate
function AppContent() {
  const [recipes, setRecipes] = React.useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingRecipe, setEditingRecipe] = React.useState(null);
  const [user, setUser] = React.useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchHistory, setSearchHistory] = React.useState([]);
  const [recentlyViewed, setRecentlyViewed] = React.useState([]);
  const [recommendedRecipes, setRecommendedRecipes] = React.useState([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = React.useState(false);
  const navigate = useNavigate(); // Теперь useNavigate используется внутри Router

  React.useEffect(() => {
    fetchRecipes();
    fetchRecommendedRecipes();
    const token = localStorage.getItem('accessToken');
    if (token) {
      setUser({ accessToken: token, username: localStorage.getItem('username') });
      fetchSearchHistory();
      fetchRecentlyViewed();
    }
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/recipes/`);
      if (!response.ok) throw new Error('Ошибка сети');
      const data = await response.json();
      const updatedRecipes = data.map(recipe => ({
        ...recipe,
        image: recipe.image ? `${BASE_URL}${recipe.image}` : '/default-image.jpg',
      }));
      setRecipes(updatedRecipes);
    } catch (error) {
      console.error("Ошибка получения рецептов:", error);
    }
  };

  const fetchRecommendedRecipes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/recipes/`);
      if (!response.ok) throw new Error('Ошибка сети');
      const data = await response.json();
      const updatedRecipes = data.slice(0, 5).map(recipe => ({
        ...recipe,
        image: recipe.image ? `${BASE_URL}${recipe.image}` : '/default-image.jpg',
      }));
      setRecommendedRecipes(updatedRecipes);
    } catch (error) {
      console.error("Ошибка получения рекомендованных рецептов:", error);
    }
  };

  const fetchSearchHistory = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const response = await fetch(`${BASE_URL}/api/search-history/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Ошибка сети');
      const data = await response.json();
      setSearchHistory(data);
    } catch (error) {
      console.error("Ошибка получения истории поиска:", error);
    }
  };

  const fetchRecentlyViewed = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const response = await fetch(`${BASE_URL}/api/recently-viewed/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Ошибка сети');
      const data = await response.json();
      const updatedRecentlyViewed = data.map(item => ({
        ...item.recipe,
        image: item.recipe.image ? `${BASE_URL}${item.recipe.image}` : '/default-image.jpg',
      }));
      setRecentlyViewed(updatedRecentlyViewed);
    } catch (error) {
      console.error("Ошибка получения недавно просмотренных:", error);
    }
  };

  const handleSearch = async (query, callback) => {
    if (!query) return;
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await fetch(`${BASE_URL}/api/search-history/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ query }),
        });
        fetchSearchHistory();
      } catch (error) {
        console.error("Ошибка сохранения поискового запроса:", error);
      }
    }

    // Выполняем поиск
    try {
      const response = await fetch(`${BASE_URL}/api/recipes/?search=${query}`);
      if (!response.ok) throw new Error('Ошибка сети');
      const data = await response.json();
      const updatedRecipes = data.map(recipe => ({
        ...recipe,
        image: recipe.image ? `${BASE_URL}${recipe.image}` : '/default-image.jpg',
      }));
      if (callback) callback(updatedRecipes); // Передаём результаты в SearchPage
      navigate(`/search?query=${query}`); // Навигация без перезагрузки
    } catch (error) {
      console.error("Ошибка выполнения поиска:", error);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const handleHistoryClick = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem('refreshToken');
    if (!refresh) {
      return Promise.reject('Нет токена обновления');
    }

    try {
      const response = await fetch(`${BASE_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) throw new Error('Ошибка обновления токена');
      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      setUser({ accessToken: data.access, username: localStorage.getItem('username') });
      return data.access;
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      navigate('/');
      throw error;
    }
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

  const saveRecipe = async (recipeData) => {
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

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(`Ошибка сохранения рецепта: ${response.status} - ${JSON.stringify(err)}`);
      }
      const data = await response.json();
      setShowForm(false);
      fetchRecipes();
    } catch (error) {
      console.error('Ошибка сохранения рецепта:', error);
    }
  };

  const deleteRecipe = async (recipeId) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`${BASE_URL}/api/recipes/${recipeId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Ошибка удаления');
      setRecipes(prev => prev.filter(r => r.id !== recipeId));
    } catch (error) {
      console.error("Ошибка удаления рецепта:", error);
    }
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
        {/* Поисковая строка */}
        <div className="search-container">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Поиск рецептов, ингредиентов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsSearchDropdownOpen(false), 200)}
                className="search-input"
              />
            </div>
          </form>
          {isSearchDropdownOpen && (
            <div className="search-dropdown">
              {/* Недавние запросы */}
              {searchHistory.length > 0 && (
                <div className="dropdown-section">
                  <h4>Недавние запросы</h4>
                  <ul>
                    {searchHistory.slice(0, 5).map((item, index) => (
                      <li
                        key={index}
                        onClick={() => handleHistoryClick(item.query)}
                        className="dropdown-item"
                      >
                        {item.query}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Недавно просмотренные рецепты */}
              {recentlyViewed.length > 0 && (
                <div className="dropdown-section">
                  <h4>Недавно просмотренные</h4>
                  <ul>
                    {recentlyViewed.map((recipe, index) => (
                      <li
                        key={index}
                        onClick={() => navigate(`/recipe/${recipe.id}`)}
                        className="dropdown-item"
                      >
                        <img src={recipe.image} alt={recipe.name} className="dropdown-image" />
                        {recipe.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Рекомендованные рецепты */}
              {recommendedRecipes.length > 0 && (
                <div className="dropdown-section">
                  <h4>Рекомендуем</h4>
                  <ul>
                    {recommendedRecipes.map((recipe, index) => (
                      <li
                        key={index}
                        onClick={() => navigate(`/recipe/${recipe.id}`)}
                        className="dropdown-item"
                      >
                        <img src={recipe.image} alt={recipe.name} className="dropdown-image" />
                        {recipe.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <h1>Попробуйте сегодня</h1>
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
  );
}

// Основной компонент, который только оборачивает в Router
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;