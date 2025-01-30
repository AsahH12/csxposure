import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from './Components/navbar';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
      </head>
      <Navbar />
      <body>
        {children}
      </body>
    </html>
  );
}
