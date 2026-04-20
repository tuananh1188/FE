import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { productApi, type Product } from '@/modules/dashboard/api/product.api';
import { categoryApi, type Category } from '@/shared/api/category.api';
import { FilterSideBar } from './components/FilterSideBar';
import { SortHeader, type SortOption } from './components/SortHeader';
import { ProductList } from './components/ProductList';
import { Pagination } from './components/Pagination';
import { Breadcrumb } from './components/Breadcrumb';

const ITEMS_PER_PAGE = 24;

export default function ProductPage() {
    const { slug } = useParams<{ slug: string }>();

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>('top_sales');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Find active category
    const activeCategory = useMemo(() => 
        categories.find(c => c.slug === slug),
    [categories, slug]);

    const categoryName = activeCategory?.name ?? 'All Products';
    const categoryId = activeCategory?._id;

    // Explicitly track filter/sort changes without triggering endless useEffects
    const prevSlug = useRef(slug);
    const prevSort = useRef(sortOption);

    useEffect(() => {
        if (prevSlug.current !== slug || prevSort.current !== sortOption) {
            setCurrentPage(1);
            prevSlug.current = slug;
            prevSort.current = sortOption;
        }
    }, [slug, sortOption]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch categories if not already fetched
                let currentCategories = categories;
                if (categories.length === 0) {
                    const catRes = await categoryApi.getAll();
                    currentCategories = catRes.data.data;
                    setCategories(currentCategories);
                }

                // Find category ID from slug
                const cat = currentCategories.find(c => c.slug === slug);
                const filterId = slug ? cat?._id : undefined;

                const res = await productApi.getAll(undefined, filterId);
                if (res.data.success) {
                    setProducts(res.data.data);
                }
            } catch (err: any) {
                setError(err.message ?? 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [slug]); // re-fetch khi đổi category

    const sortedProducts = useMemo(() => {
        let sorted = [...products];
        if (sortOption === 'price_asc') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sortOption === 'price_desc') {
            sorted.sort((a, b) => b.price - a.price);
        } else if (sortOption === 'newest') {
            sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else if (sortOption === 'top_sales') {
            sorted.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
        }
        return sorted;
    }, [products, sortOption]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedProducts, currentPage]);

    const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
    const itemRangeStart = sortedProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const itemRangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, sortedProducts.length);
    const itemRange = `${itemRangeStart}-${itemRangeEnd}`;

    const breadcrumbItems = [
        { label: 'Categories', href: '/categories' },
        { label: categoryName },
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-gray-900 selection:bg-[#C83B1E] selection:text-white">
            <div className="max-w-[1440px] mx-auto px-6 py-16">
                {/* Breadcrumb */}
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex gap-12">
                    <FilterSideBar />
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-4">
                                <div className="size-10 border-2 border-[#C83B1E] border-t-transparent rounded-full animate-spin" />
                                <p className="text-gray-500 text-sm font-medium">Loading products...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-3">
                                <p className="text-red-500 font-semibold">Failed to load products</p>
                                <p className="text-gray-600 text-sm">{error}</p>
                            </div>
                        ) : (
                            <>
                                <SortHeader
                                    totalItems={sortedProducts.length}
                                    categoryName={categoryName}
                                    currentSort={sortOption}
                                    onSortChange={setSortOption}
                                    itemRange={itemRange}
                                />
                                {sortedProducts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
                                        <p className="text-2xl font-black text-gray-700">No products found</p>
                                        <p className="text-gray-600 text-sm">
                                            There are no products in <span className="text-[#C83B1E]">{categoryName}</span> yet.
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        <ProductList products={paginatedProducts.map(p => ({
                                            id: p._id,
                                            name: p.name,
                                            images: p.images,
                                            price: p.price,
                                            originalPrice: p.originalPrice,
                                            discount: p.discount,
                                            soldPercentage: p.soldPercentage,
                                            totalSold: p.totalSold,
                                        }))} />
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            onPageChange={(page) => {
                                                setCurrentPage(page);
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                        />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}