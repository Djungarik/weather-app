// CORS Configuration
// This file handles CORS proxy settings for development

const CORSConfig = {
  // Set to true to use a CORS proxy (for development only)
  USE_PROXY: false,

  // API Base URL
  API_BASE_URL: "http://rock-reviewed.gl.at.ply.gg:29939",

  // CORS Proxy services (use only for development)
  PROXY_SERVICES: [
    // Option 1: AllOrigins (recommended - no setup needed)
    {
      name: "AllOrigins",
      getUrl: (apiUrl) =>
        `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`,
    },
    // Option 2: CORS Proxy (requires temporary access)
    {
      name: "CORS Anywhere",
      getUrl: (apiUrl) => `https://cors-anywhere.herokuapp.com/${apiUrl}`,
    },
    // Option 3: CORS Proxy IO
    {
      name: "CORS Proxy IO",
      getUrl: (apiUrl) => `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
    },
  ],

  // Get the full API URL with optional proxy
  getApiUrl(endpoint) {
    const fullUrl = `${this.API_BASE_URL}${endpoint}`;

    if (!this.USE_PROXY) {
      return fullUrl;
    }

    // Use the first proxy service (AllOrigins)
    const proxy = this.PROXY_SERVICES[0];
    return proxy.getUrl(fullUrl);
  },

  // Get fetch options with proper headers
  getFetchOptions(method, body) {
    const options = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    // Add headers for CORS proxy if needed
    if (this.USE_PROXY) {
      options.headers["X-Requested-With"] = "XMLHttpRequest";
    }

    return options;
  },
};
