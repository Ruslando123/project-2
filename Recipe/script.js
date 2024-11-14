const apiKey = '7c2694ed67394fae838807c7076f1048';

// Function to update the active menu item, change the title, and fetch recipes by category
function setActive(button, category) {
  // Remove 'active' class from all buttons
  document.querySelectorAll('.menu-button').forEach(btn => btn.classList.remove('active'));

  // Add 'active' class to the clicked button
  button.classList.add('active');

  // Update the title to match the selected category
  const title = document.getElementById('category-title');
  title.textContent = capitalizeFirstLetter(category);

  // Get the left position of the clicked button relative to the menu
  const menu = document.querySelector('.menu');
  const buttonLeft = button.offsetLeft - menu.offsetLeft;

  // Update CSS variable to move the sliding background
  menu.style.setProperty('--button-left', `${buttonLeft}px`);

  // Fetch and display recipes for the selected category
  fetchRecipes(category);
}

// Helper function to capitalize the first letter of the category for the title
function capitalizeFirstLetter(string = '') {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Fetch recipes from the Spoonacular API based on category or search term
async function fetchRecipes(query) {
  try {
    const apiUrl = `https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}&number=12`;
    console.log('Fetching URL:', apiUrl); // Log the full URL
    const response = await fetch(apiUrl);
    const data = await response.json();
    localStorage.setItem('lastResults', JSON.stringify(data.results || [])); // Cache the last results
    displayRecipes(data.results || []);
  } catch (error) {
    console.error("Error fetching recipes:", error);
  }
}

// Display recipes in the grid, with an "Add to Favorites" button
function displayRecipes(recipes) {
  const recipeGrid = document.getElementById('recipe-grid');
  recipeGrid.innerHTML = ''; // Clear existing recipes
  if (recipes.length === 0) {
    recipeGrid.innerHTML = `<p>No recipes found for this query.</p>`;
    return;
  }
  recipes.forEach(recipe => {
    const recipeCard = document.createElement('div');
    recipeCard.classList.add('recipe-card');
    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <p>Ready in ${recipe.readyInMinutes} mins</p>
      <button class="view-details-btn" onclick="fetchRecipeDetails(${recipe.id})">View Details</button>
     
    `;
    recipeGrid.appendChild(recipeCard);
  });
}

function toggleFavorite(id, title, image, readyInMinutes) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const recipeIndex = favorites.findIndex(recipe => recipe.id === id);
  
    if (recipeIndex === -1) {
      // Add to favorites if not already in the list
      favorites.push({ id, title, image, readyInMinutes });
    } else {
      // Remove from favorites if already in the list
      favorites.splice(recipeIndex, 1);
    }
  
    // Update localStorage with the modified favorites list
    localStorage.setItem('favorites', JSON.stringify(favorites));
  
    // Optionally, update button text without changing the view
    const button = document.querySelector(`button[data-id="${id}"]`);
    if (button) {
      button.textContent = recipeIndex === -1 ? 'Remove from Favorites' : 'Add to Favorites';
    }
    
  }
  
  
  
  
  function isFavorite(id) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.some(recipe => recipe.id === id);
  }
  

// Display favorite recipes
function displayFavorites() {
  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  const title = document.getElementById('category-title');
  title.textContent = 'Your Favorite Recipes';

  displayRecipes(favorites);
}

// Search for recipes based on search input
function searchRecipes() {
  const searchInput = document.getElementById('search-input');
  const query = searchInput.value.trim();
  if (query) {
    // Update the title to show the search term
    const title = document.getElementById('category-title');
    title.textContent = `Search Results for "${query}"`;
    // Fetch recipes for the search term
    fetchRecipes(query);
  }
}

// Event listener for Enter key in search input
document.getElementById('search-input').addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    searchRecipes();
  }
});

// Event listener for search icon button
document.getElementById('search-icon').addEventListener('click', () => {
  searchRecipes();
});

// Event listener for the "Favorites" button
document.getElementById('favorites-button').addEventListener('click', displayFavorites);

// Fetch and display recipe details in a modal (optional feature)
async function fetchRecipeDetails(recipeId) {
  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${apiKey}`);
    const data = await response.json();
    displayRecipeDetails(data);
  } catch (error) {
    console.error("Error fetching recipe details:", error);
  }
}

// Display recipe details in a modal (optional feature)
function displayRecipeDetails(recipe) {
    const modal = document.getElementById('recipe-modal');
    const overlay = document.getElementById('modal-overlay');
    const recipeDetails = document.getElementById('recipe-details');
  
    recipeDetails.innerHTML = `
      <div class="scrollable-content">
        <h2>${recipe.title}</h2>
        <img src="${recipe.image}" alt="${recipe.title}">
        <p><strong>Ingredients:</strong></p>
        <ul>${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}</ul>
        <p><strong>Instructions:</strong></p>
        <p>${recipe.instructions}</p>
        <button class="add-to-favorites" data-id="${recipe.id}" onclick="toggleFavorite(${recipe.id}, '${recipe.title}', '${recipe.image}', ${recipe.readyInMinutes})">
        ${isFavorite(recipe.id) ? 'Remove from Favorites' : 'Add to Favorites'}
      </button>
      </div>
    `;
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
  }
  
  
// Close the recipe details modal
function closeModal() {
    document.getElementById('recipe-modal').classList.add('hidden');
    document.getElementById('modal-overlay').classList.add('hidden');
  }

// Initialize default view (e.g., load breakfast recipes)
document.addEventListener('DOMContentLoaded', () => {
  setActive(document.querySelector('.menu-button'), 'breakfast');
});
