const apiKey = "a2793fdf0307d9f138ab041dea5cf5ea"; // Replace with your real API key

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherDisplay = document.getElementById("weatherDisplay");

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city name");
    return;
  }

  fetchWeatherByCity(city);
});

function fetchWeatherByCity(city) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error("City not found");
      }
      return response.json();
    })
    .then(data => {
        saveRecentCity(city);
      displayWeather(data);
    })
    .catch(error => {
      weatherDisplay.innerHTML = `<p class="text-red-500">${error.message}</p>`;
    });
}

function displayWeather(data) {
  const { name, main, weather, wind } = data;
  weatherDisplay.innerHTML = `
    <h2 class="text-xl font-semibold">${name}</h2>
    <p>${weather[0].main} - ${weather[0].description}</p>
    <p>🌡️ Temp: ${main.temp}°C</p>
    <p>💧 Humidity: ${main.humidity}%</p>
    <p>💨 Wind: ${wind.speed} m/s</p>
  `;
}

const currentLocBtn = document.getElementById("currentLocBtn");

const recentCitiesDropdown = document.getElementById("recentCities");

// Save city to localStorage
function saveRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase()); // Remove duplicate
  cities.unshift(city); // Add to start
  if (cities.length > 5) cities = cities.slice(0, 5); // Max 5 entries
  localStorage.setItem("recentCities", JSON.stringify(cities));
  updateDropdown();
}

// Load cities into dropdown
function updateDropdown() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  recentCitiesDropdown.innerHTML = `<option value="">Recently Searched Cities</option>`;
  cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentCitiesDropdown.appendChild(option);
  });
}

// On dropdown change → fetch weather
recentCitiesDropdown.addEventListener("change", () => {
  const city = recentCitiesDropdown.value;
  if (city) {
    cityInput.value = city;
    fetchWeatherByCity(city);
  }
});


currentLocBtn.addEventListener("click", () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoordinates(latitude, longitude);
      },
      error => {
        alert("Failed to get your location. Please allow location access.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

function fetchWeatherByCoordinates(lat, lon) {
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error("Failed to fetch weather for your location.");
      }
      return response.json();
    })
    .then(data => {
      displayWeather(data);
    })
    .catch(error => {
      weatherDisplay.innerHTML = `<p class="text-red-500">${error.message}</p>`;
    });
}

updateDropdown(); // Load on page load
