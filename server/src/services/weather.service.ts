import axios from 'axios';

export async function getWeatherData(lat: number, lng: number) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
        const response = await axios.get(url);
        const data = response.data;
        
        const current = {
            temperature: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            rainfall: data.current.precipitation || 0,
            windSpeed: data.current.wind_speed_10m,
            weatherCode: data.current.weather_code
        };
        
        const forecast = [];
        if (data.daily && data.daily.time) {
            for (let i = 0; i < Math.min(7, data.daily.time.length); i++) {
                forecast.push({
                    date: data.daily.time[i],
                    tempMax: data.daily.temperature_2m_max[i],
                    tempMin: data.daily.temperature_2m_min[i],
                    precipitation: data.daily.precipitation_sum[i],
                    weatherCode: data.daily.weather_code[i]
                });
            }
        }

        return {
            current,
            forecast,
            source: "open-meteo",
            fetchedAt: new Date().toISOString()
        };
    } catch (error) {
        console.error("Weather service error:", error);
        return {
            current: { temperature: 0, humidity: 0, rainfall: 0, windSpeed: 0, weatherCode: 0 },
            forecast: [],
            source: "unavailable",
            degraded: true,
            fetchedAt: new Date().toISOString()
        };
    }
}
