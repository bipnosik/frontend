import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './RecipeDetails.css';

function RecipeDetails({ recipes, user, onOpenLogin, onOpenRegister }) {
  const { id } = useParams();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const recipe = recipes.find(r => r.id === parseInt(id));

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/api/comments/?recipe=${id}`)
      .then(response => response.json())
      .then(data => setComments(data))
      .catch(error => console.error('Ошибка загрузки комментариев:', error));
  }, [id]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      alert('Комментарий не может быть пустым');
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/api/comments/`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  },
  body: JSON.stringify({ recipe: id, text: newComment }),
})
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Ошибка при отправке комментария');
        }
      })
      .then(data => {
        setComments([...comments, data]);
        setNewComment('');
      })
      .catch(error => console.error('Ошибка:', error));
  };

  if (!recipe) return <div>Recipe not found</div>;

  return (
    <div className="recipe-page">
      <div className="detailsContainer">
        <h2>{recipe.name}</h2>
        <img
          src={recipe.image}
          alt={recipe.name}
          className="image"
          onError={(e) => (e.target.src = '/default-image.jpg')}
        />
        <p><strong>Cooking Time:</strong> {recipe.cooking_time} mins</p>
        <p><strong>Calories:</strong> {recipe.calories} kcal</p>
        <p><strong>Ingredients:</strong> {recipe.ingredients}</p>
        <p><strong>Instructions:</strong> {recipe.instructions || 'No instructions provided'}</p>
      </div>

      <div className="comments-section">
        <h3>Комментарии</h3>
        {comments.length > 0 ? (
          comments.map(comment => (
            <div key={comment.id} className="comment">
              <p><strong>{comment.author}</strong> ({new Date(comment.created_at).toLocaleString()})</p>
              <p>{comment.text}</p>
            </div>
          ))
        ) : (
          <p>Пока нет комментариев.</p>
        )}
      </div>

      {user ? (
        <div className="comment-form">
          <h4>Оставить комментарий</h4>
          <form onSubmit={handleCommentSubmit}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишите ваш комментарий..."
            />
            <button type="submit">Отправить</button>
          </form>
        </div>
      ) : (
        <p>
          Чтобы оставить комментарий,{' '}
          <button onClick={onOpenLogin}>войдите</button> или{' '}
          <button onClick={onOpenRegister}>зарегистрируйтесь</button>.
        </p>
      )}
    </div>
  );
}

export default RecipeDetails;