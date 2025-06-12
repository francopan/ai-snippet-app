// import '@testing-library/jest-dom';


// class LocalStorageMock {
//     private store: Record<string, string> = {};
//     clear() { this.store = {}; }
//     getItem(key: string) { return this.store[key] || null; }
//     setItem(key: string, value: string) { this.store[key] = value.toString(); }
//     removeItem(key: string) { delete this.store[key]; }
//   }
//   global.localStorage = new LocalStorageMock() as any;
  
//   Object.defineProperty(window, 'matchMedia', {
//     writable: true,
//     value: (query: string) => ({
//       matches: false,
//       media: query,
//       onchange: null,
//       addListener: jest.fn(), // deprecated but still used
//       removeListener: jest.fn(),
//       addEventListener: jest.fn(),
//       removeEventListener: jest.fn(),
//       dispatchEvent: jest.fn(),
//     }),
//   });