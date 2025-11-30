# CORS Error Solutions

## Problem

The API server at `http://rock-reviewed.gl.at.ply.gg:29939` doesn't send CORS headers, so browsers block requests from `http://127.0.0.1:5500`.

## Solutions (in order of recommendation)

### 1. **Disable CORS in Browser (Easiest for Development)**

**Chrome/Edge:**

**Windows (Command Prompt/PowerShell):**

```cmd
chrome.exe --disable-web-security --user-data-dir="C:/temp/chrome_dev"
```

**Windows (Git Bash):**

```bash
# Find Chrome path first, then use full path:
"/c/Program Files/Google/Chrome/Application/chrome.exe" --disable-web-security --user-data-dir="C:/temp/chrome_dev"

# Or if Chrome is in Program Files (x86):
"/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" --disable-web-security --user-data-dir="C:/temp/chrome_dev"

# Or use start command:
start chrome.exe --disable-web-security --user-data-dir="C:/temp/chrome_dev"
```

**Windows (Alternative - Find Chrome automatically):**

```bash
# In Git Bash, find Chrome and run it:
find /c/Program* -name "chrome.exe" 2>/dev/null | head -1 | xargs -I {} {} --disable-web-security --user-data-dir="C:/temp/chrome_dev"
```

**Mac:**

```bash
open -na Google\ Chrome --args --disable-web-security --user-data-dir="/tmp/chrome_dev"
```

**Linux:**

```bash
google-chrome --disable-web-security --user-data-dir="/tmp/chrome_dev"
```

**Firefox:**

1. Go to `about:config`
2. Set `security.fileuri.strict_origin_policy` to `false`
3. Install CORS Everywhere extension

**Important:** Only use this for development! Close all browser windows before running.

### 2. **Use Browser Extension**

Install one of these extensions:

- **CORS Unblock** (Chrome/Edge)
- **Allow CORS: Access-Control-Allow-Origin** (Chrome/Edge)
- **CORS Everywhere** (Firefox)

Enable the extension and refresh your page.

### 3. **Run Local CORS Proxy Server**

**Using Node.js:**

```bash
# Install cors-anywhere globally
npm install -g cors-anywhere

# Run the proxy server
cors-anywhere

# The proxy will run on http://localhost:8080
# Update your API URL to:
# http://localhost:8080/http://rock-reviewed.gl.at.ply.gg:29939/api/weather/history/analyze
```

**Using Python:**

```bash
# Install flask-cors
pip install flask flask-cors

# Create proxy.py:
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests

app = Flask(__name__)
CORS(app)

@app.route('/proxy/<path:url>', methods=['GET', 'POST', 'PUT', 'DELETE'])
def proxy(url):
    full_url = f"http://{url}"
    if request.method == 'POST':
        response = requests.post(full_url, json=request.json, headers=request.headers)
    else:
        response = requests.get(full_url, headers=request.headers)
    return jsonify(response.json())

if __name__ == '__main__':
    app.run(port=5000)

# Run: python proxy.py
# Use: http://localhost:5000/proxy/rock-reviewed.gl.at.ply.gg:29939/api/weather/history/analyze
```

### 4. **Ask Backend Team to Add CORS Headers**

**IMPORTANT:** The backend must handle OPTIONS requests (preflight) AND add CORS headers!

The backend needs to:

1. Handle OPTIONS requests (preflight)
2. Add CORS headers to all responses

**Java Spring Boot:**

```java
@CrossOrigin(origins = "*")
@RestController
public class WeatherController {
    // ...
}
```

Or globally (RECOMMENDED):

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("*")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .maxAge(3600);
            }
        };
    }
}
```

**If using Spring Security, also add:**

```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().and() // Enable CORS
            .csrf().disable(); // May need to disable CSRF for API
        return http.build();
    }
}
```

**Manual CORS Filter (if not using Spring):**

```java
@Component
public class CorsFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;

        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setHeader("Access-Control-Max-Age", "3600");

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        chain.doFilter(req, res);
    }
}
```

**Node.js/Express:**

```javascript
const cors = require("cors");
app.use(cors());
```

### 5. **Use a Different Development Server**

Instead of `http://127.0.0.1:5500`, try:

- Serve from the same origin as the API (if possible)
- Use a local server that can proxy requests

## Quick Fix for Testing

The fastest solution is **#1 (Disable CORS in Browser)**:

1. Close ALL Chrome/Edge windows
2. Open Command Prompt/Terminal
3. Run:
   ```
   chrome.exe --disable-web-security --user-data-dir="C:/temp/chrome_dev"
   ```
4. Navigate to your page
5. Test the API call

**Remember:** This disables security features. Only use for development!

## Production Solution

For production, the backend **MUST** add proper CORS headers. Public CORS proxies are unreliable and should not be used in production.
