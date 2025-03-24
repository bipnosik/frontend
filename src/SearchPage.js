import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import RecipeCard from './RecipeCard';

function SearchPage({ user, onSearch }) {
  const [searchResults, setSearchResults] = useState([]);
  const [lastQuery, setLastQuery] = useState('');
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('query');
    if (query && query !== lastQuery) {
      setLastQuery(query);
      onSearch(query, setSearchResults);
    }
  }, [location.search, onSearch]);

  return (
    <div className="search-page">
      <h1>Результаты поиска</h1>
      <div className="search-results" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {searchResults.length > 0 ? (
          searchResults.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        ) : (
          <p>Результаты не найдены</p>
        )}
      </div>
    </div>
  );
}

export default SearchPage;