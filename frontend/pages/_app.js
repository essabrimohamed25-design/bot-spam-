import '@/styles/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <Component {...pageProps} />
        <Toaster position="bottom-right" />
      </CartProvider>
    </AuthProvider>
  );
}
