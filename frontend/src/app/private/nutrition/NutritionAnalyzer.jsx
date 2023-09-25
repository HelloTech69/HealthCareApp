import React, { useState } from 'react';
import '../../../assets/styles/NutritionAnalyzer.css';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [nutritionDataList, setNutritionDataList] = useState([]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const fetchData = async (item) => {
    try {
      const response = await fetch(
        `https://api.edamam.com/api/nutrition-data?app_id=${import.meta.env.VITE_EDAMAM_NUTRITION_APP_ID}&app_key=${import.meta.env.VITE_EDAMAM_NUTRITION_API_KEY}&nutrition-type=cooking&ingr=${encodeURIComponent(item)}`
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      setNutritionDataList((prevDataList) => [...prevDataList, { ...data, food: item }]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setNutritionDataList((prevDataList) => [...prevDataList, { error: true, food: item }]);
    }
  };

  const handleFetchClick = () => {
    const items = searchTerm.split('\n').map((item) => item.trim());
    setNutritionDataList([]); // Clear previous data
    items.forEach((item) => {
      if (item !== '') {
        fetchData(item);
      }
    });
  };

  const calculateTotal = () => {
    const total = nutritionDataList.reduce(
      (acc, data) => {
        acc.calories += data.calories || 0;
        acc.fat += data.totalNutrients?.FAT?.quantity || 0;
        acc.cholesterol += data.totalNutrients?.CHOLE?.quantity || 0;
        acc.sodium += data.totalNutrients?.NA?.quantity || 0;
        acc.carbohydrates += data.totalNutrients?.CHOCDF?.quantity || 0;
        acc.protein += data.totalNutrients?.PROCNT?.quantity || 0;
        acc.totalCO2Emissions += data.totalCO2Emissions || 0;
        return acc;
      },
      {
        calories: 0,
        fat: 0,
        cholesterol: 0,
        sodium: 0,
        carbohydrates: 0,
        protein: 0,
        totalCO2Emissions: 0,
      }
    );
    return total;
  };

  const totalNutrition = calculateTotal();

  return (
    <div className='container'>
      <div className="container bg-light py-5">
        <h1>Nutrition Data Search</h1>
        <div>
          <textarea
            placeholder="Enter food items (one per line)"
            value={searchTerm}
            onChange={handleSearchChange}
            rows={5}
          />
          <button onClick={handleFetchClick}>Fetch Nutrition Data</button>
        </div>
        {nutritionDataList.length > 0 ? (
          <div>
            {nutritionDataList.map((nutritionData, index) => (
              <div key={index} className="nutrition-container">
                {nutritionData.error ? (
                  <h2 className="nutrition-title">Error fetching data for {nutritionData.food}</h2>
                ) : (
                  <h2 className="nutrition-title">Nutrition Facts for {nutritionData.food}</h2>
                )}
                {nutritionData.error ? (
                  <p className="error-message">Failed to fetch nutrition data for {nutritionData.food}. Please check the item name.</p>
                ) : (
                  <div>
                    <div className="nutrition-fact">
                      <div className="nutrition-label">Calories</div>
                      <div className="nutrition-value">{nutritionData.calories?.toFixed(1)}</div>
                    </div>
                    {/* Render other nutrient information here */}
                    <div className="nutrition-fact">
                      <div className="nutrition-label">Total Weight</div>
                      <div className="nutrition-value">{nutritionData.totalWeight?.toFixed(1)} g</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Display total nutrition values */}
            <div className="nutrition-container">
              <h2 className="nutrition-title">Total Nutrition</h2>
              <div className="nutrition-fact">
                <div className="nutrition-label">Total Calories</div>
                <div className="nutrition-value">{totalNutrition.calories.toFixed(1)}</div>
              </div>
              <div className="nutrition-fact">
                <div className="nutrition-label">Total Fat</div>
                <div className="nutrition-value">{totalNutrition.fat.toFixed(1)} g</div>
              </div>
              <div className="nutrition-fact">
                <div className="nutrition-label">Total Cholesterol</div>
                <div className="nutrition-value">{totalNutrition.cholesterol.toFixed(1)} mg</div>
              </div>
              <div className="nutrition-fact">
                <div className="nutrition-label">Total Sodium</div>
                <div className="nutrition-value">{totalNutrition.sodium.toFixed(1)} mg</div>
              </div>
              <div className="nutrition-fact">
                <div className="nutrition-label">Total Carbohydrates</div>
                <div className="nutrition-value">{totalNutrition.carbohydrates.toFixed(1)} g</div>
              </div>
              <div className="nutrition-fact">
                <div className="nutrition-label">Total Protein</div>
                <div className="nutrition-value">{totalNutrition.protein.toFixed(1)} g</div>
              </div>
              <div className="nutrition-fact">
                <div className="nutrition-label">Total CO2 Emissions</div>
                <div className="nutrition-value">{totalNutrition.totalCO2Emissions.toFixed(1)}</div>
              </div>
            </div>
          </div>
        ) : (
          <p>Enter food items and click "Fetch Nutrition Data"</p>
        )}
        </div>
    </div>
  );
};

export default App;
