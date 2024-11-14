const apiKey = 'e2b0b9fa6648279089d9ded5bb9493eb'; // Replace with your OpenWeatherMap API key
const geoDbApiKey = 'b8c52ac8e4msha053e109a2089f6p1806e3jsnf85fabe9f60a';
let unit = 'metric'; // Default unit is Celsius
let unitSymbol = '°C';


// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const locationBtn = document.getElementById('location-btn');
const suggestions = document.getElementById('suggestions');
const unitToggle = document.getElementById('unit-toggle');
const unitLabel = document.getElementById('unit-label');
const currentWeatherDiv = document.getElementById('current-weather');
const forecastDiv = document.getElementById('forecast');

// Event Listeners
cityInput.addEventListener('input', handleCityInput);
searchBtn.addEventListener('click', () => fetchWeatherData(cityInput.value));
locationBtn.addEventListener('click', getLocationWeather);
unitToggle.addEventListener('change', toggleUnit);

// Handle City Input and Suggestions
function handleCityInput() {
  const query = cityInput.value.trim();
  if (query.length > 1) {
    fetchCitySuggestions(query);
  } else {
    suggestions.innerHTML = ''; // Clear suggestions if query is too short
  }
}

// Fetch city suggestions from GeoDB Cities API
async function fetchCitySuggestions(query) {
  try {
    const response = await fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}&limit=5`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': geoDbApiKey,
        'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
      }
    });
    const data = await response.json();
    const cities = data.data.map(city => `${city.city}, ${city.countryCode}`);
    displaySuggestions(cities);
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
  }
}

// Display Suggestions
function displaySuggestions(cities) {
  suggestions.innerHTML = '';
  cities.forEach(city => {
    const suggestionItem = document.createElement('div');
    suggestionItem.className = 'suggestion-item';
    suggestionItem.textContent = city;
    
    suggestionItem.addEventListener('click', () => {
      cityInput.value = city;
      suggestions.innerHTML = '';
      fetchWeatherData(city); // Fetch weather for the selected city
    });
    
    suggestions.appendChild(suggestionItem);
  });
}

// Fetch Weather Data by City
async function fetchWeatherData(city) {
  try {
    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`);
    const weatherData = await weatherRes.json();
    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`);
    const forecastData = await forecastRes.json();

    displayCurrentWeather(weatherData);
    displayForecast(forecastData);
  } catch (error) {
    alert('Failed to fetch weather data.');
  }
}

// Get Weather Data for User's Location
function getLocationWeather() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchWeatherDataByCoordinates(lat, lon);
    });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
}

async function fetchWeatherDataByCoordinates(lat, lon) {
  try {
    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`);
    const weatherData = await weatherRes.json();
    const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${unit}&appid=${apiKey}`);
    const forecastData = await forecastRes.json();

    displayCurrentWeather(weatherData);
    displayForecast(forecastData);
  } catch (error) {
    alert('Failed to fetch weather data.');
  }
}

// Display Current Weather Data
function displayCurrentWeather(data) {
  currentWeatherDiv.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
    <div class="temperature">${Math.round(data.main.temp)}${unitSymbol}</div>
    <p>${data.weather[0].description}</p>
    <div class="details">
      <div>Humidity: ${data.main.humidity}%</div>
      <div>Wind Speed: ${data.wind.speed} ${unit === 'metric' ? 'm/s' : 'mph'}</div>
    </div>
  `;
}

// Display 5-Day Forecast
function displayForecast(data) {
  forecastDiv.innerHTML = '';
  const dailyData = {};

  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!dailyData[date]) {
      dailyData[date] = [];
    }
    dailyData[date].push(item);
  });

  Object.keys(dailyData).slice(0, 5).forEach(date => {
    const dayData = dailyData[date];
    const temps = dayData.map(item => item.main.temp);
    const highTemp = Math.max(...temps);
    const lowTemp = Math.min(...temps);
    const weatherCondition = dayData[0].weather[0];

    const dayDiv = document.createElement('div');
    dayDiv.className = 'forecast-day';
    dayDiv.innerHTML = `
      <p>${new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</p>
      <img src="https://openweathermap.org/img/wn/${weatherCondition.icon}.png" alt="${weatherCondition.description}">
      <p>${weatherCondition.description}</p>
      <p>High: ${Math.round(highTemp)}${unitSymbol}</p>
      <p>Low: ${Math.round(lowTemp)}${unitSymbol}</p>
    `;
    forecastDiv.appendChild(dayDiv);
  });
}

// Toggle Unit
function toggleUnit() {
  unit = unitToggle.checked ? 'imperial' : 'metric';
  unitSymbol = unitToggle.checked ? '°F' : '°C';
  unitLabel.textContent = unitToggle.checked ? 'Fahrenheit' : 'Celsius';
  fetchWeatherData(cityInput.value);
}
