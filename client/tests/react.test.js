import { render, screen } from '@testing-library/react';
import Home from '../src/pages/Home';

const mockUser = {
  id: '123',
  name: 'Student User'
}

jest.mock('../src/context/UserContext.jsx', () => ({
  useUser: () => ({
    loading: false,
    hasCanvasToken: true,
    isAuthenticated: true,
    userData: mockUser,
  }),
}));

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    if (typeof url === 'string' && url.includes('/api/main')) {

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ text: 'Hello World' }),
      });
    }
  });
});

test('renders message from API response', async () => {
  render(<Home />);
  expect(await screen.findByText('Hello World')).toBeInTheDocument();
});