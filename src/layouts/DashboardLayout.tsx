import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './MainLayout';

const DashboardLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{ width: '250px', borderRight: '1px solid #ccc', padding: '1rem' }}>
          {/* Dashboard Sidebar Placeholder */}
          Dashboard Menu
        </aside>
        <main style={{ flex: 1, padding: '1rem' }}>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
