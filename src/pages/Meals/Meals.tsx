import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '../../Components/SearchBar';
import Footer from '../../Components/Footer';
import RecipeCard from '../../Components/RecipeCard';
import RecipesContext from '../../context/RecipesContext';
import { fetchName,
  fetchfirstLetter,
  fetchIngredients } from '../../Components/services/Api';
import Header from '../../Components/Header';
import { CategoryType, MealType } from '../../types';

interface Recipe {
  id: string;
  imageUrl: string;
  name: string;
  strCategory: string;
}
function Meals() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { filter } = useContext(RecipesContext);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    let url = 'https://www.themealdb.com/api/json/v1/1/list.php?c=list';
    if (selectedCategory) {
      url = 'https://www.thecocktaildb.com/api/json/v1/1/list.php?c=list';
    }
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.meals) {
      const categoryData = data.meals.map((category: any) => category.strCategory);
      setCategories(categoryData.slice(0, 5));
      if (selectedCategory === null) {
        setSelectedCategory(categoryData[0]);
      }
    }
  };
  const fetchRecipesByCategory = async (category: CategoryType) => {
    // console.log('oii', category);
    try {
      setIsLoading(true);
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      // const { meals } = data;
      // console.log(meals);
      const recipeData = data.meals.map((meal: MealType) => ({
        id: meal.idMeal,
        imageUrl: meal.strMealThumb,
        name: meal.strMeal,
        strCategory: meal.strCategory,
      }));
      setRecipes(recipeData);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const fetchRecipes = async () => {
    const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=');
    const data = await response.json();
    // console.log(data);

    const recipeData = data.meals.map((meal: MealType) => ({
      id: meal.idMeal,
      imageUrl: meal.strMealThumb,
      name: meal.strMeal,
      strCategory: meal.strCategory,
    }));
    setRecipes(recipeData);
  };

  useEffect(() => {
    fetchCategories();
    fetchRecipes();
    fetchRecipesByCategory(selectedCategory as unknown as CategoryType);

    if (filter.type === 'name') {
      fetchName(filter.value).then((data) => {
        const recipeData = data.meals.map((meal: any) => ({
          id: meal.idMeal,
          imageUrl: meal.strMealThumb,
          name: meal.strMeal,
          strCategory: meal.strCategory,
        }));
        if (recipeData.length === 1) {
          const recipeId = recipeData[0].id;
          navigate(`/meals/${recipeId}`);
        } else {
          setRecipes(recipeData);
        }
      });
    } else if (filter.type === 'firstletter') {
      fetchfirstLetter(filter.value).then((data) => {
        const recipeData = data.meals.map((meal: any) => ({
          id: meal.idMeal,
          imageUrl: meal.strMealThumb,
          name: meal.strMeal,
          strCategory: meal.strCategory,
        }));
        setRecipes(recipeData);
      });
    } else if (filter.type === 'ingredientes') {
      fetchIngredients(filter.value).then((data) => {
        const recipeData = data.meals.map((meal: any) => ({
          id: meal.idMeal,
          imageUrl: meal.strMealThumb,
          name: meal.strMeal,
          strCategory: meal.strCategory,
        }));
        setRecipes(recipeData);
      });
    }
  }, [selectedCategory, filter]);

  const handleCategoryFilter = (category: string) => {
    if (category === selectedCategory) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
      fetchRecipesByCategory(category as unknown as CategoryType);
    }
  };
  const handleClearFilters = () => {
    setSelectedCategory(null);
  };
  const recipesToRender = recipes.slice(0, 12);

  return (
    <>
      <div>
        <Header />
        <h1 data-testid="page-title">Meals</h1>
        <SearchBar />
        {categories.map((category, index) => (
          <button
            key={ index }
            onClick={ () => handleCategoryFilter(category) }
            data-testid={ `${category}-category-filter` }
          >
            {category}
          </button>
        ))}
        <button onClick={ handleClearFilters } data-testid="All-category-filter">
          Clear Filters
        </button>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          recipesToRender.map((recipe, index) => (
            <RecipeCard
              key={ recipe.id }
              id={ recipe.id }
              index={ index }
              imageUrl={ recipe.imageUrl }
              name={ recipe.name }
              data-testid="recipe-card"
              isDrinks={ false }
            />
          ))
        )}
      </div>
      <div>
        <Footer />
      </div>
    </>
  );
}
export default Meals;
