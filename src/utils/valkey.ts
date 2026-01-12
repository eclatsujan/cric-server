import Redis from 'ioredis';

const VALKEY_HOST = process.env.VALKEY_HOST || 'localhost';
const VALKEY_PORT = parseInt(process.env.VALKEY_PORT || '6379');

export const valkeyClient = new Redis({
  host: VALKEY_HOST,
  port: VALKEY_PORT,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

valkeyClient.on('connect', () => {
  console.log('✅ Connected to Valkey');
});

valkeyClient.on('error', (err) => {
  console.error('❌ Valkey connection error:', err);
});

export default valkeyClient;
