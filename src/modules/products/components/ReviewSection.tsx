import { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, Send, User, Loader2, AlertCircle } from 'lucide-react';
import { reviewApi, type Review } from '../api/review.api';
import { authApi } from '@/modules/auth/api/auth.api';
import { tokenStore } from '@/modules/auth/store/token.store';
import { toast } from 'sonner';
import type { CurrentUser } from '@/modules/auth/types/auth.types';

interface ReviewSectionProps {
    productId: string;
    productRating: number;
    reviewCount: number;
    onRatingUpdated: (newRating: number, newCount: number) => void;
}

function StarRating({
    value,
    onChange,
    readonly = false,
    size = 18,
}: {
    value: number;
    onChange?: (v: number) => void;
    readonly?: boolean;
    size?: number;
}) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                >
                    <Star
                        size={size}
                        className={`transition-colors ${
                            star <= (hovered || value)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-200 fill-gray-200'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
    const pct = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500 w-4 text-right">{label}</span>
            <Star size={10} className="text-amber-400 fill-amber-400 flex-shrink-0" />
            <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-gray-400 w-5 text-right">{count}</span>
        </div>
    );
}

export function ReviewSection({ productId, productRating, reviewCount, onRatingUpdated }: ReviewSectionProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState('');
    const [hasReviewed, setHasReviewed] = useState(false);

    const isLoggedIn = !!tokenStore.get();

    const fetchReviews = useCallback(async () => {
        try {
            setLoading(true);
            const res = await reviewApi.getByProduct(productId);
            if (res.data.success) {
                setReviews(res.data.data);
            }
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    // Fetch current user to detect if already reviewed
    useEffect(() => {
        if (!isLoggedIn) return;
        authApi.getMe().then((res: any) => {
            const user = res.data?.data ?? res.data?.user ?? null;
            setCurrentUser(user);
        }).catch(() => {});
    }, [isLoggedIn]);

    // Check if current user already reviewed
    useEffect(() => {
        if (!currentUser || reviews.length === 0) return;
        const found = reviews.find(r => r.user._id === currentUser._id);
        if (found) {
            setHasReviewed(true);
            setMyRating(found.rating);
            setMyComment(found.comment);
        }
    }, [currentUser, reviews]);

    // Distribution counts per star
    const distribution = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((r) => r.rating === star).length,
    }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (myRating === 0) {
            toast.error('Vui lòng chọn số sao trước khi gửi.');
            return;
        }
        try {
            setSubmitting(true);
            const res = await reviewApi.create({ productId, rating: myRating, comment: myComment });
            if (res.data.success) {
                toast.success('Cảm ơn bạn đã đánh giá sản phẩm!');
                setHasReviewed(true);
                await fetchReviews();
                // Recalculate from updated reviews list
                const updated = await reviewApi.getByProduct(productId);
                if (updated.data.success) {
                    const all = updated.data.data;
                    const avg = all.length > 0
                        ? Math.round((all.reduce((s, r) => s + r.rating, 0) / all.length) * 10) / 10
                        : 0;
                    onRatingUpdated(avg, all.length);
                }
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message ?? 'Đã có lỗi xảy ra. Vui lòng thử lại.';
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateString));
    };

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    };

    return (
        <div className="border-t border-gray-100 px-6 py-8">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <MessageSquare size={20} className="text-[#C83B1E]" />
                <h3 className="text-lg font-bold text-gray-900">Đánh giá sản phẩm</h3>
            </div>

            {/* Overview */}
            {reviewCount > 0 && (
                <div className="bg-gray-50 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row gap-6 items-start">
                    {/* Score */}
                    <div className="flex flex-col items-center justify-center min-w-[110px]">
                        <span className="text-5xl font-black text-[#C83B1E] leading-none">{productRating.toFixed(1)}</span>
                        <StarRating value={Math.round(productRating)} readonly size={16} />
                        <span className="text-xs text-gray-400 mt-1">{reviewCount} đánh giá</span>
                    </div>
                    {/* Bars */}
                    <div className="flex-1 space-y-1.5 w-full">
                        {distribution.map(({ star, count }) => (
                            <RatingBar key={star} label={String(star)} count={count} total={reviewCount} />
                        ))}
                    </div>
                </div>
            )}

            {/* Review Form */}
            {isLoggedIn ? (
                hasReviewed ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
                        <span>✓</span>
                        <span>Bạn đã đánh giá sản phẩm này. Cảm ơn bạn!</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-2xl p-5 mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-3">Viết đánh giá của bạn</p>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-sm text-gray-500">Số sao:</span>
                            <StarRating value={myRating} onChange={setMyRating} size={22} />
                            {myRating > 0 && (
                                <span className="text-xs text-amber-500 font-medium">
                                    {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'][myRating]}
                                </span>
                            )}
                        </div>
                        <textarea
                            value={myComment}
                            onChange={(e) => setMyComment(e.target.value)}
                            placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này... (không bắt buộc)"
                            rows={3}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C83B1E]/20 focus:border-[#C83B1E] transition-all resize-none bg-white"
                        />
                        <div className="flex justify-end mt-3">
                            <button
                                type="submit"
                                disabled={submitting || myRating === 0}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[#C83B1E] text-white rounded-xl text-sm font-semibold hover:bg-[#b03318] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-[#C83B1E]/20 cursor-pointer"
                            >
                                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
                            </button>
                        </div>
                    </form>
                )
            ) : (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-6">
                    <AlertCircle size={18} className="text-blue-500 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                        <a href="/login" className="font-semibold underline hover:text-blue-900">Đăng nhập</a>
                        {' '}để viết đánh giá cho sản phẩm này.
                    </p>
                </div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="flex items-center justify-center py-10 gap-3 text-gray-400">
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-sm">Đang tải đánh giá...</span>
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <MessageSquare size={36} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div key={review._id} className="flex gap-3">
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {review.user.avatarUrl ? (
                                    <img
                                        src={review.user.avatarUrl}
                                        alt={review.user.displayName}
                                        className="w-9 h-9 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C83B1E] to-orange-400 flex items-center justify-center text-white text-xs font-bold">
                                        {getInitials(review.user.displayName)}
                                    </div>
                                )}
                            </div>
                            {/* Content */}
                            <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <div>
                                        <span className="text-sm font-semibold text-gray-800">
                                            {review.user.displayName || 'Người dùng ẩn danh'}
                                        </span>
                                        <div className="mt-0.5">
                                            <StarRating value={review.rating} readonly size={12} />
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 flex-shrink-0 mt-0.5">
                                        {formatDate(review.createdAt)}
                                    </span>
                                </div>
                                {review.comment && (
                                    <p className="text-sm text-gray-600 leading-relaxed mt-1">{review.comment}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
