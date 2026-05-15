import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GitWrapped - Your GitHub Year in Review',
  description: 'Generate your beautiful, personalized GitHub Wrapped. Discover your developer persona, top languages, and coding streaks.',
  openGraph: {
    title: 'GitWrapped - Your GitHub Year in Review',
    description: 'Discover your developer persona, top languages, and coding streaks with GitWrapped.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
