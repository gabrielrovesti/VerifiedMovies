import React, { useState } from 'react';
import './SearchBox.css';

interface SearchBoxProps {
  onSearch: (query: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
  };

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <div className="search-container">
      <label htmlFor="searchInput" className="sr-only">Search</label>
      <input
        type="text"
        id="searchInput"
        value={query}
        onChange={handleInputChange}
        placeholder="Inserisci qui per cercare..."
        className="search-input"
      />
      <button onClick={handleSearch} className="search-button">
        Cerca
      </button>
    </div>
  );
};

export default SearchBox;
