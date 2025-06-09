const apiKey = "0566e9b42ef0a44599e6d04310f19145";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherDisplay = document.getElementById("weatherDisplay");
const recentCitiesDropdown = document.getElementById("recentCities");
const currentLocBtn = document.getElementById("currentLocBtn");
const forecastContainer = document.getElementById("forecast");

// Event listeners
searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (!city) {
    alert("Please enter a city name");
    return;
  }
  fetchWeatherByCity(city);
});

recentCitiesDropdown.addEventListener("change", () => {
  const city = recentCitiesDropdown.value;
  if (city) {
    cityInput.value = city;
    fetchWeatherByCity(city);
  }
});

currentLocBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords;
      fetchWeatherByCoordinates(latitude, longitude);
    },
    () => {
      alert("Location access denied.");
    }
  );
});

function fetchWeatherByCity(city) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}&units=metric`;

  fetch(weatherUrl)
    .then(res => {
      if (!res.ok) throw new Error("City not found");
      return res.json();
    })
    .then(data => {
      displayWeather(data);
      saveRecentCity(data.name);
      fetchExtendedForecast(data.name);
    })
    .catch(err => {
      weatherDisplay.innerHTML = `<p class="text-red-600">${err.message}</p>`;
      forecastContainer.innerHTML = "";
    });
}

function fetchWeatherByCoordinates(lat, lon) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(weatherUrl)
    .then(res => {
      if (!res.ok) throw new Error("Could not fetch weather for your location");
      return res.json();
    })
    .then(data => {
      displayWeather(data);
      saveRecentCity(data.name);
      fetchExtendedForecast(data.name);
    })
    .catch(err => {
      weatherDisplay.innerHTML = `<p class="text-red-600">${err.message}</p>`;
      forecastContainer.innerHTML = "";
    });
}

function displayWeather(data) {
  const { name, main, weather, wind } = data;

  weatherDisplay.innerHTML = `
    <h2 class="text-2xl font-bold mb-2">${name}</h2>
    <img
      src="https://openweathermap.org/img/wn/${weather[0].icon}@2x.png"
      alt="${weather[0].description}"
      class="mx-auto"
    />
    <p class="capitalize text-lg">${weather[0].main} - ${weather[0].description}</p>
    <p>🌡️ Temperature: ${main.temp} °C</p>
    <p>💧 Humidity: ${main.humidity}%</p>
    <p>💨 Wind Speed: ${wind.speed} m/s</p>
  `;
}

function fetchExtendedForecast(city) {
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(
    city
  )}&appid=${apiKey}&units=metric`;

  fetch(forecastUrl)
    .then(res => {
      if (!res.ok) throw new Error("Failed to load extended forecast");
      return res.json();
    })
    .then(data => {
      displayForecast(data.list);
    })
    .catch(() => {
      forecastContainer.innerHTML =
        "<p class='text-red-600'>Failed to load extended forecast.</p>";
    });
}

function displayForecast(forecastList) {
  forecastContainer.innerHTML = "";

  // Filter forecasts for 12:00:00 (noon) each day for clarity
  const dailyForecasts = forecastList.filter(forecast =>
    forecast.dt_txt.includes("12:00:00")
  );

  dailyForecasts.forEach(day => {
    const date = new Date(day.dt_txt).toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });

    forecastContainer.innerHTML += `
      <div class="bg-blue-50 rounded-lg p-4 shadow text-center">
        <h3 class="font-semibold">${date}</h3>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}" class="mx-auto"/>
        <p class="capitalize">${day.weather[0].description}</p>
        <p>🌡️ ${day.main.temp} °C</p>
        <p>💧 ${day.main.humidity}%</p>
        <p>💨 ${day.wind.speed} m/s</p>
      </div>
    `;
  });
}

function saveRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  // Avoid duplicates (case insensitive)
  cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase());
  cities.unshift(city);

  // Limit to 5 recent cities
  if (cities.length > 5) cities = cities.slice(0, 5);

  localStorage.setItem("recentCities", JSON.stringify(cities));
  updateDropdown();
}

function updateDropdown() {
  const cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  recentCitiesDropdown.innerHTML = '<option value="">Recently Searched Cities</option>';

  cities.forEach(city => {
    const option = document.createElement("option");
    option.value = city;
    option.textContent = city;
    recentCitiesDropdown.appendChild(option);
  });
}

// Initialize dropdown on page load
updateDropdown();
