import React, { useState, useEffect } from 'react';
import { Star, Send, User } from 'lucide-react';
import { getReviews, createReview } from '../api';
import { useStore } from '../context/StoreContext';
import Toastify from 'toastify-js';

const ReviewSection = ({ productId }: { productId: number }) => {
    const { user } = useStore();
    const [reviews, setReviews] = useState<any[]>([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);

    const loadReviews = async () => {
        try {
            const data = await getReviews(productId);
            setReviews(data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { loadReviews(); }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            Toastify({ text: "Vui lòng đăng nhập để đánh giá!", style: { background: "orange" } }).showToast();
            return;
        }
        if (!comment.trim()) return;

        setLoading(true);
        try {
            await createReview({
                user_id: user.id,
                product_id: productId,
                rating,
                comment
            });
            setComment('');
            loadReviews(); // Reload lại list
            Toastify({ text: "Đã gửi đánh giá!", style: { background: "green" } }).showToast();
        } catch (error) {
            Toastify({ text: "Lỗi khi gửi đánh giá", style: { background: "red" } }).showToast();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mt-12 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">Đánh giá & Nhận xét ({reviews.length})</h2>

            {/* Form viết đánh giá */}
            <div className="mb-8 bg-gray-50 p-6 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                    <span className="font-bold text-gray-700">Chọn mức độ:</span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setRating(star)} type="button">
                                <Star 
                                    size={24} 
                                    className={star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                                />
                            </button>
                        ))}
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="flex gap-4">
                    <input 
                        type="text" 
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder={user ? "Chia sẻ cảm nhận của bạn..." : "Đăng nhập để viết đánh giá..."}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500"
                        disabled={!user || loading}
                    />
                    <button 
                        type="submit" 
                        disabled={!user || loading}
                        className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                    >
                        <Send size={18}/> Gửi
                    </button>
                </form>
            </div>

            {/* Danh sách đánh giá */}
            <div className="space-y-6">
                {reviews.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                ) : (
                    reviews.map((rev) => (
                        <div key={rev.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                                        {rev.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{rev.username}</div>
                                        <div className="flex text-yellow-400 text-xs">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={12} className={i < rev.rating ? "fill-current" : "text-gray-200"} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(rev.created_at).toLocaleDateString('vi-VN')}
                                </span>
                            </div>
                            <p className="text-gray-600 ml-12">{rev.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewSection;