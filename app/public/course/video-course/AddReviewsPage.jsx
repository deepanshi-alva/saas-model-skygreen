import React, { useRef, useState } from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import axiosInstance from '@/config/axios.config';
import { useAppSelector } from "@/provider/Store";
import { Rating } from "@/components/ui/rating";

const AddReviewsPage = ({ course, onSubmit , setShowForm }) => {
    const user = useAppSelector((state) => state.user);
    const textareaRef = useRef(null);
    const defaultRows = 1;
    const maxRows = 10; // Max rows limit for the textarea

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [error, setError] = useState('');

    const handleInput = (e) => {
        const textarea = e.target;
        textarea.style.height = "auto";

        const style = window.getComputedStyle(textarea);
        const borderHeight = parseInt(style.borderTopWidth) + parseInt(style.borderBottomWidth);
        const paddingHeight = parseInt(style.paddingTop) + parseInt(style.paddingBottom);

        const lineHeight = parseInt(style.lineHeight);
        const maxHeight = maxRows ? lineHeight * maxRows + borderHeight + paddingHeight : Infinity;

        const newHeight = Math.min(textarea.scrollHeight + borderHeight, maxHeight);

        textarea.style.height = `${newHeight}px`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rating || rating < 1 || rating > 5) {
            setError('Please provide a rating between 1 and 5.');
            return;
        }

        try {
            const { data } = await axiosInstance({
                url: '/api/ratings',
                method: 'post',
                data: {
                    data: {
                        course: course.documentId, // Replace with dynamic course ID if needed
                        user: { id: user.id }, // Replace with dynamic user ID if needed
                        review,
                        rate: rating, // Rating managed by Rating component
                    },
                },
            });
            console.log(data);
            setRating(0); // Reset rating
            setReview(''); // Reset review
            setShowForm(false)
            // Notify the parent component (ReviewsPage) to refresh the reviews
            onSubmit();
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4  mb-6">
            <div className="space-y-2 mb-3">
                <Label className="text-base" htmlFor="rating">Rate the Course<span className="text-red-500">*</span></Label>
                <Rating
                    style={{ maxWidth: 250 }}
                    itemStyles={{
                        boxBorderWidth: 0,
                        activeFillColor: ['#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e'],
                        inactiveFillColor: '#dddddd',
                    }}
                    className="space-x-1.5"
                    value={rating}
                    onChange={setRating} // Update rating state directly
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <div className="space-y-2">
                <Label className="text-base" htmlFor="textarea-19">Write your review here<span className="text-red-500">*</span></Label>
                <Textarea
                    id="textarea-19"
                    placeholder="Share details of your experience"
                    ref={textareaRef}
                    onChange={(e) => {
                        setReview(e.target.value);
                        handleInput(e);
                    }}
                    value={review}
                    rows={defaultRows}
                    className="min-h-[100px] resize-none text-base text-default-700"
                    required
                />
            </div>
            <button
                type="submit"
                className="bg-primary text-white text-base px-4 py-2 rounded-md"
            >
                Submit
            </button>
        </form>
    );
};

export default AddReviewsPage;
