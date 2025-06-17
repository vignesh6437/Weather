import React, { useState, useEffect } from 'react';
import './App.css';

const WEATHER_API_KEY = '14951c93f3d11e8ac8bed96dd90e8bc7';
const GEO_API_KEY = 'b54e70dd68msh9c92b7fde52c42ep1746b7jsna0944e93ab37';

const App = () => {
    const [city, setCity] = useState('');
    const [searchedCity, setSearchedCity] = useState(''); 
    const [temperature, setTemperature] = useState(null);
    const [weather, setWeather] = useState('');
    const [icon, setIcon] = useState('');
    const [humidity, setHumidity] = useState(null);
    const [windSpeed, setWindSpeed] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [shouldFetchSuggestions, setShouldFetchSuggestions] = useState(true);

    const searchTemperature = () => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                setTemperature(data.main.temp);
                setWeather(data.weather[0].main);
                setIcon(data.weather[0].icon);
                setHumidity(data.main.humidity);
                setWindSpeed(data.wind.speed);
                setSearchedCity(city); 
                setSuggestions([]);
            })
            .catch(err => console.log(err));
    };

    const clearWeather = () => {
        setCity('');
        setSearchedCity('');
        setTemperature(null);
        setWeather('');
        setIcon('');
        setHumidity(null);
        setWindSpeed(null);
        setSuggestions([]);
    };

    const fetchSuggestions = (query) => {
        if (!query) {
            setSuggestions([]);
            return;
        }

        fetch(`https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${query}&countryIds=IN&adminDivisionCode=TN`, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': GEO_API_KEY,
                'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com'
            }
        })
            .then(response => response.json())
            .then(data => {
                const cityNames = data.data.map(city => city.name);
                setSuggestions(cityNames);
            })
            .catch(error => console.error('Error fetching suggestions:', error));
    };

    const getBackgroundImage = (weatherType) => {
        switch (weatherType.toLowerCase()) {
            case 'clear':
                return 'https://images.unsplash.com/photo-1743738049682-6b781700d63d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
            case 'clouds':
                return 'https://c1.wallpaperflare.com/preview/706/939/769/clouds-outdoors-sky.jpg';
            case 'rain':
                return 'https://www.wkbn.com/wp-content/uploads/sites/48/2022/06/storm-storming-dark-clouds-rain-weather-generic.jpg';
            case 'thunderstorm':
                return 'https://images.unsplash.com/photo-1500674425229-f692875b0ab7?auto=format&fit=crop&w=1950&q=80';
            case 'drizzle':
                return 'https://images.unsplash.com/photo-1523531294911-8fc5c7a09e1f?auto=format&fit=crop&w=1950&q=80';
            case 'snow':
                return 'https://images.unsplash.com/photo-1542224566-1ec523f2f550?auto=format&fit=crop&w=1950&q=80';
            case 'mist':
            case 'haze':
            case 'fog':
                return 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1950&q=80';
            default:
                return 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1950&q=80';
        }
    };

    useEffect(() => {
        if (!shouldFetchSuggestions) {
            setShouldFetchSuggestions(true);
            return;
        }

        const delayDebounce = setTimeout(() => {
            fetchSuggestions(city);
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [city]);

    const handleSuggestionClick = (suggestion) => {
        setShouldFetchSuggestions(false);
        setCity(suggestion);
        setSuggestions([]);
    };

    useEffect(() => {
        const background = weather ? getBackgroundImage(weather) : getBackgroundImage('default');
        document.body.style.backgroundImage = `url(${background})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.transition = 'background-image 0.5s ease-in-out';
    }, [weather]);

    return (
        <div className="weather-container">
            <h1 className="title">☁️ Weather App</h1>
            <div className="input-group">
                <input
                    type="text"
                    className="input-box"
                    placeholder="Enter Tamil Nadu city name"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                />
                {suggestions.length > 0 && (
                    <ul className="suggestions-list">
                        {suggestions.map((suggestion, index) => (
                            <li
                                key={index}
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
                <div className="button-group">
                    <button
                        onClick={searchTemperature}
                        className="weather-button"
                    >
                        Get Weather
                    </button>
                    <button
                        onClick={clearWeather}
                        className="weather-button clear-button"
                    >
                        Clear
                    </button>
                </div>
            </div>
            {temperature && weather && icon && (
                <div className="weather-card">
                    <img
                        src={`http://openweathermap.org/img/wn/${icon}@2x.png`}
                        alt="Weather Icon"
                        className="weather-icon"
                    />
                    <h2 className="city-name">{searchedCity}</h2> 
                    <p className="weather-info">🌡 Temperature: {temperature}&deg;C</p>
                    <p className="weather-info">🌤 Weather: {weather}</p>
                    <p className="weather-info">💧 Humidity: {humidity}%</p>
                    <p className="weather-info">💨 Wind Speed: {windSpeed} km/h</p>
                </div>
            )}
        </div>
    );
};

export default App;
