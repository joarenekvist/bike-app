//Weather API Meteo file
export async function getWeather(latitude, longitude) {

    const params = new URLSearchParams({
        latitude,
        longitude,
        hourly: [
            "precipitation",
            "precipitation_probability",
            "temperature_2m",
            "relative_humidity_2m"
        ],
        past_days: 1,
        forecast_days: 3,
        timezone: "Europe/Stockholm"
    });

        const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
        const response = await fetch(url);
        const data = await response.json();

    
    const weatherData = {
        time: data.hourly.time.map((t) => new Date(t)),
        temperature2m: data.hourly.temperature_2m,
        precipitation: data.hourly.precipitation,
        precipitationProbability: data.hourly.precipitation_probability,
        relativeHumidity2m: data.hourly.relative_humidity_2m

    };

    return weatherData;
}