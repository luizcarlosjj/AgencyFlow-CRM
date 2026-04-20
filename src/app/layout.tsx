import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' });
const poppins = Poppins({ variable: '--font-poppins', subsets: ['latin'], weight: ['500', '600', '700'], display: 'swap' });

export const metadata: Metadata = {
  title: 'AgencyFlow CRM',
  description: 'CRM para agências de marketing digital',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="min-h-screen bg-[#F9FAFB] font-sans">
        {children}
      </body>
    </html>
  );
}
