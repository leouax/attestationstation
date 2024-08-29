'use client';

import React, { useState } from 'react';
import styles from './page.module.css';

interface SearchBoxProps {
  onQueryChange: (query: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({ onQueryChange }) => {
  const [query, setQuery] = useState<string>('');

  const handleSearch = () => {
    console.log('Search term:', query);
    const url = query
    if (url.startsWith('http://') || url.startsWith('https://')) {
      onQueryChange(query); // Pass the query to the parent component
      return
    }
    if (url.includes('.')) {
      onQueryChange('https://' + url); // Pass the query to the parent component
      return
    }
    onQueryChange(query)
  };
    
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSearch();
      }
      
  };

  

  return (
    <div className={styles.searchboxcontainer}>
      <input
        className={styles.searchbox}
        type="search"
        id="search-box"
        placeholder="Paste a URL to get started..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default SearchBox;
