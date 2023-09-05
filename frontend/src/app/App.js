import './App.css';
import React, { useState } from 'react';

// We use Route in order to define the different routes of our application
import { Route, Routes } from "react-router-dom";

// We import all the components we need in our app
import { AuthProvider } from '../contexts/AuthContext';
import Register from './user-pages/Register';
import Login from './user-pages/Login';
import NavBar from './shared/NavBar';
import ForgotPass from './user-pages/ForgotPass';
import NutritionAnalyzer from './nutrition/NutritionAnalyzer';
import SearchBar from './recipe/SearchBar';
import RecipeList from './recipe/RecipeList';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
  <AuthProvider>
    <NavBar />
    <Routes>
      <Route path="/user-pages/register" element={<Register />} />
      <Route path="/user-pages/login" element={<Login />} />
      <Route path="/nutrition/nutritionanalyzer" element={<NutritionAnalyzer />} />
      <Route path="/recipe" element={
        <>
          <SearchBar onSearch={handleSearch} />
          <RecipeList searchQuery={searchQuery} />
        </>
      } />
    </Routes>
  </AuthProvider>


  );
}

export default App;