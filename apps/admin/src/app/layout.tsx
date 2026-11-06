import React from 'react';
import './globals.css';
import { ThemeProvider } from '@/lib/themeContext';
import { AuthProvider } from '@/lib/authContext';

export const metadata = {
  title: 'ChargeMesh Operations & CPO Admin Portal',
  description: 'Centralized EV Charging Network Management, CPO Interoperability, and Financial Ledger Administration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
