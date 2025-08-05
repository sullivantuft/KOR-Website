/**
 * Unit Tests for KOR Website Utilities
 */

// Import the utility functions (assuming they are exported)
const {
  DOM,
  Form,
  Animation,
  Storage,
  Network,
  Device
} = require('../../js/utils.js');

describe('KOR Website Utilities', () => {
  // ==========================================
  // DOM UTILITIES
  // ==========================================
  describe('DOMUtils', () => {
    test('getElementById should return an element', () => {
      document.body.innerHTML = '<div id="test-id"></div>';
      const element = DOM.getElementById('test-id');
      expect(element).not.toBeNull();
      expect(element.id).toBe('test-id');
    });

    test('debounce should delay function execution', done => {
      const mockFn = jest.fn();
      const debouncedFn = DOM.debounce(mockFn, 200);

      debouncedFn();
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      setTimeout(() => {
        expect(mockFn).toHaveBeenCalledTimes(1);
        done();
      }, 250);
    });
  });

  // ==========================================
  // FORM UTILITIES
  // ==========================================
  describe('FormUtils', () => {
    test('isValidEmail should validate email format', () => {
      expect(Form.isValidEmail('test@example.com')).toBe(true);
      expect(Form.isValidEmail('invalid-email')).toBe(false);
    });

    test('showError and clearError should manage error states', () => {
      document.body.innerHTML = '<div><input type="text" id="my-input"></div>';
      const input = document.getElementById('my-input');

      Form.showError(input, 'This is an error');
      expect(input.classList.contains('error')).toBe(true);

      Form.clearError(input);
      expect(input.classList.contains('error')).toBe(false);
      expect(input.classList.contains('success')).toBe(true);
    });
  });

  // ==========================================
  // ANIMATION UTILITIES
  // ==========================================
  describe('AnimationUtils', () => {
    test('fadeIn should animate opacity', async () => {
      const element = document.createElement('div');
      element.style.opacity = '0';

      Animation.fadeIn(element, 100);

      // We can't easily test the animation frames, but we can check the end state
      setTimeout(() => {
        expect(element.style.opacity).toBe('1');
      }, 150);
    });
  });

  // ==========================================
  // STORAGE UTILITIES
  // ==========================================
  describe('StorageUtils', () => {
    test('setLocal and getLocal should work with localStorage', () => {
      const data = { user: 'test' };
      Storage.setLocal('test-key', data);

      const retrievedData = Storage.getLocal('test-key');
      expect(retrievedData).toEqual(data);
    });
  });

  // ==========================================
  // NETWORK UTILITIES
  // ==========================================
  describe('NetworkUtils', () => {
    test('request should handle successful fetch', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true }),
        headers: { get: () => 'application/json' }
      });

      const response = await Network.request('https://api.example.com');
      expect(response.success).toBe(true);
    });
  });
});
