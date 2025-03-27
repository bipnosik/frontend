// frontend/src/RecipeDetails.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './RecipeDetails.css';

const BASE_URL = 'https://meowsite-backend-production.up.railway.app';

function RecipeDetails({ recipes, user, onOpenLogin, onOpenRegister }) {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    // Загружаем данные рецепта
    fetch(`${BASE_URL}/api/recipes/${id}/`)
      .then(response => response.json())
      .then(data => {
        console.log('Данные рецепта:', data); // Для отладки
        const updatedRecipe = {
          ...data,
          image: data.image
            ? data.image.startsWith('http')
              ? data.image
              : `${BASE_URL}${data.image}`
            : '/default-image.jpg',
          step_images: data.step_images
            ? data.step_images.map(img =>
                img.startsWith('http') ? img : `${BASE_URL}${img}`
              )
            : [],
        };
        setRecipe(updatedRecipe);
        setSelectedImage(updatedRecipe.image); // Устанавливаем главное изображение по умолчанию
      })
      .catch(error => console.error('Ошибка загрузки рецепта:', error));

    // Загружаем комментарии
    fetch(`${BASE_URL}/api/comments/?recipe=${id}`)
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

    fetch(`${BASE_URL}/api/comments/`, {
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

  const handleStepImageClick = (image) => {
    setSelectedImage(image);
  };

  if (!recipe) return <div>Recipe not found</div>;

  // Парсим ингредиенты, чтобы разделить количество и название
  const parsedIngredients = recipe.ingredients_list.map(ingredient => {
    const match = ingredient.match(/^(\d+\s*\w*)\s*(.*)$/); // Например, "2 cups flour" → ["2 cups", "flour"]
    if (match) {
      return { quantity: match[1], name: match[2] };
    }
    return { quantity: '', name: ingredient }; // Если формат не соответствует, показываем только название
  });

  return (
    <div className="recipe-details-page">
      <h2>{recipe.name}</h2>
      <div className="recipe-details-container">
        <div className="recipe-details-left">
          <div className="main-image-container">
            <img src={selectedImage} alt={recipe.name} className="main-image" />
          </div>
          <div className="recipe-description">
            <p>{recipe.description}</p>
          </div>
          <div className="recipe-attributes">
            {recipe.attributes.map((attr, index) => (
              <span key={index} className="attribute">
                {attr.name}: {attr.value}
              </span>
            ))}
          </div>
        </div>
        <div className="recipe-details-right">
          <div className="step-images-container">
            {recipe.step_images.length > 0 ? (
              recipe.step_images.map((image, index) => (
                <div
                  key={index}
                  className="step-image-wrapper"
                  onClick={() => handleStepImageClick(image)}
                >
                  <span className="step-number">{index + 1}</span>
                  <img src={image} alt={`Step ${index + 1}`} className="step-image" />
                </div>
              ))
            ) : (
              <p>Пошаговые изображения отсутствуют.</p>
            )}
          </div>
          <div className="ingredients-container">
            <h3>Ингредиенты</h3>
            <div className="ingredients-list">
              {parsedIngredients.map((ingredient, index) => (
                <div key={index} className="ingredient-item">
                  <span className="ingredient-quantity">{ingredient.quantity}</span>
                  <span className="ingredient-name">{ingredient.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="instructions-container">
            <h3>Инструкции</h3>
            <ol className="instructions-list">
              {recipe.instructions.split('\n').map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
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