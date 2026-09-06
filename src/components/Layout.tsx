import type { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import MobileTabBar from './MobileTabBar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      {/* Add pb-16 to avoid content being hidden behind the mobile tab bar */}
      <main className="flex-1 container mx-auto px-4 py-8 pb-24 md:pb-8">
        {children}
      </main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}