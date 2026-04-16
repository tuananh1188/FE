import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
    return (
        <nav aria-label="breadcrumb" className="flex items-center gap-1.5 mb-8">
            <Link
                to="/"
                className="flex items-center gap-1 text-gray-500 hover:text-[#C83B1E] transition-colors text-xs font-medium"
            >
                <Home className="size-3.5" />
                <span>Home</span>
            </Link>

            {items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (
                    <span key={index} className="flex items-center gap-1.5">
                        <ChevronRight className="size-3 text-gray-300 flex-shrink-0" />
                        {isLast || !item.href ? (
                            <span
                                className={`text-xs font-semibold ${
                                    isLast ? 'text-[#C83B1E]' : 'text-gray-500'
                                }`}
                            >
                                {item.label}
                            </span>
                        ) : (
                            <Link
                                to={item.href}
                                className="text-xs font-medium text-gray-500 hover:text-[#C83B1E] transition-colors"
                            >
                                {item.label}
                            </Link>
                        )}
                    </span>
                );
            })}
        </nav>
    );
};
