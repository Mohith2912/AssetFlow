import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import PageTransition from './PageTransition';

export default function AppShell({
  currentUser,
  navItems,
  activeTab,
  setActiveTab,
  logoutUser,
  title,
  subtitle,
  actions,
  children,
}) {
  return (
    <div className="min-h-screen">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <Sidebar
          currentUser={currentUser}
          navItems={navItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          logoutUser={logoutUser}
        />

        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar title={title} subtitle={subtitle} actions={actions} />

          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}