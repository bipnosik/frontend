import React, { useState } from 'react';
import { FaHome, FaSearch, FaUser, FaHeart, FaClipboardList, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import defaultAvatar from './assets/image_12901130200388967001.gif';

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

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    fetch(`${process.env.REACT_APP_API_URL}/api/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.access && data.refresh) {
          onLogin({ accessToken: data.access, username });
          localStorage.setItem('accessToken', data.access);
          localStorage.setItem('refreshToken', data.refresh);
          setUsername('');
          setPassword('');
          setIsLoginModalOpen(false);
        } else {
          alert('Ошибка авторизации: токены не получены');
          console.log('Login response:', data);
        }
      })
      .catch(error => console.error('Ошибка:', error));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    fetch(`${process.env.REACT_APP_API_URL}/api/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, email }),
    })
      .then(response => response.json())
      .then(data => {
        if (data.access) {
          onLogin({ accessToken: data.access, username });
          setUsername('');
          setPassword('');
          setEmail('');
          setIsRegisterModalOpen(false);
        } else {
          alert('Ошибка регистрации');
        }
      })
      .catch(error => console.error('Ошибка:', error));
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-content">
        <div className="user-info">
          <div className="avatar">
            <img src={defaultAvatar} alt="User Avatar" />
          </div>
          <p className="username">{user ? user.username : 'Guest'}</p>
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
        <nav>
          <ul>
            <li>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <FaHome />
                <span className="nav-text">Home</span>
              </Link>
            </li>
            <li>
              <Link to="/search" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <FaSearch />
                <span className="nav-text">Browse</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <FaUser />
                <span className="nav-text">Profile</span>
              </Link>
            </li>
            <li>
              <Link to="/favorites" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <FaHeart />
                <span className="nav-text">Favorites</span>
              </Link>
            </li>
            <li>
              <Link to="/my-recipes" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <FaClipboardList />
                <span className="nav-text">My Recipes</span>
              </Link>
            </li>
            <li onClick={onAddRecipe} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <FaPlus />
              <span className="nav-text">Add Recipe</span>
            </li>
          </ul>
        </nav>
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