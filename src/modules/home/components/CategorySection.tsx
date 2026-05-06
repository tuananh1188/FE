import { useEffect, useState } from 'react';
import { ChevronRight, LayoutGrid, Zap, Laptop, Shirt, Home, Sparkles } from 'lucide-react';

// Helper to get icon based on name or slug
const getCategoryIcon = (name: string, slug: string) => {
  const n = name.toLowerCase();
  const s = slug.toLowerCase();
  
  if (s.includes('electronics') || n.includes('electronics')) return <Laptop className="size-6 text-[#C83B1E]" />;
  if (s.includes('fashion') || n.includes('fashion')) return <Shirt className="size-6 text-[#C83B1E]" />;
  if (s.includes('home') || n.includes('home')) return <Home className="size-6 text-[#C83B1E]" />;
  if (s.includes('beauty') || n.includes('beauty')) return <Sparkles className="size-6 text-[#C83B1E]" />;
  if (s.includes('flash') || n.includes('flash')) return <Zap className="size-6 text-[#C83B1E] fill-[#C83B1E]" />;
  
  return null;
};

import { Link } from 'react-router-dom';
import { categoryApi, type Category } from '../../../shared/api/category.api';

export const CategorySection = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await categoryApi.getAll();
        const allCats = res.data.data;
        
        // Define original order (matching BE slugs)
        const order = ['electronics', 'fashion', 'home-kitchen', 'beauty-personal-care'];
        
        // Sort categories based on order, then append others
        const sorted = [...allCats].sort((a, b) => {
          const indexA = order.indexOf(a.slug);
          const indexB = order.indexOf(b.slug);
          
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return 0;
        });

        setCategories(sorted.slice(0, 4)); // Show first 4 categories in sorted order
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
      return (
          <section className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 rounded mb-6"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-40 bg-gray-100 rounded-xl"></div>
                  ))}
              </div>
          </section>
      );
  }

  return (
    <section>
      <div className="flex justify-between items-end mb-6">
        <h2 className="text-xl font-bold">Shop by Category</h2>
        <Link
          to="/categories"
          className="text-[#C83B1E] text-xs font-medium flex items-center hover:underline"
        >
          View All <ChevronRight className="size-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            to={`/categories/${cat.slug}`}
            className="bg-white rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
          >
            <div className="size-12 rounded-full bg-red-50 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-200 overflow-hidden">
              {/* Prioritize our helper, then cat.image, then fallback */}
              {getCategoryIcon(cat.name, cat.slug) ? (
                  getCategoryIcon(cat.name, cat.slug)
              ) : cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                  <LayoutGrid className="size-6 text-[#C83B1E]" />
              )}
            </div>
            <h3 className="font-bold text-sm text-gray-900">{cat.name}</h3>
            <p className="text-[11px] text-gray-400 mt-1">Explore Items</p>
          </Link>
        ))}
      </div>
    </section>
  );
};
