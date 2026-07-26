import './globals.css';

export const metadata = {
  title: 'Smart Restaurant',
  description: 'Live menu, smart bookings, and inventory-aware ordering — built for VibeAthon 6.0',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
