// Chart instance
let weatherChart = null;

// Configuration
const API_BASE_URL = 'http://localhost:8000'; // Update with your backend URL
const API_ENDPOINT = '/api/weather'; // Update with your backend endpoint

// DOM Elements
const metricSelect = document.getElementById('metric-select');
const dateInput = document.getElementById('date-input');
const monthBtn = document.getElementById('month-btn');
const weekBtn = document.getElementById('week-btn');
const yearAgoBtn = document.getElementById('year-ago-btn');
const previousPeriodBtn = document.getElementById('previous-period-btn');
const fetchBtn = document.getElementById('fetch-btn');
const infoPanel = document.getElementById('info-panel');

// State
let currentInterval = 'month'; // 'month' or 'week'
let currentComparison = 'year-ago'; // 'year-ago' or 'previous-period'

// Initialize date input to today
dateInput.valueAsDate = new Date();

// Event Listeners
monthBtn.addEventListener('click', () => {
    currentInterval = 'month';
    monthBtn.classList.add('active');
    weekBtn.classList.remove('active');
});

weekBtn.addEventListener('click', () => {
    currentInterval = 'week';
    weekBtn.classList.add('active');
    monthBtn.classList.remove('active');
});

yearAgoBtn.addEventListener('click', () => {
    currentComparison = 'year-ago';
    yearAgoBtn.classList.add('active');
    previousPeriodBtn.classList.remove('active');
});

previousPeriodBtn.addEventListener('click', () => {
    currentComparison = 'previous-period';
    previousPeriodBtn.classList.add('active');
    yearAgoBtn.classList.remove('active');
});

fetchBtn.addEventListener('click', fetchWeatherData);

// Calculate date ranges
function calculateDateRanges(selectedDate, interval, comparison) {
    const date = new Date(selectedDate);
    let startDate, endDate, compareStartDate, compareEndDate;

    if (interval === 'month') {
        // Current month interval
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);

        if (comparison === 'year-ago') {
            // Same month, year ago
            compareStartDate = new Date(date.getFullYear() - 1, date.getMonth(), 1);
            compareEndDate = new Date(date.getFullYear() - 1, date.getMonth() + 1, 0);
            compareEndDate.setHours(23, 59, 59, 999);
        } else {
            // Previous month
            compareStartDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
            compareEndDate = new Date(date.getFullYear(), date.getMonth(), 0);
            compareEndDate.setHours(23, 59, 59, 999);
        }
    } else {
        // Week interval
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday
        startDate = new Date(date.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);

        if (comparison === 'year-ago') {
            // Same week, year ago
            compareStartDate = new Date(startDate);
            compareStartDate.setFullYear(startDate.getFullYear() - 1);
            compareEndDate = new Date(compareStartDate);
            compareEndDate.setDate(compareStartDate.getDate() + 6);
            compareEndDate.setHours(23, 59, 59, 999);
        } else {
            // Previous week
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

// Fetch weather data from backend
async function fetchWeatherData() {
    const selectedDate = dateInput.value;
    const metric = metricSelect.value;

    if (!selectedDate) {
        showInfo('Please select a date.', 'error');
        return;
    }

    const dateRanges = calculateDateRanges(selectedDate, currentInterval, currentComparison);
    
    showInfo('Loading weather data...', 'loading');

    fetchBtn.disabled = true;

    try {
        // Prepare request payload
        const requestData = {
            metric: metric,
            date: selectedDate,
            interval: currentInterval,
            comparison: currentComparison,
            startDate: dateRanges.startDate,
            endDate: dateRanges.endDate,
            compareStartDate: dateRanges.compareStartDate,
            compareEndDate: dateRanges.compareEndDate
        };

        // Make API call
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Render chart with the data
        renderChart(data, metric, dateRanges);
        
        showInfo(`Data loaded successfully for ${getMetricLabel(metric)}.`, 'success');
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showInfo(`Error: ${error.message}. Please check your backend connection.`, 'error');
        
        // For demo purposes, show sample data if API fails
        if (error.message.includes('Failed to fetch') || error.message.includes('HTTP error')) {
            showInfo('Backend not available. Displaying sample data for demonstration.', 'error');
            const sampleData = generateSampleData(dateRanges, metric);
            renderChart(sampleData, metric, dateRanges);
        }
    } finally {
        fetchBtn.disabled = false;
    }
}

// Generate sample data for demonstration
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

// Render chart with data
function renderChart(data, metric, dateRanges) {
    const ctx = document.getElementById('weather-chart').getContext('2d');
    
    // Destroy existing chart if it exists
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
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 12
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: getMetricUnit(metric),
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// Get metric label for display
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

// Get metric unit for display
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

// Show info message
function showInfo(message, type = '') {
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

