# Enterprise Baseline & Load Performance Testing Framework

Production-ready performance testing suite built with **Node.js**, **Autocannon**, **ExcelJS**, **Winston**, and **GitHub Actions** to simulate **100 Concurrent Virtual Users (VUs)** running continuously for **1 Minute (60 Seconds)**.

---

## 📊 Target Load Configuration

- **Target System**: `https://bamp-1de96.web.app` (Firebase Web Application & REST APIs)
- **Virtual Users (VUs)**: `100 Concurrent Sockets`
- **Duration**: `60 Seconds (1 Minute)`
- **Throughput Measured**: Requests Per Second (RPS)
- **Latency Percentiles Measured**: Minimum, Maximum, Average, p50, p95, p99

---

## 🚀 Key Framework Features

1. **High-Throughput Load Engine (`utilities/loadEngine.js`)**: Multi-socket asynchronous HTTP benchmark engine generating thousands of HTTP requests per minute.
2. **ExcelJS 4-Sheet Report (`excelReporter.js`)**:
   - **Sheet 1: Summary** (VUs, Duration, Total Requests, RPS, Min/Avg/Max Latency, SLA Status)
   - **Sheet 2: Latency Percentiles** (p50, p90, p95, p99, Min, Max, Avg)
   - **Sheet 3: Endpoint Breakdown** (Route, Est Requests, Avg Latency)
   - **Sheet 4: Execution Logs** (Timestamp, Step, Details)
3. **Interactive HTML Report (`htmlReporter.js`)**: Visual dashboard displaying RPS metrics and latency percentiles.
4. **CI/CD Integration (`.github/workflows/load-test.yml`)**: Automated GitHub Actions workflow executing 100-VU 60-second baseline load tests and uploading downloadable ZIP artifacts.

---

## 💻 Local Execution Instructions

```bash
# 1. Install Dependencies
cd load-test
npm install

# 2. Execute 100-VU / 60-Second Baseline Load Test
npm run load-test

# 3. Generate / Update Excel Report
npm run report:excel
```

Or from project root:
```bash
npm run load-test
```

---

## 📈 Metric Definitions

- **Requests Per Second (RPS)**: Total HTTP requests processed per second by the API server (e.g. 120 req/sec).
- **Minimum Latency**: Response time of the fastest request (e.g., 50ms).
- **Average Latency**: Mean response time across all requests (e.g., 250ms).
- **Maximum Latency**: Response time of the slowest request (e.g., 1500ms / 1.5s).
- **p95 / p99 Percentiles**: 95% / 99% of user requests responded faster than this threshold.
