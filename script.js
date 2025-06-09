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
