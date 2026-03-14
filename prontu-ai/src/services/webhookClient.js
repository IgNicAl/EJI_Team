// ============================================
// Resilient Webhook HTTP Client
// Retry with exponential backoff + timeout
// ============================================

const DEFAULT_OPTIONS = {
  maxRetries: 3,
  baseDelay: 1000,
  timeout: 10000,
};

class WebhookError extends Error {
  constructor(message, { status, retries, originalError } = {}) {
    super(message);
    this.name = 'WebhookError';
    this.status = status;
    this.retries = retries;
    this.originalError = originalError;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Send a payload to a webhook URL with retry logic.
 *
 * @param {string} url - Webhook endpoint
 * @param {object} payload - JSON-serializable data
 * @param {object} [options] - Override maxRetries, baseDelay, timeout
 * @returns {Promise<{ success: boolean, data?: any, retries: number }>}
 * @throws {WebhookError}
 */
export async function sendWebhook(url, payload, options = {}) {
  const { maxRetries, baseDelay, timeout } = { ...DEFAULT_OPTIONS, ...options };
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.warn(`[Webhook] Retry ${attempt}/${maxRetries} in ${delay}ms...`);
        await sleep(delay);
      }

      console.log(`[Webhook] POST ${url} (attempt ${attempt + 1})`);

      const response = await fetchWithTimeout(
        url,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        timeout,
      );

      if (!response.ok) {
        throw new WebhookError(`HTTP ${response.status}: ${response.statusText}`, {
          status: response.status,
        });
      }

      let data = null;
      const text = await response.text();
      if (text) {
        try { data = JSON.parse(text); } catch { data = text; }
      }

      console.log(`[Webhook] ✅ Success on attempt ${attempt + 1}`);
      return { success: true, data, retries: attempt };
    } catch (error) {
      lastError = error;

      if (error.name === 'AbortError') {
        console.error(`[Webhook] ⏱️ Timeout after ${timeout}ms`);
      } else {
        console.error(`[Webhook] ❌ Attempt ${attempt + 1} failed:`, error.message);
      }

      // Don't retry on 4xx client errors (except 429)
      if (error.status && error.status >= 400 && error.status < 500 && error.status !== 429) {
        break;
      }
    }
  }

  throw new WebhookError(
    `Webhook failed after ${maxRetries + 1} attempts: ${lastError?.message}`,
    { retries: maxRetries, originalError: lastError },
  );
}

export { WebhookError };
