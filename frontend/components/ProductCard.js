import { motion } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(product);
    toast.success('Added to cart');
  };

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="group cursor-pointer"
    >
      <div className="relative overflow-hidden bg-gray-900 rounded-lg mb-4">
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="w-full h-96 object-cover transform group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={handleAddToCart}
            className="bg-[#D4AF37] text-black px-6 py-2 rounded-full font-semibold"
          >
            Add to Cart
          </button>
        </div>
      </div>
      <Link href={`/product/${product._id}`}>
        <h3 className="text-lg font-semibold mb-1 hover:text-[#D4AF37] transition">
          {product.name}
        </h3>
      </Link>
      <p className="text-gray-400 text-sm mb-2">{product.brand}</p>
      <p className="text-[#D4AF37] font-bold">${product.price.toLocaleString()}</p>
    </motion.div>
  );
}
