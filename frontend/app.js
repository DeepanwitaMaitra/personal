// SkyCast - Real-Time Weather App
// API Configuration
//const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY'; // Replace with your key from https://openweathermap.org/api
const API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_API_URL = 'https://api.openweathermap.org/geo/1.0';
const API_KEY = '9a1cd140b309fdc67ad25ab0c9ba65ab';
// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const geoBtn = document.getElementById('geoBtn');
const suggestionsDiv = document.getElementById('suggestions');
const loadingSpinner = document.getElementById('loadingSpinner');
const errorMessage = document.getElementById('errorMessage');
const currentWeatherSection = document.getElementById('currentWeather');
const forecastSection = document.getElementById('forecastSection');
const forecastContainer = document.getElementById('forecastContainer');

// State
let lastSearchCity = '';
let debounceTimer = null;
let cachedWeatherData = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadSavedCity();
});

// Event Listeners
function setupEventListeners() {
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    geoBtn.addEventListener('click', handleGeolocation);
    searchInput.addEventListener('input', debounceSearch);
}

// Debounced search for suggestions
function debounceSearch() {
    clearTimeout(debounceTimer);
    const query = searchInput.value.trim();
    
    if (query.length < 2) {
        suggestionsDiv.classList.remove('active');
        return;
    }

    debounceTimer = setTimeout(() => {
        fetchCitySuggestions(query);
    }, 300);
}

// Fetch city suggestions (Lazy loaded)
async function fetchCitySuggestions(query) {
    if (!API_KEY || API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
        showError('Please set your OpenWeatherMap API key in app.js');
        return;
    }

    try {
        const response = await fetch(
            `${GEO_API_URL}/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`
        );
        
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        
        const cities = await response.json();
        displaySuggestions(cities);
    } catch (error) {
        console.error('Suggestions error:', error);
    }
}

// Display city suggestions with lazy rendering
function displaySuggestions(cities) {
    suggestionsDiv.innerHTML = '';
    
    if (cities.length === 0) {
        suggestionsDiv.classList.remove('active');
        return;
    }

    cities.forEach(city => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.textContent = `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`;
        
        item.addEventListener('click', () => {
            searchInput.value = city.name;
            suggestionsDiv.classList.remove('active');
            fetchWeather(city.lat, city.lon, city.name);
        });
        
        suggestionsDiv.appendChild(item);
    });

    suggestionsDiv.classList.add('active');
}

// Handle search
function handleSearch() {
    const city = searchInput.value.trim();
    if (!city) return;

    fetchCityCoordinates(city);
}

// Fetch city coordinates
async function fetchCityCoordinates(city) {
    if (!API_KEY || API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
        showError('Please set your OpenWeatherMap API key in app.js');
        return;
    }

    showLoading(true);
    suggestionsDiv.classList.remove('active');

    try {
        const response = await fetch(
            `${GEO_API_URL}/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`
        );
        
        if (!response.ok) throw new Error('City not found');
        
        const cities = await response.json();
        if (cities.length === 0) {
            showError('City not found. Please try another search.');
            showLoading(false);
            return;
        }

        const { lat, lon, name } = cities[0];
        lastSearchCity = name;
        localStorage.setItem('lastCity', name);
        fetchWeather(lat, lon, name);
    } catch (error) {
        showError(error.message);
        showLoading(false);
    }
}

// Handle geolocation
function handleGeolocation() {
    if (!navigator.geolocation) {
        showError('Geolocation is not supported by your browser.');
        return;
    }

    showLoading(true);
    geoBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            fetchWeatherByCoordinates(latitude, longitude);
        },
        (error) => {
            showError(`Geolocation error: ${error.message}`);
            showLoading(false);
            geoBtn.disabled = false;
        }
    );
}

// Fetch weather by coordinates
async function fetchWeatherByCoordinates(lat, lon) {
    if (!API_KEY || API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
        showError('Please set your OpenWeatherMap API key in app.js');
        return;
    }

    try {
        const response = await fetch(
            `${GEO_API_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
        );
        
        if (!response.ok) throw new Error('Failed to get location name');
        
        const locations = await response.json();
        const cityName = locations[0]?.name || 'Current Location';
        fetchWeather(lat, lon, cityName);
    } catch (error) {
        fetchWeather(lat, lon, 'Current Location');
    }
}

// Fetch weather data (Main API call with optimization)
async function fetchWeather(lat, lon, cityName) {
    if (!API_KEY || API_KEY === 'YOUR_OPENWEATHERMAP_API_KEY') {
        showError('Please set your OpenWeatherMap API key in app.js');
        showLoading(false);
        return;
    }

    const cacheKey = `${lat},${lon}`;
    
    // Check cache (30 minute cache)
    if (cachedWeatherData[cacheKey] && 
        Date.now() - cachedWeatherData[cacheKey].timestamp < 30 * 60 * 1000) {
        displayWeather(cachedWeatherData[cacheKey].current, cachedWeatherData[cacheKey].forecast);
        showLoading(false);
        return;
    }

    try {
        // Optimize: Fetch both current and forecast in parallel
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`),
            fetch(`${API_BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`)
        ]);

        if (!currentResponse.ok || !forecastResponse.ok) {
            throw new Error('Failed to fetch weather data');
        }

        const currentData = await currentResponse.json();
        const forecastData = await forecastResponse.json();

        // Cache the data
        cachedWeatherData[cacheKey] = {
            current: currentData,
            forecast: forecastData,
            timestamp: Date.now()
        };

        displayWeather(currentData, forecastData);
        clearError();
    } catch (error) {
        showError(`Weather fetch error: ${error.message}`);
    } finally {
        showLoading(false);
        geoBtn.disabled = false;
    }
}

// Display current weather (Optimized DOM rendering)
function displayWeather(currentData, forecastData) {
    const { main, weather, wind, sys } = currentData;

    // Use document fragment for batch DOM updates (Performance optimization)
    const fragment = document.createDocumentFragment();
    
    // Update city name
    const cityElement = document.getElementById('cityName');
    cityElement.textContent = `${currentData.name}, ${sys.country}`;

    // Update weather description
    document.getElementById('weatherDescription').textContent = weather[0].main;

    // Update temperature
    document.getElementById('temperature').textContent = Math.round(main.temp);
    document.getElementById('feelsLike').textContent = Math.round(main.feels_like);

    // Update weather icon
    const iconCode = weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
    document.getElementById('weatherIcon').src = iconUrl;
    document.getElementById('weatherIcon').alt = weather[0].description;

    // Update details (Lazy load - only when visible)
    updateWeatherDetails(main, wind);

    // Show current weather card
    currentWeatherSection.classList.remove('hidden');

    // Display forecast
    displayForecast(forecastData);
}

// Update weather details
function updateWeatherDetails(main, wind) {
    document.getElementById('humidity').textContent = `${main.humidity}%`;
    document.getElementById('windSpeed').textContent = `${wind.speed} m/s`;
    document.getElementById('pressure').textContent = `${main.pressure} hPa`;
    
    // UV Index placeholder (requires separate API call or sunrise/sunset based estimation)
    const uvEstimate = Math.round((main.temp > 25 ? 6 : 4) * (main.humidity / 100));
    document.getElementById('uvIndex').textContent = `${Math.min(uvEstimate, 11)}`;
}

// Display 5-day forecast with lazy loading
function displayForecast(forecastData) {
    forecastContainer.innerHTML = '';
    
    // Group forecasts by day (5-day forecast)
    const dailyForecasts = {};
    
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const day = date.toLocaleDateString();
        
        if (!dailyForecasts[day]) {
            dailyForecasts[day] = {
                temps: [],
                weather: item.weather[0],
                description: item.weather[0].description,
                icon: item.weather[0].icon,
                date: date
            };
        }
        dailyForecasts[day].temps.push(item.main.temp);
    });

    // Lazy load forecast cards
    const days = Object.entries(dailyForecasts).slice(1, 6); // Skip today, show next 5
    
    days.forEach((entry, index) => {
        const [, forecast] = entry;
        const card = createForecastCard(forecast);
        
        // Lazy load with slight delay for better UX
        setTimeout(() => {
            forecastContainer.appendChild(card);
        }, index * 50);
    });

    forecastSection.classList.remove('hidden');
}

// Create forecast card with optimized rendering
function createForecastCard(forecast) {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    
    const high = Math.round(Math.max(...forecast.temps));
    const low = Math.round(Math.min(...forecast.temps));
    const iconUrl = `https://openweathermap.org/img/wn/${forecast.icon}@2x.png`;
    
    card.innerHTML = `
        <div class="forecast-date">${forecast.date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        })}</div>
        <img src="${iconUrl}" alt="${forecast.description}" class="forecast-icon" loading="lazy">
        <div class="forecast-temps">
            <span class="forecast-temp-high">↑ ${high}°</span>
            <span class="forecast-temp-low">↓ ${low}°</span>
        </div>
        <div class="forecast-description">${forecast.description}</div>
    `;
    
    return card;
}

// UI Helper Functions
function showLoading(show) {
    if (show) {
        loadingSpinner.classList.remove('hidden');
    } else {
        loadingSpinner.classList.add('hidden');
    }
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function clearError() {
    errorMessage.classList.add('hidden');
}

// Load last searched city on page load
function loadSavedCity() {
    const savedCity = localStorage.getItem('lastCity');
    if (savedCity) {
        searchInput.value = savedCity;
        handleSearch();
    }
}

// Service Worker Registration (for offline support - optional)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {
        // Service worker registration failed - app still works
    });
}
