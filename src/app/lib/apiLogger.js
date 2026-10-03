import { AsyncLocalStorage } from 'async_hooks';

const asyncLocalStorage = new AsyncLocalStorage();

const originalLog = console.log;
const originalError = console.error;

console.log = (...args) => {
  originalLog(...args);
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.push({ type: 'log', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') });
  }
};

console.error = (...args) => {
  originalError(...args);
  const store = asyncLocalStorage.getStore();
  if (store) {
    store.push({ type: 'error', text: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ') });
  }
};

export function withApiLogging(handler) {
  return async (request, context) => {
    const start = Date.now();
    const logs = [];
    let status = 200;

    return asyncLocalStorage.run(logs, async () => {
      try {
        const response = await handler(request, context);
        status = response.status;
        return response;
      } catch (err) {
        status = 500;
        console.error(err.message);
        throw err;
      } finally {
        const duration = Date.now() - start;
        const path = new URL(request.url).pathname;
        const method = request.method;

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (supabaseUrl && supabaseKey) {
          fetch(`${supabaseUrl}/rest/v1/api_logs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              method,
              path,
              status,
              duration_ms: duration,
              message: logs // Stores all console logs as a JSON array string
            })
          }).catch(() => {});
        }
      }
    });
  };
}