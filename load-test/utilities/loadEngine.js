const autocannon = require('autocannon');
const config = require('../config/config');
const logger = require('./logger');

class LoadEngine {
  static async runBenchmark(customConfig = {}) {
    const targetUrl = customConfig.baseUrl || config.target.baseUrl;
    const connections = customConfig.connections || config.target.connections;
    const duration = customConfig.duration || config.target.duration;

    logger.info(`=================================================================`);
    logger.info(`🔥 LAUNCHING BASELINE & LOAD TEST ENGINE`);
    logger.info(`Target URL: ${targetUrl}`);
    logger.info(`Concurrent Virtual Users (VUs): ${connections}`);
    logger.info(`Test Duration: ${duration} seconds (1 minute)`);
    logger.info(`=================================================================`);

    const requests = config.endpoints.map(ep => ({
      path: ep.path,
      method: ep.method,
      headers: {
        'User-Agent': 'BAMP-LoadTest-Agent/1.0',
        'Accept': 'text/html,application/json,*/*'
      }
    }));

    return new Promise((resolve, reject) => {
      const instance = autocannon(
        {
          url: targetUrl,
          connections,
          duration,
          pipelining: config.target.pipelining,
          requests,
          headers: {
            'User-Agent': 'BAMP-Baseline-LoadTest/1.0'
          }
        },
        (err, result) => {
          if (err) {
            logger.error(`Load Engine Execution Failed: ${err.message}`);
            return reject(err);
          }
          logger.info(`=================================================================`);
          logger.info(`✅ LOAD TEST BENCHMARK COMPLETE`);
          logger.info(`Total Requests Sent: ${result.requests.total}`);
          logger.info(`Requests Per Second (RPS): ${result.requests.average.toFixed(2)} req/sec`);
          logger.info(`Response Times (Latency):`);
          logger.info(`  • Minimum: ${result.latency.min} ms`);
          logger.info(`  • Average: ${result.latency.average.toFixed(2)} ms`);
          logger.info(`  • Maximum: ${result.latency.max} ms`);
          logger.info(`  • 50th Percentile (p50): ${result.latency.p50} ms`);
          logger.info(`  • 95th Percentile (p95): ${result.latency.p95} ms`);
          logger.info(`  • 99th Percentile (p99): ${result.latency.p99} ms`);
          logger.info(`Total 2xx Success Responses: ${result['2xx'] || result.requests.total}`);
          logger.info(`Total Errors: ${result.errors || 0}`);
          logger.info(`=================================================================`);
          resolve(result);
        }
      );

      autocannon.track(instance, { renderProgressBar: true });
    });
  }
}

module.exports = LoadEngine;
