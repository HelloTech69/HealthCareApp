import React, { useState, useEffect } from 'react';
import '../../../assets/styles/private_styles/RecipeCard.css';
import RecipeDetail from './RecipeDetail';;
import {motion} from 'framer-motion';
import Loader from '../../shared/loader/Loader.jsx';
import useRecipeStore from '../../../features/store/RecipeStore';

export default function RecipeList({ searchQuery }) {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchName = useRecipeStore((state) => state.searchName);
  const setRecipeSelected = useRecipeStore((state) => state.setRecipeSelected);
  const recipeResults = useRecipeStore((state) => state.recipeResults);
  const setSearchName = useRecipeStore((state) => state.setSearchName);
  const resetSearchName = useRecipeStore((state) => state.resetSearchName);
  const setRecipeResults = useRecipeStore((state) => state.setRecipeResults);
  const resetRecipeResults = useRecipeStore((state) => state.resetRecipeResults);

  const fadeInAnimation = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const hoverEffect = {
    whileHover:{
        scale:1.1
    },
    whileTap:{
        scale:1.1
    },
  }

  useEffect(() => {
    const baseUrl = import.meta.env.VITE_NODE_ENV === 'production' ? import.meta.env.VITE_HTTPS_SERVER : import.meta.env.VITE_DEVELOPMENT_SERVER;
    if (searchQuery) {
      if (searchName == '') {
        setSearchName(searchQuery);
      }
      else if (searchName == searchQuery) {
        setSearchResults([...recipeResults]);
        return;
      } else if (searchName != searchQuery) {
        resetSearchName();
        resetRecipeResults();
        setSearchName(searchQuery);
      }

      setLoading(true);
      fetch(`${baseUrl}/api/recipe/getRecipes?q=${encodeURIComponent(searchQuery)}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.hits) { 
            setLoading(false);
            setSearchResults(data.hits);
            setRecipeResults(data.hits);
          }
        })
        .catch((error) => console.error('Error fetching recipes:', error));
    }
    else {
      if (searchName != '') {
        setSearchResults([...recipeResults]);
      }
    }
  }, [searchQuery]);
  
  

  const handleRecipeClick = (recipe) => {
    setRecipeSelected(true);
    setSelectedRecipe(recipe);
  };

  return (
    loading ? <Loader /> :
    <div className="recipe-list row">
      {selectedRecipe ? (
        <RecipeDetail recipe={selectedRecipe.recipe} setSelectedRecipe={setSelectedRecipe} />
      ) : (
        searchResults.map((recipe, index) => (
          <motion.div
            key={recipe.recipe.uri}
            variants={fadeInAnimation} 
            initial="hidden"
            animate="visible"
            transition={{ duration: 1, delay: index * 0.3 }}
            className="col-lg-3 col-md-4 col-sm-6 col-xs-12 mb-4"
          >
            <motion.div className="card recipe-card mx-0"  variants={hoverEffect} whileHover="whileHover">
              <img src={recipe.recipe.image} alt={recipe.recipe.label} className="card-img-top" loading="lazy"/>
              <div className='card-body'>
                <h5 className="card-title card-list-title">{recipe.recipe.label}</h5>
              </div>
              <div className='card-content'>
                <ul className='list-group list-group-flush'>
                  <li className='list-group-item'>Servings: {recipe.recipe.yield}</li>
                  <li className='list-group-item'>Calories: {Math.round(recipe.recipe.calories)}</li>
                  {recipe.recipe.totalNutrients.PROCNT && (
                    <li className='list-group-item'>Protein: {Math.round(recipe.recipe.totalNutrients.PROCNT.quantity)} g</li>
                  )}
                  {recipe.recipe.totalNutrients.FAT && (
                    <li className='list-group-item'>Fat: {Math.round(recipe.recipe.totalNutrients.FAT.quantity)} g</li>
                  )}
                  {recipe.recipe.totalCO2Emissions && (
                    <li className='list-group-item'>
                      <div>Total CO2 Emissions:</div>
                      <div>{!isNaN(recipe.recipe.totalCO2Emissions) ? Math.round(recipe.recipe.totalCO2Emissions) : 0}</div>
                    </li>
                  )}
                  <button type="button" className="btn btn-secondary" onClick={() => handleRecipeClick(recipe)}>View Recipe</button>
                </ul>
              </div>
            </motion.div>
          </motion.div>
        ))
      )}
    </div>
  );
}
