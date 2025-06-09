const apiKey = "0566e9b42ef0a44599e6d04310f19145";

const searchBtn = document.getElementById("searchBtn");
const cityInput = document.getElementById("cityInput");
const weatherDisplay = document.getElementById("weatherDisplay");
const recentCitiesDropdown = document.getElementById("recentCities");
const currentLocBtn = document.getElementById("currentLocBtn");

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
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoordinates(latitude, longitude);
      },
      () => {
        alert("Failed to get your location. Please allow location access.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
});

function fetchWeatherByCity(city) {
  if (!city || city.trim() === "") {
    weatherDisplay.innerHTML = `<p class="text-red-500">Please enter a valid city name.</p>`;
    return;
  }

  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  fetch(apiUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error("City not found. Please enter a valid city.");
      }
      return response.json();
    })
    .then(data => {
      displayWeather(data);
      saveRecentCity(city);
      fetchExtendedForecast(city);
    })
    .catch(error => {
      weatherDisplay.innerHTML = `<p class="text-red-500">${error.message}</p>`;
      clearForecast();
    });
}

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
      saveRecentCity(data.name);
      fetchExtendedForecast(data.name);
    })
    .catch(error => {
      weatherDisplay.innerHTML = `<p class="text-red-500">${error.message}</p>`;
      clearForecast();
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

function saveRecentCity(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  cities = cities.filter(c => c.toLowerCase() !== city.toLowerCase()); // Remove duplicates
  cities.unshift(city); // Add to front
  if (cities.length > 5) cities = cities.slice(0, 5); // Keep max 5
  localStorage.setItem("recentCities", JSON.stringify(cities));
  updateDropdown();
}

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

function fetchExtendedForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to fetch forecast.");
      }
      return res.json();
    })
    .then(data => {
      displayForecast(data.list);
    })
    .catch(() => {
      document.getElementById("forecast").innerHTML = `<p class='text-red-500'>Failed to load forecast data</p>`;
    });
}

function displayForecast(forecastList) {
  const forecastContainer = document.getElementById("forecast");
  forecastContainer.innerHTML = "";

  // Filter forecast entries to 12:00 PM each day
  const dailyForecasts = forecastList.filter(entry => entry.dt_txt.includes("12:00:00"));

  dailyForecasts.forEach(day => {
    const date = new Date(day.dt_txt).toLocaleDateString("en-IN", {
      weekday: "short",
      month: "short",
      day: "numeric"
    });

    const icon = day.weather[0].icon;
    const description = day.weather[0].description;

    forecastContainer.innerHTML += `
      <div class="bg-white p-4 rounded-xl shadow text-center">
        <h3 class="font-semibold text-lg">${date}</h3>
        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" class="mx-auto" />
        <p class="capitalize">${description}</p>
        <p>🌡️ ${day.main.temp}°C</p>
        <p>💧 ${day.main.humidity}%</p>
        <p>💨 ${day.wind.speed} m/s</p>
      </div>
    `;
  });
}

function clearForecast() {
  document.getElementById("forecast").innerHTML = "";
}

// Load recent cities on page load
updateDropdown();
