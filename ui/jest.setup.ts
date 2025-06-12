import '@testing-library/jest-dom';
import 'whatwg-fetch';

class LocalStorageMock {
    private store: Record<string, string> = {};
    clear() { this.store = {}; }
    getItem(key: string) { return this.store[key] || null; }
    setItem(key: string, value: string) { this.store[key] = value.toString(); }
    removeItem(key: string) { delete this.store[key]; }
  }
  global.localStorage = new LocalStorageMock() as any;
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), 
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }),
  });



global.fetch = fetch;
global.Request = Request;
global.Response = Response;
global.Headers = Headers;
