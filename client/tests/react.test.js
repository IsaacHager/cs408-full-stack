import { render, screen } from '@testing-library/react';
import App from '../src/App';

jest.mock('../src/context/UserContext.jsx', () => ({
  useUser: () => ({
    loading: false,
    hasCanvasToken: true,
    hasSkippedCanvas: false,
    isAuthenticated: true,
    userData: { id: '123', name: 'Student User' },
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