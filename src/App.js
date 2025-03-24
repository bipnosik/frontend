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

  // Функция для выполнения запросов с автоматическим обновлением токена
  const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem('accessToken');
    if (!token) throw new Error('Токен отсутствует, пожалуйста, авторизуйтесь');

    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    };

    let response = await fetch(url, options);
    if (response.status === 401) {
      // Токен истёк, пытаемся обновить
      try {
        token = await refreshToken();
        options.headers['Authorization'] = `Bearer ${token}`;
        response = await fetch(url, options); // Повторяем запрос с новым токеном
      } catch (error) {
        console.error('Не удалось обновить токен:', error);
        handleLogout(); // Выходим, если обновление токена не удалось
        throw error;
      }
    }

    if (!response.ok) throw new Error('Ошибка сети');
    return response.json();
  };

  const fetchRecipes = async () => {
    try {
      const data = await fetch(`${BASE_URL}/api/recipes/`);
      if (!data.ok) throw new Error('Ошибка сети');
      const json = await data.json();
      const updatedRecipes = json.map(recipe => ({
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
      const data = await fetch(`${BASE_URL}/api/recipes/`);
      if (!data.ok) throw new Error('Ошибка сети');
      const json = await data.json();
      const updatedRecipes = json.slice(0, 5).map(recipe => ({
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
      const data = await fetchWithAuth(`${BASE_URL}/api/search-history/`);
      setSearchHistory(data);
    } catch (error) {
      console.error("Ошибка получения истории поиска:", error);
    }
  };

  const fetchRecentlyViewed = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const data = await fetchWithAuth(`${BASE_URL}/api/recently-viewed/`);
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
        await fetchWithAuth(`${BASE_URL}/api/search-history/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
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
    if (!refresh) {
      throw new Error('Нет токена обновления');
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
      throw error;
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('accessToken', userData.accessToken);
    localStorage.setItem('refreshToken', userData.refreshToken); // Убедитесь, что сохраняете refreshToken
    localStorage.setItem('username', userData.username);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('username');
    localStorage.removeItem('refreshToken');
    navigate('/');
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
      const response = await fetchWithAuth(url, {
        method: method,
        body: formData,
      });
      setShowForm(false);
      fetchRecipes();
    } catch (error) {
      console.error('Ошибка сохранения рецепта:', error);
    }
  };

  const deleteRecipe = async (recipeId) => {
    try {
      await fetchWithAuth(`${BASE_URL}/api/recipes/${recipeId}/`, {
        method: 'DELETE',
      });
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

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;