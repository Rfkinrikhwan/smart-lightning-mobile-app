import { Alert } from 'react-native';

// Weather data interface
export interface WeatherData {
    temperature: string;
    condition: string;
    icon: string;
    date: string;
    humidity: number;
    windSpeed: number;
    location: string;
}

// OpenWeatherMap API key - you'll need to replace this with your own
const API_KEY = '95e6ab4c1f3f098248bec622424a9ae6'; // Replace with your API key
const CITY = 'Binjai,id'; // Binjai, Indonesia

// Function to fetch weather data
export const fetchWeatherData = async (): Promise<WeatherData> => {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error('Weather data fetch failed');
        }

        const data = await response.json();

        // Format the weather data
        const weatherData: WeatherData = {
            temperature: `${Math.round(data.main.temp)}° C`,
            condition: data.weather[0].main,
            icon: data.weather[0].icon,
            date: new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }),
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            location: `${data.name}, ${data.sys.country}`
        };

        return weatherData;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        // Return default weather data in case of error
        return {
            temperature: '28° C',
            condition: 'Sunny',
            icon: '01d',
            date: new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }),
            humidity: 70,
            windSpeed: 3.5,
            location: 'Binjai, ID'
        };
    }
};

// Function to get the appropriate FontAwesome5 icon name based on OpenWeatherMap icon code
export const getWeatherIcon = (iconCode: string): string => {
    // Map OpenWeatherMap icon codes to FontAwesome5 icon names
    const iconMap: Record<string, string> = {
        '01d': 'sun', // clear sky day
        '01n': 'moon', // clear sky night
        '02d': 'cloud-sun', // few clouds day
        '02n': 'cloud-moon', // few clouds night
        '03d': 'cloud', // scattered clouds
        '03n': 'cloud',
        '04d': 'cloud', // broken clouds
        '04n': 'cloud',
        '09d': 'cloud-rain', // shower rain
        '09n': 'cloud-rain',
        '10d': 'cloud-sun-rain', // rain day
        '10n': 'cloud-moon-rain', // rain night
        '11d': 'bolt', // thunderstorm
        '11n': 'bolt',
        '13d': 'snowflake', // snow
        '13n': 'snowflake',
        '50d': 'smog', // mist
        '50n': 'smog'
    };

    return iconMap[iconCode] || 'question-circle';
};

// Function to get color based on weather condition
export const getWeatherIconColor = (iconCode: string): string => {
    if (iconCode.startsWith('01') || iconCode.startsWith('02')) {
        return '#FFD700'; // Gold/Yellow for sunny/partly cloudy
    } else if (iconCode.startsWith('03') || iconCode.startsWith('04')) {
        return '#A9A9A9'; // Gray for cloudy
    } else if (iconCode.startsWith('09') || iconCode.startsWith('10')) {
        return '#4682B4'; // Steel Blue for rain
    } else if (iconCode.startsWith('11')) {
        return '#9370DB'; // Medium Purple for thunderstorm
    } else if (iconCode.startsWith('13')) {
        return '#87CEEB'; // Sky Blue for snow
    } else if (iconCode.startsWith('50')) {
        return '#B0C4DE'; // Light Steel Blue for mist
    }
    return '#FFD700'; // Default
};