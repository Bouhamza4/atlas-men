import { Inter } from 'next/font/google';
import { AuthProvider } from '@/app/lib/providers/AuthProvider';
import './globals.css';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ATLAS GENTLEMAN - Admin Dashboard',
  description: 'Professional e-commerce admin dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Header />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}