import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-[#060417] text-white font-sans relative overflow-x-hidden">

      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div
          className="orb w-[700px] h-[700px] bg-indigo-600/20"
          style={{ top: '-180px', left: '-200px', animationDelay: '0s' }}
        />
        <div
          className="orb w-[500px] h-[500px] bg-violet-600/15"
          style={{ top: '35%', right: '-180px', animationDelay: '3s' }}
        />
        <div
          className="orb w-[450px] h-[450px] bg-indigo-500/12"
          style={{ bottom: '-100px', left: '30%', animationDelay: '6s' }}
        />
        <div
          className="orb w-[300px] h-[300px] bg-blue-600/10"
          style={{ top: '60%', left: '10%', animationDelay: '1.5s' }}
        />
      </div>

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Outlet />
      </main>

      <footer className="relative z-10 mt-16">
        <div className="divider-gradient mx-4" />
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-primary-light" />
            </div>
            <span className="text-sm font-semibold gradient-text">LMS Pro</span>
          </div>
          <p className="text-gray-600 text-xs">
            &copy; {new Date().getFullYear()} LMS Pro — Built for learners everywhere.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
