import './globals.css';

export const metadata = {
  title: 'Borewell Drilling Management - Admin Fleet Dashboard',
  description: 'Daily drilling reports monitoring for 4 vehicles, fleet analytics, and field logs.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
