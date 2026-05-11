import { useEffect, useState, useMemo } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const search = queryParams.get('search') || '';

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortOption, setSortOption] = useState<SortOption>('top_sales');
    const [currentPage, setCurrentPage] = useState(1);
    
    // Filters
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(0);

    // Map SortOption to API sort keys
    const apiSortMap: Record<string, string> = {
        'price_asc': 'price-asc',
        'price_desc': 'price-desc',
        'newest': 'newest',
        'top_sales': 'sold'
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                let currentCategories = categories;
                if (categories.length === 0) {
                    const catRes = await categoryApi.getAll();
                    currentCategories = catRes.data.data;
                    setCategories(currentCategories);
                }

                const cat = currentCategories.find(c => c.slug === slug);
                const filterId = slug ? cat?._id : undefined;

                const res = await productApi.getAll(
                    search, 
                    filterId, 
                    minPrice > 0 ? minPrice : undefined, 
                    maxPrice > 0 ? maxPrice : undefined,
                    apiSortMap[sortOption]
                );
                
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
    }, [slug, search, minPrice, maxPrice, sortOption]);

    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [products, currentPage]);

    const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
    const itemRangeStart = products.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const itemRangeEnd = Math.min(currentPage * ITEMS_PER_PAGE, products.length);
    const itemRange = `${itemRangeStart}-${itemRangeEnd}`;

    const breadcrumbItems = [
        { label: 'Danh mục', href: '/categories' },
        { label: slug ? (categories.find(c => c.slug === slug)?.name ?? 'Đang tải...') : 'Tất cả sản phẩm' },
    ];

    return (
        <div className="min-h-screen bg-[#F9FAFB] text-gray-900 selection:bg-[#C83B1E] selection:text-white">
            <div className="max-w-[1440px] mx-auto px-6 py-16">
                <Breadcrumb items={breadcrumbItems} />

                <div className="flex gap-12">
                    <FilterSideBar 
                        minPrice={minPrice} 
                        maxPrice={maxPrice} 
                        onPriceChange={(min, max) => {
                            setMinPrice(min);
                            setMaxPrice(max);
                            setCurrentPage(1);
                        }} 
                    />
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-4">
                                <div className="size-10 border-2 border-[#C83B1E] border-t-transparent rounded-full animate-spin" />
                                <p className="text-gray-500 text-sm font-medium">Đang tải sản phẩm...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-32 gap-3">
                                <p className="text-red-500 font-semibold">Không thể tải sản phẩm</p>
                                <p className="text-gray-600 text-sm">{error}</p>
                            </div>
                        ) : (
                            <>
                                <SortHeader
                                    totalItems={products.length}
                                    categoryName={slug ? (categories.find(c => c.slug === slug)?.name ?? 'Đang tải...') : 'Tất cả sản phẩm'}
                                    currentSort={sortOption}
                                    onSortChange={setSortOption}
                                    itemRange={itemRange}
                                />
                                {products.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
                                        <p className="text-2xl font-black text-gray-700">Không tìm thấy sản phẩm nào</p>
                                        <p className="text-gray-600 text-sm">
                                            Không có sản phẩm nào trong <span className="text-[#C83B1E]">{slug ? (categories.find(c => c.slug === slug)?.name ?? 'danh mục này') : 'bộ sưu tập này'}</span> phù hợp với tiêu chí của bạn.
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