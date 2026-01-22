import './globals.css';

export const metadata = {
  title: 'Duns Warung Kopi',
  description: 'Warung kopi modern dengan menu kopi, minuman, makanan, dan PPOB.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        {children}
      </body>
    </html>
  );
}
