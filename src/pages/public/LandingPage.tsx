// src/pages/public/LandingPage.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price_cents: number;
}

export default function LandingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMenu() {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price_cents')
        .order('name', { ascending: true });

      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchMenu();
  }, []);

  return (
    <div className="min-h-screen flex flex-col w-full bg-stone-50">
      {/* 60% Dominant Tone: Clean, organic stone background */}
      
      {/* Semantic Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-stone-200 sticky top-0 z-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <span className="font-serif text-xl font-bold tracking-tight text-stone-900">
            CRAFT<span className="text-amber-700">&</span>BREAD
          </span>
          {/* Subtle utility navigation pointing back to staff login if needed */}
          <Link 
            to="/admin/login"
            className="min-h-[44px] min-w-[44px] px-4 py-2 flex items-center text-sm font-medium text-stone-600 hover:text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-700 rounded-md transition-colors"
          >
            Staff Portal
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col gap-12">
        
        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto flex flex-col gap-4">
          <h1 className="text-4xl sm:text-5xl font-serif font-black tracking-tight text-stone-900 leading-tight">
            Locally Roasted. <br />
            <span className="text-amber-700">Precisely Brewed.</span>
          </h1>
          <p className="text-lg text-stone-600 leading-relaxed">
            Welcome to Craft & Bread. Every single bean is carefully tracked from source to cup. Explore our active daily menu below.
          </p>
        </section>

        {/* 30% Structural Tone: Crisp White Menu Container */}
        <section className="w-full bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 flex flex-col gap-6">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-2xl font-serif font-bold text-stone-900">Today's Offerings</h2>
            <p className="text-sm text-stone-500 mt-1">Real-time inventory fresh from the baristas.</p>
          </div>

          {/* Loading / Empty States */}
          {loading ? (
            <div className="py-12 text-center text-stone-500 font-medium">
              Consulting the coffee matrix...
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-stone-500">
              Our menu is currently resting. Check back during business hours.
            </div>
          ) : (
            /* Responsive Grid System: Fluid columns with zero horizontal scroll */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div 
                  key={product.id}
                  className="group border border-stone-100 rounded-xl p-5 hover:border-amber-200 hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between gap-4 bg-stone-50/50"
                >
                  <div className="flex flex-col gap-1">
                    <h3 className="font-serif font-bold text-lg text-stone-900 group-hover:text-amber-800 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-stone-400 font-mono tracking-wider uppercase">
                      ID: {product.id.split('-')[0]}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100/80">
                    {/* Financial Integrity: Deserializing cents back to display currency */}
                    <span className="text-xl font-bold text-stone-900">
                      ${(product.price_cents / 100).toFixed(2)}
                    </span>

                    {/* 10% Accent Call-to-Action: Interactive micro-target */}
                    <button
                      type="button"
                      onClick={() => alert(`Enjoy your ${product.name}!`)}
                      className="min-h-[44px] min-w-[44px] px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                    >
                      Order
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer Area */}
      <footer className="w-full bg-stone-900 text-stone-400 py-8 px-4 mt-auto border-t border-stone-800 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Craft & Bread Coffee Co. All rights reserved.</p>
      </footer>
    </div>
  );
}