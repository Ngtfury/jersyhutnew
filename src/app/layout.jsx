import './globals.css';
import { Providers } from './providers';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import SearchOverlay from '../components/SearchOverlay';
import Toast from '../components/Toast';

export const metadata = {
  title: 'Jersey Hut | Football Jerseys for Every Fan',
  description: 'High-quality, affordable football jerseys, full sleeves, half sleeves, and oversized streetwear collections. Fast shipping and secure checkout.',
  openGraph: {
    title: 'Jersey Hut | Football Jerseys for Every Fan',
    description: 'High-quality, affordable football jerseys, full sleeves, half sleeves, and oversized streetwear collections.',
    type: 'website',
  },
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <div className="site-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
            <CartDrawer />
            <SearchOverlay />
            <Toast />

            {/* WhatsApp Floating Contact Button */}
            <a
              href="https://wa.me/919876543210?text=Hi%20Jersey%20Hut,%20I%20have%20a%20question%20about%20a%20jersey"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                position: 'fixed',
                bottom: '24px',
                left: '24px',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#25D366',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
                zIndex: 90,
                cursor: 'pointer'
              }}
              aria-label="Contact Jersey Hut on WhatsApp"
              id="whatsapp-chat-button"
            >
              <svg viewBox="0 0 24 24" width="26" height="26" fill="#ffffff">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.972.531 1.761.821 2.796.821 3.183 0 5.768-2.587 5.769-5.767.001-3.182-2.585-5.767-5.769-5.767zm0 10.355c-.918 0-1.636-.25-2.375-.688l-.17-.101-1.579.414.421-1.539-.111-.177c-.475-.757-.726-1.428-.725-2.502.001-2.537 2.064-4.601 4.603-4.601 2.539 0 4.602 2.064 4.601 4.601 0 2.538-2.063 4.602-4.602 4.602zm2.523-3.447c-.139-.069-.821-.405-.948-.451-.128-.046-.22-.069-.313.069-.092.139-.36.452-.441.544-.082.093-.163.104-.301.035-.139-.069-.587-.216-1.117-.689-.413-.368-.691-.823-.772-.962-.081-.139-.009-.214.061-.283.063-.062.139-.162.208-.243.07-.081.092-.139.139-.232.046-.093.023-.174-.012-.243-.035-.069-.313-.753-.429-1.031-.113-.27-.228-.234-.313-.238l-.267-.005c-.093 0-.244.035-.371.174-.128.139-.487.476-.487 1.16 0 .684.498 1.345.568 1.438.07.093.98 1.497 2.374 2.1 1.394.603 1.394.402 1.649.378.255-.024.821-.336.937-.66.116-.324.116-.602.081-.66-.035-.058-.128-.093-.267-.162z"/>
              </svg>
            </a>
          </div>
        </Providers>
      </body>
    </html>
  );
}
