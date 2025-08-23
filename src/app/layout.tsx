import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

export const metadata: Metadata = {
  title: 'TaskZen',
  description:
    'A productivity web application with Kanban, Pomodoro, and scoring.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" as="style" />
        <style dangerouslySetInnerHTML={{
          __html: `
            @font-face {
              font-family: 'Inter Fallback';
              src: local('Arial'), local('Helvetica');
              font-display: swap;
              font-weight: 400 700;
            }
            .font-body {
              font-family: 'Inter', 'Inter Fallback', system-ui, -apple-system, sans-serif;
            }
          `
        }} />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <ThemeProvider>
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
