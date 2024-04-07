const Api_key = '679775d86f144a925622c994b2360fec';
        const Weatherdiv = document.querySelector('.daily-forecast');
        const MainWeatherdiv = document.querySelector('.weather');

        const createWeatherCard = (weatheritem) => {
            return ` <div class="day">
                        <h2>${weatheritem.dt_txt.split(" ")[0]}</h2>
                        <img src="https://openweathermap.org/img/wn/${weatheritem.weather[0].icon}@2x.png" alt="">
                        <h4>Temp: ${(weatheritem.main.temp - 273.15).toFixed(2)}⁰C</h4>
                        <h4>Wind: ${weatheritem.wind.speed} M/S</h4>
                        <h4>Humidity : ${weatheritem.main.humidity}% </h4>
                    </div>`;
        }

        const createWeatherHTML = (cityName, temperature, icon, windSpeed, humidity) => {
            return `
                <div class="weather">
                    <h1>${cityName}</h1>
                    <h2>${temperature}⁰</h2>
                    <div class="weather-icon">
                        <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="">
                    </div>
                    <div class="det">
                        <h4>Wind: ${windSpeed} M/S</h4>
                        <h4>Humidity: ${humidity}%</h4>
                    </div>
                </div>`;
        };

        document.querySelector('.search-btn').addEventListener('click', function() {
            // Get the value entered by the user
            var city = document.getElementById('city').value.trim();
            if (!city) return; // Do nothing if the input is empty

            const codingapi = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${Api_key}`;

            fetch(codingapi)
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    if (!data.coord) return alert(`No Coordinates found for ${city}`);
                    const { name, coord: { lat, lon } } = data;
                    getWeatherdetails(name, lat, lon);
                    displayCurrentWeather(data);
                })
                .catch(() => {
                    alert(`An error occurred while fetching the data`);
                });
        });

        const getWeatherdetails = (city, lat, lon) => {
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${Api_key}`;

            // Clear previous weather data
            Weatherdiv.innerHTML = '';

            fetch(forecastUrl)
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    // Get one forecast per day starting from tomorrow
                    const currentDate = new Date();
                    currentDate.setDate(currentDate.getDate() + 1); // Set to tomorrow

                    const forecastdays = [];
                    const sevenforecast = data.list.filter(forecast => {
                        const forecastDate = new Date(forecast.dt_txt);
                        const forecastDay = forecastDate.getDate();
                        
                        if (
                            forecastDate >= currentDate && // Filter from tomorrow
                            !forecastdays.includes(forecastDay) && 
                            forecastdays.length < 8 // Get next 6 days forecast
                        ) {
                            forecastdays.push(forecastDay);
                            return true;
                        }
                        return false;
                    });

                    console.log(sevenforecast);
                    sevenforecast.forEach(weatheritem => {
                        Weatherdiv.insertAdjacentHTML("beforeend", createWeatherCard(weatheritem));
                    });
                })
                .catch(() => {
                    alert(`An error occurred while fetching the forecast`);
                });
        };

        const displayCurrentWeather = (weatherData) => {
            const cityName = weatherData.name;
            const temperature = (weatherData.main.temp - 273.15).toFixed(0); // Convert temperature to Celsius
            const icon = weatherData.weather[0].icon;
            const windSpeed = weatherData.wind.speed;
            const humidity = weatherData.main.humidity;

            MainWeatherdiv.innerHTML = createWeatherHTML(cityName, temperature, icon, windSpeed, humidity);
        };

        document.addEventListener('DOMContentLoaded', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(position => {
                    const { latitude, longitude } = position.coords;
                    getWeatherByCoordinates(latitude, longitude);
                }, error => {
                    console.error('Error getting user location:', error);
                });
            } else {
                console.error('Geolocation is not supported by this browser');
            }
        });

        const getWeatherByCoordinates = (latitude, longitude) => {
            const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${Api_key}`;

            fetch(weatherApiUrl)
                .then(response => response.json())
                .then(data => {
                    if (data.cod !== 200) {
                        throw new Error(data.message);
                    }

                    displayCurrentWeather(data);
                    getWeatherdetails(data.name, latitude, longitude);
                })
                .catch(error => {
                    console.error('Error fetching current weather:', error);
                });
        };

