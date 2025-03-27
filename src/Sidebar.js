// frontend/src/Sidebar.js
import React, { useState } from 'react';
import { FaHome, FaSearch, FaUser, FaHeart, FaPlus, FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import defaultAvatar from './assets/image_12901130200388967001.gif';
import { BASE_URL } from './config'; // Импортируем BASE_URL из config.js

function Sidebar({
  isOpen,
  toggleSidebar,
  onAddRecipe,
  user,
  onLogout,
  onLogin,
  isLoginModalOpen,
  setIsLoginModalOpen,
  isRegisterModalOpen,
  setIsRegisterModalOpen,
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка входа: ${errorData.detail || response.statusText}`);
      }
      const data = await response.json();
      onLogin({
        accessToken: data.access,
        refreshToken: data.refresh,
        username: username,
      });
      setIsLoginModalOpen(false);
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Ошибка:', error.message);
      alert(`Ошибка входа: ${error.message}`);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/api/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Ошибка регистрации: ${errorData.detail || response.statusText}`);
      }
      const data = await response.json();
      alert('Регистрация успешна! Теперь войдите.');
      setIsRegisterModalOpen(false);
      setIsLoginModalOpen(true);
      setUsername('');
      setPassword('');
      setEmail('');
    } catch (error) {
      console.error('Ошибка:', error.message);
      alert(`Ошибка регистрации: ${error.message}`);
    }
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="user-info">
          <div className="avatar">
            <img src={defaultAvatar} alt="User Avatar" />
          </div>
          <span className="username">{user ? user.username : 'Guest'}</span>
        </div>
        <button className="toggle-btn" onClick={toggleSidebar}>
          <FaBars />
        </button>
      </div>
      <div className="sidebar-content">
        <nav>
          <ul>
            <li>
              <Link to="/" className="nav-link">
                <FaHome className="nav-icon" />
                <span className="nav-text">Home</span>
              </Link>
            </li>
            <li>
              <Link to="/search" className="nav-link">
                <FaSearch className="nav-icon" />
                <span className="nav-text">Browse</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="nav-link">
                <FaUser className="nav-icon" />
                <span className="nav-text">Profile</span>
              </Link>
            </li>
            <li>
              <Link to="/favorites" className="nav-link">
                <FaHeart className="nav-icon" />
                <span className="nav-text">Favorites</span>
              </Link>
            </li>
            <li onClick={onAddRecipe} className="nav-link">
              <FaPlus className="nav-icon" />
              <span className="nav-text">Add Recipe</span>
            </li>
          </ul>
        </nav>
        <div className="sidebar-footer">
          {user ? (
            <button className="sidebar-btn logout-btn" onClick={onLogout}>
              Logout
            </button>
          ) : (
            <div className="auth-buttons">
              <button className="sidebar-btn login-btn" onClick={() => setIsLoginModalOpen(true)}>
                Login
              </button>
              <button className="sidebar-btn register-btn" onClick={() => setIsRegisterModalOpen(true)}>
                Register
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно логина */}
      {isLoginModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Login</h2>
            <form onSubmit={handleLoginSubmit}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="modal-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="modal-input"
              />
              <div className="modal-buttons">
                <button type="submit" className="modal-btn modal-login-btn">
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="modal-btn modal-close-btn"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно регистрации */}
      {isRegisterModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Register</h2>
            <form onSubmit={handleRegisterSubmit}>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="modal-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="modal-input"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="modal-input"
              />
              <div className="modal-buttons">
                <button type="submit" className="modal-btn modal-register-btn">
                  Register
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="modal-btn modal-close-btn"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sidebar;