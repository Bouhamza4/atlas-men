
import { AuthProvider } from '@/app/lib/providers/AuthProvider';



// app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CartProvider } from '@/components/CartContext';

export const metadata: Metadata = {
  title: 'Atlas Store - Modern Fashion & Quality Products',
  description: 'Discover the latest trends in fashion with Atlas Store',
  keywords: 'fashion, store, ecommerce, modern, clothing',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <CartProvider>
          <Header />
          <main className="main-content">
          <AuthProvider>
          {children}
        </AuthProvider>
          </main>

          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
