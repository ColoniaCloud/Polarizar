import type { Metadata } from 'next';
import './globals.css';
import Navigation from './components/Navigation';

export const metadata: Metadata = {
  title: 'Polarizar',
  description: 'Proyecto Next.js para Polarizar',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='es'>
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
