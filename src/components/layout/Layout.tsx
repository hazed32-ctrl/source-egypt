import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import CompareBar from '@/components/compare/CompareBar';

interface LayoutProps {
  children: ReactNode;
  showFooter?: boolean;
  hideCompareBar?: boolean;
}

const Layout = ({ children, showFooter = true, hideCompareBar = false }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-24">
        {children}
      </main>
      {showFooter && <Footer />}
      {!hideCompareBar && <CompareBar />}
    </div>
  );
};

export default Layout;
