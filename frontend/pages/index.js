import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import axios from 'axios';
import ProductCard from '@/components/ProductCard';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setFeaturedProducts(res.data.slice(0, 4)))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted className="w-full h-full object-cover">
            <source src="/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 text-center"
        >
          <h1 className="text-6xl md:text-8xl font-light tracking-wider mb-6">
            LUXTIME
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 tracking-wide">
            Where time becomes art
          </p>
          <Link href="/products">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              className="bg-[#D4AF37] text-black px-12 py-4 rounded-full text-lg font-semibold tracking-wide hover:bg-[#C5A336] transition-all"
            >
              DISCOVER COLLECTION
            </motion.button>
          </Link>
        </motion.div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-black">
        <div className="container-luxury">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-light tracking-wider mb-4">
            Featured Timepieces
            </h2>
            <div className="w-20 h-px bg-[#D4AF37] mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
