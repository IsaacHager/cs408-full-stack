import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../src/Header';
import Footer from '../src/Footer';
import Sidebar from '../src/Sidebar';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ text: 'Hello World' }),
    })
  );
});

describe('UI elements present', () => {
  test('renders header', () => {
    render(<Header />);

    const headerElement = screen.getByRole('banner');
    expect(headerElement).toBeVisible();
    expect(headerElement).toHaveTextContent(/Canvas/i);
    expect(headerElement).toHaveTextContent(/Desk/i);
  });

  test('renders footer', () => {
    render(<Footer />);

    const footerElement = screen.getByRole('contentinfo');
    expect(footerElement).toBeInTheDocument();
    expect(footerElement).toHaveTextContent(/CanvasDesk/i);

    const linkElement = screen.getByRole('link', { name: /GitHub/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href');
  });

  test('renders sidebar', () => {
    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    const sidebarElement = screen.getByRole('complementary');
    expect(sidebarElement).toBeVisible();
  });
});