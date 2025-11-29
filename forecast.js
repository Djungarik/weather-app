// Weather Forecast Page Logic
let weatherChart = null;
const API_BASE_URL = 'http://localhost:8000';
const API_ENDPOINT = '/api/weather/forecast';

// State
let currentInterval = 'month';
let currentComparison = 'year-ago';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('forecast-date');
    const timeInput = document.getElementById('forecast-time');
    
    // Set default date to today
    dateInput.valueAsDate = new Date();
    
    // Set default time to current time
    const now = new Date();
    timeInput.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Event listeners
    document.getElementById('month-btn').addEventListener('click', () => {
        currentInterval = 'month';
        document.getElementById('month-btn').classList.add('active');
        document.getElementById('week-btn').classList.remove('active');
    });
    
    document.getElementById('week-btn').addEventListener('click', () => {
        currentInterval = 'week';
        document.getElementById('week-btn').classList.add('active');
        document.getElementById('month-btn').classList.remove('active');
    });
    
    document.getElementById('year-ago-btn').addEventListener('click', () => {
        currentComparison = 'year-ago';
        document.getElementById('year-ago-btn').classList.add('active');
        document.getElementById('previous-period-btn').classList.remove('active');
    });
    
    document.getElementById('previous-period-btn').addEventListener('click', () => {
        currentComparison = 'previous-period';
        document.getElementById('previous-period-btn').classList.add('active');
        document.getElementById('year-ago-btn').classList.remove('active');
    });
    
    document.getElementById('save-location-btn').addEventListener('click', () => {
        const location = document.getElementById('location-input').value.trim();
        if (location) {
            localStorage.setItem('savedLocation', location);
            showInfo('Location saved successfully!', 'success');
        } else {
            showInfo('Please enter a location first.', 'error');
        }
    });
    
    document.getElementById('fetch-btn').addEventListener('click', fetchForecast);
});

// Fetch forecast
async function fetchForecast() {
    const location = document.getElementById('location-input').value.trim();
    const forecastDate = document.getElementById('forecast-date').value;
    const forecastTime = document.getElementById('forecast-time').value;
    const metric = document.getElementById('metric-select').value;
    
    // Validation
    if (!location) {
        showInfo('Please enter a point of interest.', 'error');
        return;
    }
    
    if (!forecastDate) {
        showInfo('Please select a forecast date.', 'error');
        return;
    }
    
    if (!forecastTime) {
        showInfo('Please select a forecast time.', 'error');
        return;
    }
    
    // Check if date/time is in the past
    const selectedDateTime = new Date(`${forecastDate}T${forecastTime}`);
    if (selectedDateTime < new Date()) {
        showInfo('The selected date and time cannot be in the past.', 'error');
        return;
    }
    
    // Check if date is too far in the future (e.g., more than 10 days)
    const daysDiff = (selectedDateTime - new Date()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 10) {
        showInfo('Forecast is only available for up to 10 days in advance.', 'error');
        return;
    }
    
    const dateRanges = calculateDateRanges(forecastDate, currentInterval, currentComparison);
    
    showInfo('Loading weather forecast...', 'loading');
    document.getElementById('fetch-btn').disabled = true;
    
    try {
        const requestData = {
            location: location,
            metric: metric,
            date: forecastDate,
            time: forecastTime,
            interval: currentInterval,
            comparison: currentComparison,
            startDate: dateRanges.startDate,
            endDate: dateRanges.endDate,
            compareStartDate: dateRanges.compareStartDate,
            compareEndDate: dateRanges.compareEndDate
        };
        
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Auth.getToken()}`
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch forecast');
        }
        
        const data = await response.json();
        renderChart(data, metric, dateRanges);
        showInfo(`Forecast loaded successfully for ${location}.`, 'success');
    } catch (error) {
        console.error('Error:', error);
        showInfo(`Error: ${error.message}. Using sample data for demonstration.`, 'error');
        
        // Demo mode
        const sampleData = generateSampleData(dateRanges, metric);
        renderChart(sampleData, metric, dateRanges);
    } finally {
        document.getElementById('fetch-btn').disabled = false;
    }
}

// Calculate date ranges (reuse from original script.js logic)
function calculateDateRanges(selectedDate, interval, comparison) {
    const date = new Date(selectedDate);
    let startDate, endDate, compareStartDate, compareEndDate;

    if (interval === 'month') {
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);

        if (comparison === 'year-ago') {
            compareStartDate = new Date(date.getFullYear() - 1, date.getMonth(), 1);
            compareEndDate = new Date(date.getFullYear() - 1, date.getMonth() + 1, 0);
            compareEndDate.setHours(23, 59, 59, 999);
        } else {
            compareStartDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
            compareEndDate = new Date(date.getFullYear(), date.getMonth(), 0);
            compareEndDate.setHours(23, 59, 59, 999);
        }
    } else {
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate = new Date(date.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        if (comparison === 'year-ago') {
            compareStartDate = new Date(startDate);
            compareStartDate.setFullYear(startDate.getFullYear() - 1);
            compareEndDate = new Date(compareStartDate);
            compareEndDate.setDate(compareStartDate.getDate() + 6);
            compareEndDate.setHours(23, 59, 59, 999);
        } else {
            compareStartDate = new Date(startDate);
            compareStartDate.setDate(startDate.getDate() - 7);
            compareEndDate = new Date(compareStartDate);
            compareEndDate.setDate(compareStartDate.getDate() + 6);
            compareEndDate.setHours(23, 59, 59, 999);
        }
    }

    return {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        compareStartDate: compareStartDate.toISOString().split('T')[0],
        compareEndDate: compareEndDate.toISOString().split('T')[0]
    };
}

// Generate sample data
function generateSampleData(dateRanges, metric) {
    const start = new Date(dateRanges.startDate);
    const end = new Date(dateRanges.endDate);
    const compareStart = new Date(dateRanges.compareStartDate);
    const compareEnd = new Date(dateRanges.compareEndDate);
    
    const currentData = generateDataPoints(start, end, metric, 20);
    const compareData = generateDataPoints(compareStart, compareEnd, metric, 15);
    
    return {
        current: currentData,
        comparison: compareData
    };
}

function generateDataPoints(startDate, endDate, metric, baseValue) {
    const points = [];
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= days; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        let value = baseValue;
        if (metric === 'temperature') {
            value = 15 + Math.sin(i * 0.3) * 10 + Math.random() * 5;
        } else if (metric === 'humidity') {
            value = 50 + Math.sin(i * 0.2) * 20 + Math.random() * 10;
        } else if (metric === 'pressure') {
            value = 1013 + Math.sin(i * 0.1) * 10 + Math.random() * 5;
        } else if (metric === 'windSpeed') {
            value = 10 + Math.sin(i * 0.4) * 8 + Math.random() * 5;
        } else if (metric === 'precipitation') {
            value = Math.max(0, Math.sin(i * 0.5) * 5 + Math.random() * 3);
        }
        
        points.push({
            date: date.toISOString().split('T')[0],
            value: Math.round(value * 10) / 10
        });
    }
    
    return points;
}

// Render chart
function renderChart(data, metric, dateRanges) {
    const ctx = document.getElementById('weather-chart').getContext('2d');
    
    if (weatherChart) {
        weatherChart.destroy();
    }

    const currentLabels = data.current.map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    
    const currentValues = data.current.map(item => item.value);
    const compareValues = data.comparison.map(item => item.value);
    
    const comparisonLabel = currentComparison === 'year-ago' 
        ? 'Same Period Year Ago' 
        : (currentInterval === 'month' ? 'Previous Month' : 'Previous Week');
    
    const intervalLabel = currentInterval === 'month' ? 'Month' : 'Week';

    weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: currentLabels,
            datasets: [
                {
                    label: `Current ${intervalLabel}`,
                    data: currentValues,
                    borderColor: 'rgb(102, 126, 234)',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: comparisonLabel,
                    data: compareValues,
                    borderColor: 'rgb(255, 99, 132)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderDash: [5, 5]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            plugins: {
                title: {
                    display: true,
                    text: `${getMetricLabel(metric)} Forecast - ${intervalLabel} View`,
                    font: { size: 18, weight: 'bold' },
                    padding: 20
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: { size: 12 },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: getMetricUnit(metric),
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.05)' }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date',
                        font: { size: 14, weight: 'bold' }
                    },
                    grid: { display: false }
                }
            }
        }
    });
}

function getMetricLabel(metric) {
    const labels = {
        temperature: 'Temperature',
        humidity: 'Humidity',
        pressure: 'Pressure',
        windSpeed: 'Wind Speed',
        precipitation: 'Precipitation'
    };
    return labels[metric] || metric;
}

function getMetricUnit(metric) {
    const units = {
        temperature: 'Temperature (°C)',
        humidity: 'Humidity (%)',
        pressure: 'Pressure (hPa)',
        windSpeed: 'Wind Speed (km/h)',
        precipitation: 'Precipitation (mm)'
    };
    return units[metric] || metric;
}

function showInfo(message, type = '') {
    const infoPanel = document.getElementById('info-panel');
    infoPanel.textContent = '';
    infoPanel.className = `info-panel ${type}`;
    
    if (type === 'loading') {
        const spinner = document.createElement('span');
        spinner.className = 'loading-spinner';
        infoPanel.appendChild(spinner);
    }
    
    const text = document.createTextNode(message);
    infoPanel.appendChild(text);
}

