/**
 * Jest Test Setup
 * Global test configuration and utilities
 */

// Mock DOM APIs that might not be available in test environment
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock Web APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Test utilities
global.testUtils = {
  // Create a mock DOM element
  createElement: (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    Object.keys(attributes).forEach(key => {
      element.setAttribute(key, attributes[key]);
    });
    children.forEach(child => {
      if (typeof child === 'string') {
        element.textContent = child;
      } else {
        element.appendChild(child);
      }
    });
    return element;
  },

  // Simulate user click
  simulateClick: element => {
    const event = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(event);
  },

  // Wait for next tick
  nextTick: () => new Promise(resolve => setTimeout(resolve, 0)),

  // Mock performance.now
  mockPerformanceNow: (value = 0) => {
    jest.spyOn(performance, 'now').mockReturnValue(value);
  }
};

// Clean up after each test
afterEach(() => {
  // Clear all mocks
  jest.clearAllMocks();

  // Clear localStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();

  // Clear sessionStorage
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();

  // Clear document body
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});

// Global test timeout
jest.setTimeout(10000);
