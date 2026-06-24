import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SessionTimeoutModal } from '../components/auth';

export const Footer: React.FC = () => {
  return (
    <footer
      role="contentinfo"
      style={{
        padding: '1rem var(--spacing-6)',
        borderTop: '1px solid var(--color-neutral-200)',
        marginTop: 'auto',
        fontSize: 'var(--font-size-xs)',
        color: 'var(--color-neutral-500)',
        backgroundColor: 'white',
        textAlign: 'center',
      }}
    >
      <p style={{ margin: 0 }}>&copy; {new Date().getFullYear()} PMX</p>
    </footer>
  );
};

const MainLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-neutral-100)' }}>
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0, // Prevent flex items from overflowing
          height: '100vh',
        }}
      >
        {/* Slim Top Header */}
        <Header />

        {/* Scrollable Main Content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            position: 'relative',
          }}
        >
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>

      <SessionTimeoutModal />
    </div>
  );
};

export default MainLayout;
