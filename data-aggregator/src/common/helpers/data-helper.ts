export class DataHelper {
  static functionCache = new Map();

  static fn(fn, data) {
    if (!fn) {
      return data;
    }

    let result = data;

    switch (typeof fn) {
      case 'function':
        // If it's already a function, call it directly
        result = fn(data);
        break;
      case 'string':
        // Check the cache for an existing compiled function
        if (!this.functionCache.has(fn)) {
          // Compile and cache the function if not already cached
          const compiledFn = new Function('value', fn);
          this.functionCache.set(fn, compiledFn);
        }

        // Execute the cached function
        result = this.functionCache.get(fn)(data);
        break;
      default:
        break;
    }

    return result;
  }

  static resolveTemplate<T = unknown>(value: T, params: Record<string, unknown>): T {
    if (value == null) {
      return value;
    }

    if (typeof value === 'string') {
      const directMatch = value.match(/^\{\{\s*([\w.-]+)\s*\}\}$/);

      if (directMatch) {
        const directValue = params[directMatch[1]];
        return (directValue ?? value) as T;
      }

      const replaced = value.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, key: string) => {
        const resolved = params[key];
        return resolved == null ? '' : String(resolved);
      });

      return replaced as T;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.resolveTemplate(item, params)) as T;
    }

    if (typeof value === 'object') {
      const result: Record<string, unknown> = {};

      for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
        result[key] = this.resolveTemplate(item, params);
      }

      return result as T;
    }

    return value;
  }

  static normalizeRequestUrl(value: unknown): string {
    const raw = typeof value === 'string' ? value.trim() : String(value ?? '').trim();

    if (!raw) {
      return raw;
    }

    if (/^[a-z][a-z\d+.-]*:\/\//i.test(raw)) {
      return raw;
    }

    if (raw.startsWith('//')) {
      return `http:${raw}`;
    }

    return `http://${raw}`;
  }

  static parseObjectLikeString<T = unknown>(value: T): T {
    if (typeof value !== 'string') {
      return value;
    }

    const trimmed = value.trim();
    const looksLikeObject = trimmed.startsWith('{') && trimmed.endsWith('}');
    const looksLikeArray = trimmed.startsWith('[') && trimmed.endsWith(']');

    if (!looksLikeObject && !looksLikeArray) {
      return value;
    }

    const parsed =
      DataHelper.tryParseJson(trimmed) ?? DataHelper.tryParseJson(DataHelper.normalizeJsonLikeString(trimmed));
    return (parsed ?? value) as T;
  }

  static normalizeJsonLikeString(value: string): string {
    return value
      .replace(/([{,]\s*)([A-Za-z0-9_.-]+)\s*:/g, '$1"$2":')
      .replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, content: string) => `"${content.replace(/"/g, '\\"')}"`)
      .replace(/,\s*([}\]])/g, '$1');
  }

  static tryParseJson(value: string): unknown | undefined {
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  }

  static isRecord(value: unknown): value is Record<string, unknown> {
    return value != null && typeof value === 'object' && !Array.isArray(value);
  }

  static removeDuplicates(items: unknown[]): unknown[] {
    const seen = new Set<string>();

    return items.filter((item) => {
      const key = JSON.stringify(item);
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }
}
