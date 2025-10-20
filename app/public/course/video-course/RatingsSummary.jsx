import React, { useEffect, useState } from "react";
import axiosInstance from "@/config/axios.config";
import { Progress } from "@/components/ui/progress";
import { Rating } from "@/components/ui/rating";

const RatingsSummary = ({ refresh, courseDocId }) => {
  const [ratingsData, setRatingsData] = useState(null);

  // Fetch ratings data
  const fetchRatings = async () => {
    try {
      const { data } = await axiosInstance({
        //http://localhost:1337/api/ratings?filters[course][documentId][$eq]=zss3g6yaagqz4t3usk34kr76
        url: `/api/ratings?filters[course][documentId][$eq]=${courseDocId}`,
        method: "GET",
      });
      const ratings = data.data || []; // Default to an empty array if no data
      setRatingsData(processRatings(ratings));
    } catch (error) {
      console.error("Error fetching ratings:", error);
      setRatingsData(processRatings([])); // Set default values on error
    }
  };

  // Process ratings data
  const processRatings = (ratings) => {
    const ratingsCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    ratings.forEach((entry) => {
      const rate = entry.rate || 0; // Default rate to 0 if missing
      if (rate in ratingsCount) {
        ratingsCount[rate] += 1;
      }
      totalRating += rate;
    });

    const totalReviews = Object.values(ratingsCount).reduce((sum, count) => sum + count, 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    return {
      ratingsCount,
      totalReviews,
      averageRating: averageRating.toFixed(1), // Default to "0.0"
      averageRatingPercentage: totalReviews > 0 ? ((averageRating / 5) * 100).toFixed(1) : "0.0", // Default to "0.0%"
    };
  };

  // Call fetchRatings when component mounts
  useEffect(() => {
    fetchRatings();
  }, [refresh]);

  if (!ratingsData) return <p>Loading...</p>;

  const { ratingsCount, totalReviews, averageRating, averageRatingPercentage } = ratingsData;

  return (

    <div className="grid grid-cols-12 items-top mb-6 bg-[#f6f6f6] dark:bg-[#242424] p-6 rounded-md">

      <div className="col-span-12 lg:col-span-12 mb-6">

        <h2 className="text-5xl font-semibold"> {averageRating} </h2>
        
        <Rating
          style={{ maxWidth: 150 }}
          itemStyles={{
            boxBorderWidth: 0,
            activeFillColor: ['#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e'],
            inactiveFillColor: '#dddddd',
          }}
          className="space-x-1"
          value={averageRating}
          readOnly
        />

        <h3>Overall Rating</h3>

      </div>

      {/* <p>Course Rating</p> */}

      <div className="col-span-12 lg:col-span-12">
        {Object.entries(ratingsCount).sort(([a], [b]) => b - a) // Sort in descending order by stars
          .map(([stars, count]) => {
            const percentage = totalReviews > 0 ? ((count / totalReviews) * 100).toFixed(1) : "0.0";
            return (

              <div className="grid grid-cols-12 items-center gap-4 mb-2" key={stars}>

                <div className="col-span-12 lg:col-span-8">
                  <Progress value={percentage} />
                </div>

                <div className="flex flex-row col-span-12 lg:col-span-4 gap-2 items-center">
                  <span className="">
                    <Rating
                      style={{ maxWidth: 140 }}
                      itemStyles={{
                        boxBorderWidth: 0,
                        activeFillColor: ['#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e'],
                        inactiveFillColor: '#dddddd',
                      }}
                      className="space-x-1"
                      value={stars}
                      readOnly
                    />
                  </span>
                  <span className="">{percentage}%</span>
                </div>

              </div>

            );
          })}

        {/* <p>Total Reviews: {totalReviews}</p> */}

      </div>



    </div>


  );
};

export default RatingsSummary;
