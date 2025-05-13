class WeatherApp {
  constructor() {
    this.API_KEY = '2fb5ede99113457f98955710251305';
    this.BASE_URL = `https://api.weatherapi.com/v1/current.json?key=${this.API_KEY}&q=`;

    this.elements = {
      form: document.getElementById('weatherForm'),
      input: document.getElementById('cityInput'),
      cityName: document.getElementById('cityName'),
      countryFlag: document.getElementById('countryFlag'),
      weatherIcon: document.getElementById('weatherIcon'),
      temperatureValue: document.getElementById('temperatureValue'),
      weatherDescription: document.getElementById('weatherDescription'),
      humidityValue: document.getElementById('humidityValue'),
      pressureValue: document.getElementById('pressureValue'),
      windValue: document.getElementById('windValue'),
      main: document.querySelector('main')
    };

    this.init();
  }

  init() {
    this.elements.form.addEventListener('submit', this.handleSubmit.bind(this));
    this.loadLastCityOrGeolocate();
  }

  loadLastCityOrGeolocate() {
    const savedCity = localStorage.getItem('lastCity');
    if (savedCity) {
      this.fetchWeather(savedCity);
    } else {
      this.getUserLocation();
    }
  }

  getUserLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.fetchWeather(`${position.coords.latitude},${position.coords.longitude}`);
        },
        () => {
          this.fetchWeather('São Paulo');
        }
      );
    } else {
      this.fetchWeather('São Paulo');
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    const city = this.elements.input.value.trim();
    if (city) {
      this.fetchWeather(city);
    } else {
      this.showError('Please enter a city');
    }
    this.elements.input.value = '';
  }

  async fetchWeather(location) {
    try {
      this.showLoader(true);
      const response = await fetch(`${this.BASE_URL}${encodeURIComponent(location)}&aqi=no`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'City not found');
      }

      this.updateUI(data);
      localStorage.setItem('lastCity', data.location.name);
    } catch (error) {
      console.error('API Error:', error);
      this.showError(error.message || 'Error fetching weather data');
    } finally {
      this.showLoader(false);
    }
  }

  updateUI(data) {
    const { location, current } = data;

    let cityName = location.name;
    if (cityName.toLowerCase() === 'san paulo') {
      cityName = 'São Paulo';
    }
    this.elements.cityName.textContent = cityName;

    const countryCode = this.getCountryCode(location.country);
    this.elements.countryFlag.src = `https://flagcdn.com/32x24/${countryCode}.png`;
    this.elements.countryFlag.alt = `Flag of ${location.country}`;

    this.elements.weatherIcon.src = `https:${current.condition.icon.replace('64x64', '128x128')}`;
    this.elements.weatherIcon.alt = current.condition.text;

    this.elements.temperatureValue.textContent = Math.round(current.temp_c);

    this.elements.weatherDescription.textContent = this.translateCondition(current.condition.text);

    this.elements.humidityValue.textContent = Math.round(current.humidity);
    this.elements.pressureValue.textContent = current.pressure_mb;
    this.elements.windValue.textContent = `${Math.round(current.wind_kph)}`;
  }

  getCountryCode(countryName) {
    const countries = {
      Brazil: 'br',
      Argentina: 'ar',
      Germany: 'de',
      France: 'fr',
      Italy: 'it',
      Spain: 'es',
      Portugal: 'pt',
      USA: 'us',
      Canada: 'ca',
      Mexico: 'mx',
      UnitedKingdom: 'gb',
      Australia: 'au',
      Japan: 'jp',
      SouthKorea: 'kr',
      China: 'cn',
      India: 'in',
      Russia: 'ru',
      Netherlands: 'nl',
      Sweden: 'se',
      Switzerland: 'ch'
    };
    return countries[countryName] || 'us';
  }

  translateCondition(text) {
    const conditions = {
      "Clear": "Clear sky",
      "Partly cloudy": "Partly cloudy",
      "Cloudy": "Cloudy",
      "Overcast": "Overcast",
      "Sunny": "Sunny",
      "Mist": "Mist",
      "Patchy rain possible": "Light rain possible",
      "Light rain": "Light rain",
      "Heavy rain": "Heavy rain",
      "Thunderstorm": "Thunderstorm"
    };
    return conditions[text] || text;
  }

  showLoader(show) {
    if (show) {
      const loader = document.createElement('div');
      loader.className = 'loader';
      this.elements.main.appendChild(loader);
    } else {
      const loader = this.elements.main.querySelector('.loader');
      if (loader) loader.remove();
    }
  }

  showError(message) {
    const existingError = this.elements.main.querySelector('.error-message');
    if (existingError) existingError.remove();

    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    this.elements.main.appendChild(errorElement);

    this.elements.main.classList.add('error');
    setTimeout(() => {
      this.elements.main.classList.remove('error');
      errorElement.remove();
    }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => new WeatherApp());
