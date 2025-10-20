"use client";
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import AddReviewsPage from './AddReviewsPage';
import { Card } from '@/components/ui/card';
import axiosInstance from '@/config/axios.config';
import { Rating } from "@/components/ui/rating";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import RatingsSummary from './RatingsSummary';
import { usePathname } from 'next/navigation'
import { Label } from "@/components/ui/label";
import { useSelector } from 'react-redux';
import { getFilePath } from '@/config/file.path';
const ReviewsPage = ({ course }) => {
    console.log("course123", course.documentId);
    const pathname = usePathname()
    console.log("123456", pathname);
    // Check if the path contains "/public/course/"
    const hideDivs = pathname.includes("/video-course/");


    const [reviewsData, setReviewsData] = useState([]);
    // const [trainersRatings, setTrainersRatings] = useState({});
    const [trainerRatings, setTrainerRatings] = useState({});
    const [loading, setLoading] = useState(false);
    const [meta, setMeta] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 3; // Number of reviews per page
    const [refreshRatings, setRefreshRatings] = useState(0); // Trigger for refreshing ratings
    const [showForm, setShowForm] = useState(false)
    const [rating, setRating] = useState(0);
    const user = useSelector((state) => state.user);
    const formatDate = (dateString) => {
        const options = { month: 'short', day: '2-digit', year: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    };

    const getReviews = async (page, reset = false) => {
        setLoading(true);
        try {
            const { data } = await axiosInstance({
                ///api/ratings?filters[course][documentId][$eq]=zss3g6yaagqz4t3usk34kr76&populate[user][populate][profileImage][fields][0]=url&pagination[page]=1&pagination[pageSize]=3&sort[createdAt]=desc
                url: `/api/ratings?filters[course][documentId][$eq]=${course.documentId}&filters[trainer][$eq]&populate[user][populate][profileImage][fields][0]=url&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort[createdAt]=desc`,
                method: "GET",
            });

            // If reset is true, clear the reviews and set to the new data
            setReviewsData(reset ? data.data : (prev) => [...prev, ...data.data]);
            setMeta(data.meta); // Update pagination meta
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (meta && currentPage < meta.pagination.pageCount) {
            setCurrentPage((prev) => prev + 1);
        }
    };

    useEffect(() => {
        getReviews(currentPage);
    }, [currentPage]);
    const fetchTrainerRatings = async () => {
        if (!user?.id || !course?.id) return;

        setLoading(true);
        try {
            const { data } = await axiosInstance({
                url: `/api/ratings?filters[course][id][$eq]=${course.id}&filters[user][id][$eq]=${user.id}&populate=trainer&status=published`,
                method: "GET",
            });

            // Map trainer ratings based on trainer ID
            const trainerRatingsMap = {};
            data.data.forEach((rating) => {
                if (rating.trainer) {
                    trainerRatingsMap[rating.trainer.id] = rating.rate;
                }
            });

            setTrainerRatings(trainerRatingsMap);
        } catch (error) {
            console.error("Error fetching trainer ratings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrainerRatings();
    }, [user, course]);
    const handleTrainerRating = async (trainerId, ratingValue) => {
        if (trainerRatings[trainerId]) return; // Prevent duplicate ratings

        try {
            await axiosInstance.post('/api/ratings', {
                data: {
                    rate: ratingValue,
                    trainer: trainerId,
                    course: course.id,
                    user: user.id,
                }
            });

            setTrainerRatings((prev) => ({
                ...prev,
                [trainerId]: ratingValue,
            }));

        } catch (error) {
            console.error("Error submitting trainer rating:", error);
        }
    };


    const handleReviewSubmit = () => {
        // Reset to the first page and fetch fresh data
        setReviewsData([]); // Clear reviews data
        setCurrentPage(1); // Reset pagination
        getReviews(1, true); // Fetch fresh data for the first page
        setRefreshRatings((prev) => prev + 1); // Increment to trigger RatingsSummary refresh
    };

    return (
        <>
            {hideDivs && (
                <>
                    <div className="grid grid-cols-12 items-center mb-6">

                        <div className="col-span-12 lg:col-span-8">
                            <h2 className='text-xl font-semibold'>Rate Your Learning Experience!</h2>
                        </div>
                        <div className="col-span-12 lg:col-span-4 text-right">
                            <Button color="warning" className="mb-3" onClick={() => setShowForm(!showForm)}>Write a Review + </Button>
                        </div>

                    </div>

                    <div className="grid grid-cols-12">

                        <div className="col-span-12 lg:col-span-12">

                            {showForm ? <AddReviewsPage course={course} onSubmit={handleReviewSubmit} setShowForm={setShowForm} /> : ""}
                        </div>

                    </div>
                </>
            )}

            <div className="col-span-12 lg:col-span-9">
                {reviewsData.length ?
                    "" : <p className='text-base text-left'>No reviews yet! Be the first to share your thoughts on this course and help others make informed decisions.</p>}
            </div>

            <div className="grid grid-cols-12 items-top gap-6 mb-6">

            <div className="col-span-12 lg:col-span-9">
                <div className="col-span-12 lg:col-span-12">
                    {reviewsData.length > 0 && <RatingsSummary refresh={refreshRatings} courseDocId={course.documentId} />}
                </div>

                <div className="col-span-12 lg:col-span-12">


                    {/* Listing the Reviews */}
                    {loading && currentPage === 1 && <p>Loading Reviews...</p>}
                    <div className="mt-4 font-bold text-xl ">
                        {reviewsData.map((item, index) => (
                            <Card key={index} className="border-b shadow-none rounded-none px-5 mb-3 py-5">
                                <div className="flex flex-row gap-8">

                                    <div>
                                        <Avatar
                                            className="ring-1  h-14 w-14">
                                            <AvatarImage src={getFilePath(item.user?.profileImage?.url)} />

                                            <AvatarFallback className="rounded uppercase bg-success/30 text-success">
                                                {item?.user?.username?.slice(0, 2)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <div>
                                        <h3 className='text-xl font-semibold mb-1'>{item.user?.firstName} {item.user.lastName}</h3>
                                        <div className='flex flex-row gap-2'>
                                            <p>
                                                <Rating
                                                    style={{ maxWidth: 120 }}
                                                    itemStyles={{
                                                        boxBorderWidth: 0,
                                                        activeFillColor: ['#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e'],
                                                        inactiveFillColor: '#dddddd',
                                                    }}
                                                    className="space-x-1"
                                                    value={item.rate}
                                                    readOnly
                                                />
                                            </p>
                                            <p className='text-sm font-normal'>{formatDate(item.createdAt)}</p>
                                        </div>

                                        <p className='text-base font-normal mt-6'>{item.review}</p>

                                    </div>

                                </div>

                            </Card>
                        ))}
                    </div>

                </div>
            </div>    

                <div className="col-span-12 lg:col-span-3">
                    <h2 className="text-base font-semibold mb-4">Rate the Trainers</h2>
                    {course.instructors && course.instructors.length > 0 ? (
                        course.instructors.map((trainer) => (
                            <Card key={trainer.id} className="border-b shadow-none rounded-none px-5 mb-3 py-5">
                                <div className="flex flex-row gap-8">
                                    <Avatar className="ring-1 h-14 w-14">
                                        <AvatarImage src={trainer.profileImageUrl} />
                                        <AvatarFallback className="uppercase">{trainer?.firstName?.slice(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className='text-base font-semibold mb-1'>{trainer.firstName} {trainer.lastName}</h3>
                                        <div className="space-y-2">
                                            {/* <Label htmlFor={`rating-${trainer.id}`}>Your Rating:</Label> */}
                                            <Rating
                                                value={trainerRatings[trainer.id] || 0}
                                                onChange={(value) => handleTrainerRating(trainer.id, value)}
                                                isDisabled={trainerRatings[trainer.id] ? true : false}
                                            />
                                        </div>

                                        {trainerRatings[trainer.id] && (
                                            <p className="text-xs text-gray-500 mt-1">You have already rated this trainer.</p>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <p>No trainers assigned to this course yet.</p>
                    )}
                </div>

            </div>




            {/* Load More Button */}
            {meta && currentPage < meta.pagination.pageCount && (
                <div className="flex justify-center mt-4">
                    <Button
                        className="dark bg-muted px-4 py-3 text-foreground w-fit rounded-md mx-auto cursor-pointer hover:bg-primary-none"
                        onClick={handleLoadMore}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Load More"}
                    </Button>
                </div>
            )}
        </>
    );
};

export default ReviewsPage;
