<!--Weather widget on dashboard/>  -->

<template>
    <v-card class="weather-card" outlined>
        <v-card-title>🌤️ Weather</v-card-title>
        <v-card-text v-if="weather">
            <div><strong>Location:</strong> Stockholm</div>
            <div><strong>Temperature: </strong>{{ currentTemp }} °C</div>
            <div><strong>Chance of Rain: </strong>{{ currentRainChance }} %</div>
        </v-card-text>
        <v-card-text v-else>
            Loading weather data...
        </v-card-text>
    </v-card>
</template>

<script> 
import { getWeather } from '@/js/weatherService';

export default {
    name:'WeatherWidget',
    data() {
        return {
            weather:null,
            currentTemp: null,
            currentRainChance: null,
        };
    },
    async mounted() {
        try {
            const data = await getWeather(59.3294, 18.0687) //Stockholm
            this.weather = data;

            const now = new Date();
            /* Ser till att väderdata har rätt tid. */
            const i = data.time.findIndex(t => {
            const date = new Date(t);
            return (
                date.getHours() === now.getHours() &&
                date.getDate() === now.getDate() &&
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear()
            );
            });

            const index = i !== -1 ? i : 0;

            this.currentTemp = data.temperature2m[index];
            this.currentRainChance = data.precipitationProbability[index];
            console.log("Fetched weather data:", data); //testing

    } catch (error) {
        console.error("Failed to fetch weather data:", error)
    }
}
};
</script>

<style scoped>
.weather-card{
    width: 300px;
    padding: 10px;
}
</style>