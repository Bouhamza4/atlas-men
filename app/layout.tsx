
import { AuthProvider } from '@/app/lib/providers/AuthProvider';

import Header from '@/components/Header';


import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ATLAS GENTLEMAN - Professional Dashboard',
  description: 'Professional e-commerce admin dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif",
        margin: 0,
        padding: 0,
        boxSizing: 'border-box'
      }}>
       <Header />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}