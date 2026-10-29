import { Outlet } from 'react-router-dom';
import './App.css';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

function Layout() {
    return (
        <div className="flex min-h-screen w-full">
            <Sidebar />
            <div className="flex-1 flex flex-col relative w-full dotted-grid">
                <Header />
                <main className="flex-1 flex items-center justify-center -mt-18">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    );
}

export default Layout;