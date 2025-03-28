// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import Sidebar from './Sidebar';
import RecipeCard from './RecipeCard';
import RecipeDetails from './RecipeDetails';
import RecipeForm from './RecipeForm';
import SearchPage from './SearchPage';
import FavoritesPage from './FavoritesPage';
import './App.css';
import { BASE_URL } from './config';

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
  const navigate = useNavigate();

  const fetchSearchHistory = React.useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const data = await fetchWithAuth(`${BASE_URL}/api/search-history/`);
      setSearchHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Ошибка получения истории поиска:", error);
      setSearchHistory([]);
    }
  }, []);

  const fetchRecentlyViewed = React.useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const data = await fetchWithAuth(`${BASE_URL}/api/recently-viewed/`);
      const updatedRecentlyViewed = Array.isArray(data)
        ? data.map(item => ({
            ...item.recipe,
            image: item.recipe?.image ? item.recipe.image : '/default-image.jpg',
            step_images: Array.isArray(item.recipe?.step_images)
              ? item.recipe.step_images
              : [],
            user: item.recipe?.user ? item.recipe.user : null,
            attributes: Array.isArray(item.recipe?.attributes) ? item.recipe.attributes : [],
            ingredients_list: Array.isArray(item.recipe?.ingredients_list)
              ? item.recipe.ingredients_list
              : [],
          }))
        : [];
      setRecentlyViewed(updatedRecentlyViewed);
    } catch (error) {
      console.error("Ошибка получения недавно просмотренных:", error);
      setRecentlyViewed([]);
    }
  }, []);

  React.useEffect(() => {
    fetchRecipes();
    fetchRecommendedRecipes();
    const token = localStorage.getItem('accessToken');
    if (token) {
      setUser({ accessToken: token, username: localStorage.getItem('username') });
      fetchSearchHistory();
      fetchRecentlyViewed();
    }
  }, [fetchSearchHistory, fetchRecentlyViewed]);

  const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Токен отсутствует, пожалуйста, авторизуйтесь');

    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    let response = await fetch(url, options);
    if (response.status === 401) {
      try {
        token = await refreshToken();
        options.headers['Authorization'] = `Bearer ${token}`;
        response = await fetch(url, options);
      } catch (error) {
        console.error('Не удалось обновить токен:', error);
        handleLogout();
        throw error;
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ошибка сети: ${errorText}`);
    }
    return response.json();
  };

  const fetchRecipes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/recipes/`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка сети: ${errorText}`);
      }
      const json = await response.json();
      const updatedRecipes = json.map(recipe => ({
        ...recipe,
        image: recipe.image ? recipe.image : '/default-image.jpg',
        step_images: Array.isArray(recipe.step_images)
          ? recipe.step_images
          : [],
        user: recipe.user ? recipe.user : null,
        attributes: Array.isArray(recipe.attributes) ? recipe.attributes : [],
        ingredients_list: Array.isArray(recipe.ingredients_list) ? recipe.ingredients_list : [],
      }));
      setRecipes(updatedRecipes);
    } catch (error) {
      console.error("Ошибка получения рецептов:", error);
      setRecipes([]);
    }
  };

  const fetchRecommendedRecipes = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/recipes/`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка сети: ${errorText}`);
      }
      const json = await response.json();
      const updatedRecipes = json.slice(0, 5).map(recipe => ({
        ...recipe,
        image: recipe.image ? recipe.image : '/default-image.jpg',
        step_images: Array.isArray(recipe.step_images)
          ? recipe.step_images
          : [],
        user: recipe.user ? recipe.user : null,
        attributes: Array.isArray(recipe.attributes) ? recipe.attributes : [],
        ingredients_list: Array.isArray(recipe.ingredients_list) ? recipe.ingredients_list : [],
      }));
      setRecommendedRecipes(updatedRecipes);
    } catch (error) {
      console.error("Ошибка получения рекомендованных рецептов:", error);
      setRecommendedRecipes([]);
    }
  };

  const handleSearch = async (query, callback) => {
    if (!query) return;
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        await fetchWithAuth(`${BASE_URL}/api/search-history/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        fetchSearchHistory();
      } catch (error) {
        console.error("Ошибка сохранения поискового запроса:", error);
      }
    }

    try {
      const response = await fetch(`${BASE_URL}/api/recipes/?search=${query}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка сети: ${errorText}`);
      }
      const data = await response.json();
      const updatedRecipes = data.map(recipe => ({
        ...recipe,
        image: recipe.image ? recipe.image : '/default-image.jpg',
        step_images: Array.isArray(recipe.step_images)
          ? recipe.step_images
          : [],
        user: recipe.user ? recipe.user : null,
        attributes: Array.isArray(recipe.attributes) ? recipe.attributes : [],
        ingredients_list: Array.isArray(recipe.ingredients_list) ? recipe.ingredients_list : [],
      }));
      if (callback) callback(updatedRecipes);
      navigate(`/search?query=${query}`);
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
    if (!refresh) throw new Error('Нет токена обновления');

    try {
      const response = await fetch(`${BASE_URL}/api/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка обновления токена: ${errorText}`);
      }
      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      setUser({ accessToken: data.access, username: localStorage.getItem('username') });
      return data.access;
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      throw error;
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('accessToken', userData.accessToken);
    localStorage.setItem('refreshToken', userData.refreshToken);
    localStorage.setItem('username', userData.username);
    fetchSearchHistory();
    fetchRecentlyViewed();
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    localStorage.removeItem('refreshToken');
    setSearchHistory([]);
    setRecentlyViewed([]);
    navigate('/');
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const saveRecipe = async (formData) => {
    const method = editingRecipe && editingRecipe.id ? 'PUT' : 'POST';
    const url = editingRecipe && editingRecipe.id
      ? `${BASE_URL}/api/recipes/${editingRecipe.id}/`
      : `${BASE_URL}/api/recipes/`;

    // Извлекаем ингредиенты из FormData и преобразуем в массив
    const ingredientsList = [];
    formData.forEach((value, key) => {
      if (key.startsWith('ingredient_')) {
        ingredientsList.push(value);
      }
    });

    // Создаём новый FormData с правильным форматом для ingredients_list
    const updatedFormData = new FormData();
    formData.forEach((value, key) => {
      if (!key.startsWith('ingredient_')) {
        updatedFormData.append(key, value);
      }
    });
    updatedFormData.append('ingredients_list', JSON.stringify(ingredientsList));

    let response;
    try {
      response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: updatedFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка сохранения рецепта: ${errorText}`);
      }

      const savedRecipe = await response.json();
      console.log('Сохранённый рецепт:', savedRecipe); // Логирование для отладки
      const updatedRecipe = {
        ...savedRecipe,
        image: savedRecipe.image ? savedRecipe.image : '/default-image.jpg',
        step_images: Array.isArray(savedRecipe.step_images) ? savedRecipe.step_images : [],
        user: savedRecipe.user || localStorage.getItem('username'),
        attributes: Array.isArray(savedRecipe.attributes) ? savedRecipe.attributes : [],
        ingredients_list: Array.isArray(savedRecipe.ingredients_list)
          ? savedRecipe.ingredients_list
          : [],
      };

      setShowForm(false);
      if (method === 'POST') {
        setRecipes(prev => [updatedRecipe, ...prev]);
      } else {
        setRecipes(prev => prev.map(r => (r.id === updatedRecipe.id ? updatedRecipe : r)));
      }
    } catch (error) {
      console.error('Ошибка сохранения рецепта:', error);
    }
  };

  const deleteRecipe = async (recipeId) => {
    try {
      const response = await fetch(`${BASE_URL}/api/recipes/${recipeId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ошибка удаления рецепта: ${errorText}`);
      }
      setRecipes(prev => prev.filter(r => r.id !== recipeId));
    } catch (error) {
      console.error("Ошибка удаления рецепта:", error);
    }
  };

  const toggleForm = (recipe = null) => {
    if (!user && !recipe) {
      setIsLoginModalOpen(true);
      return;
    }
    setEditingRecipe(recipe);
    setShowForm(prev => !prev);
  };

  return (
    <div className="App">
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
              {Array.isArray(searchHistory) && searchHistory.length > 0 && (
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
              {Array.isArray(recentlyViewed) && recentlyViewed.length > 0 && (
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
              {Array.isArray(recommendedRecipes) && recommendedRecipes.length > 0 && (
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

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;