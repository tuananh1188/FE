import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    if (totalPages <= 1) return null;

    // Build page numbers to show: always first, last, current ±1, with ellipsis
    const getPages = (): (number | '...')[] => {
        const pages: (number | '...')[] = [];
        const delta = 1;

        const range: number[] = [];
        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        pages.push(1);
        if (range[0] > 2) pages.push('...');
        pages.push(...range);
        if (range[range.length - 1] < totalPages - 1) pages.push('...');
        if (totalPages > 1) pages.push(totalPages);

        return pages;
    };

    return (
        <div className="mt-16 mb-8 flex justify-center items-center gap-2">
            {/* Previous Button */}
            <button 
                type="button"
                onClick={(e) => { e.preventDefault(); onPageChange(currentPage - 1); }}
                disabled={currentPage === 1}
                className="size-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
                <ChevronLeft className="size-5 text-gray-400 group-hover:text-gray-700" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1.5">
                {getPages().map((page, index) => {
                    const isActive = page === currentPage;
                    const isDots = page === "...";
                    if (isDots) {
                        return (
                            <span key={`dots-${index}`} className="w-10 text-center text-gray-400 font-bold select-none">{page}</span>
                        )
                    }
                    return (
                        <button 
                            key={`page-${page}`} 
                            type="button"
                            onClick={(e) => { e.preventDefault(); onPageChange(page as number); }}
                            className={`size-10 rounded-xl border text-sm font-bold transition-all shadow-sm ${isActive ? 'bg-[#C83B1E] border-[#C83B1E] text-white shadow-[#C83B1E]/20' : 'bg-white border-gray-200 text-gray-600 hover:text-[#C83B1E] hover:border-[#C83B1E]/30 hover:bg-red-50'}`}
                        >
                            {page}
                        </button>
                    )
                })}
            </div>

            {/* Next Button */}
            <button 
                type="button"
                onClick={(e) => { e.preventDefault(); onPageChange(currentPage + 1); }}
                disabled={currentPage === totalPages}
                className="size-10 rounded-xl border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
            >
                <ChevronRight className="size-5 text-gray-400 group-hover:text-gray-700" />
            </button>
        </div>
    )
}