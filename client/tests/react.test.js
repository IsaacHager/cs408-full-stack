import { render, screen } from '@testing-library/react';
import App from '../src/App';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    isAuthenticated: true,
    isLoading: false,
    user: { email: 'test@example.com', sub: 'auth0|123' },
    loginWithRedirect: jest.fn(),
    logout: jest.fn(),
  }),
}));

jest.mock('../src/context/UserContext.jsx', () => ({
  useUser: () => ({
    loading: false,
    hasCanvasToken: true,
    hasSkippedCanvas: false,
    userData: { userId: 'auth0|123', email: 'test@example.com' },
  }),
}));

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ text: 'Hello World' }),
    })
  );
});

test('renders message from API response', async () => {
  render(<App />);
  expect(await screen.findByText('Hello World')).toBeInTheDocument();
});