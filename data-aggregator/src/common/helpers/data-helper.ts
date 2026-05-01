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
}
