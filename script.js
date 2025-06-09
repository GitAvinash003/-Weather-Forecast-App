const apiKey = "4fec1da50fa94e728ad174031250906";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherDisplay = document.getElementById("weatherDisplay");
const forecastDisplay = document.getElementById("forecast");
const recentCitiesDropdown = document.getElementById("recentCities");
const currentLocBtn = document.getElementById("currentLocBtn");

// Search by city button click
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city name");
    return;
  }
  fetchWeatherByCity(city);
});

// Recent cities dropdown change
recentCitiesDropdown.addEventListener("change", () => {
  const city = recentCitiesDropdown.value;
  if (city) {
    cityInput.value = city;
    fetchWeatherByCity(city);
  }
});

// Current location button click
currentLocBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by this browser.");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      fetchWeatherByCoords(latitude, longitude);
    },
    (error) => {
      alert("Failed to get your location. Please allow location access.");
    }
  );
});

// Fetch weather by city name
function fetchWeatherByCity(city) {
  clearDisplays();
  const currentWeatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=no`;
  const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=5&aqi=no&alerts=no`;

  fetch(currentWeatherUrl)
    .then((res) => {
      if (!res.ok) throw new Error("City not found. Please enter a valid city.");
      return res.json();
    })
    .then((currentData) => {
      displayCurrentWeather(currentData);
      saveRecentCity(currentData.location.name);
      return fetch(forecastUrl);
    })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch forecast.");
      return res.json();
    })
    .then((forecastData) => {
      displayForecast(forecastData.forecast.forecastday);
    })
    .catch((err) => {
      weatherDisplay.innerHTML = `<p class="text-red-500">${err.message}</p>`;
      forecastDisplay.innerHTML = "";
    });
}

// Fetch weather by coordinates (lat, lon)
function fetchWeatherByCoords(lat, lon) {
  clearDisplays();
  const query = `${lat},${lon}`;
  const currentWeatherUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}&aqi=no`;
  const forecastUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${query}&days=5&aqi=no&alerts=no`;

  fetch(currentWeatherUrl)
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch weather for your location.");
      return res.json();
    })
    .then((currentData) => {
      displayCurrentWeather(currentData);
      saveRecentCity(currentData.location.name);
      return fetch(forecastUrl);
    })
    .then((res) => {
      if (!res.ok) throw new Error("Failed to fetch forecast.");
      return res.json();
    })
    .then((forecastData) => {
      displayForecast(forecastData.forecast.forecastday);
    })
    .catch((err) => {
      weatherDisplay.innerHTML = `<p class="text-red-500">${err.message}</p>`;
      forecastDisplay.innerHTML = "";
    });
}

// Display current weather info
function displayCurrentWeather(data) {
  const { location, current } = data;
  weatherDisplay.innerHTML = `
    <h2 class="text-xl font-semibold">${location.name}, ${location.country}</h2>
    <p class="capitalize">${current.condition.text}</p>
    <img src="https:${current.condition.icon}" alt="${current.condition.text}" class="mx-auto" />
    <p>🌡️ Temp: ${current.temp_c}°C</p>
    <p>💧 Humidity: ${current.humidity}%</p>
    <p>💨 Wind: ${current.wind_kph} kph (${current.wind_dir})</p>
  `;
}

// Display 5-day forecast
function displayForecast(forecastDays) {
  forecastDisplay.innerHTML = "";

  forecastDays.forEach((day) => {
    const date = new Date(day.date).toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

    forecastDisplay.innerHTML += `
      <div class="bg-white p-4 rounded-xl shadow text-center">
        <h3 class="font-semibold text-lg">${date}</h3>
        <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" class="mx-auto" />
        <p class="capitalize">${day.day.condition.text}</p>
        <p>🌡️ Max: ${day.day.maxtemp_c}°C / Min: ${day.day.mintemp_c}°C</p>
        <p>💧 Humidity: ${day.day.avghumidity}%</p>
        <p>💨 Max Wind: ${day.day.maxwind_kph} kph</p>
      </div>
    `;
  });
}

// Save city in localStorage and update dropdown
function saveRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  // Remove duplicate city (case insensitive)
  cities = cities.filter((c) => c.toLowerCase() !== city.toLowerCase());
  cities.unshift(city);
  if (cities.length > 5) cities = cities.slice(0, 5);
  localStorage.setItem("recentCities", JSON.stringify(cities));
  updateDropdown();
}

// Load recent cities dropdown from localStorage
function updateDropdown() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  recentCitiesDropdown.innerHTML = `<option value="">Recently Searched Cities</option>`;
  cities.forEach((city) => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentCitiesDropdown.appendChild(option);
  });
}

// Clear weather and forecast display areas before new fetch
function clearDisplays() {
  weatherDisplay.innerHTML = "";
  forecastDisplay.innerHTML = "";
}

// Load dropdown on page load
updateDropdown();
