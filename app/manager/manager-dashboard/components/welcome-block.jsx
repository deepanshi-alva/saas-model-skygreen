"use client"
import Image from "next/image";
import admin from "@/public/images/all-img/admin.png"
import { useAppSelector } from "@/provider/Store";
import { useEffect, useState } from "react";
import axiosInstance from '@/config/axios.config';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFilePath } from "../../../../config/file.path";

const WelcomeBlock = () => {
  const user = useAppSelector((state) => state.user);
  const userId = user.id
  const [userHeaderData, setUserHeaderData] = useState({})
  const [userData, setUserData] = useState([
    { title: "Rank", total: null },
    { title: "Points", total: null },
  ]); // Initial state with placeholders for Rank and Points // To store the score (points)
  console.log("userData ", userData);

  const data = [
    {
      title: "Rank",
      total: "129"
    },
    {
      title: "Points",
      total: "300"
    },
  ]

  const getUserDetails = async () => {

    try {
      const { data } = await axiosInstance({
        url: `/api/users?filters[id]=${user.id}&populate[profileImage][fields][0]=url&populate[profileImage][fields][1]=name`,
        method: "GET",
      });
      console.log("getUserDetails", data[0]);
      setUserHeaderData(data[0])
    } catch (error) {
      console.log(error);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  async function getCurrentUserRating() {
    const allActivities = [];
    let page = 1;
    let totalPages = 1;
    const month = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Loop through all pages
    while (page <= totalPages) {
      const { data } = await axiosInstance({
        url: `/api/activities?filters[Month]=${monthNames[month]}&filters[Year]=${currentYear}&populate[user][populate]=true&sort=Points:desc&pagination[page]=${page}`,
        method: 'get',
      });
      const activities = data?.data || [];
      totalPages = data?.meta?.pagination?.pageCount || 1;  // Get total pages
      allActivities.push(...activities);  // Add activities to the combined list

      page++;  // Increment to the next page
    }
    const userIndex = allActivities.findIndex(activity => activity.user?.id === userId);
    // Add rank to each activity based on the sorted points
    setUserData([
      { title: "Rank", total: userIndex + 1 },   // Set rank
      { title: "Points", total: allActivities?.[userIndex]?.Points || 0 }, // Set points
    ]);
    // const activitiesWithRank = allActivities.map((activity, index) => ({
    //   ...activity,
    //   rank: index + 1  // Rank is 1-based index
    // }));

    // console.log(activitiesWithRank);  // Final combined data with ranks
  }

  useEffect(() => {
    getUserDetails()
    getCurrentUserRating()
  }, [])


  return (
    <div className="w-full h-full bg-primary rounded-md  flex p-6 relative " >
      <div className="flex-1 ">
        <div className="text-lg md:text-2xl font-semibold text-primary-foreground mb-6">
          Welcome<br />
          {userHeaderData?.firstName} {userHeaderData.lastName}
        </div>

        <div className=" flex flex-col gap-4 sm:flex-row ">
          {
            userData.map((item, index) => (
              <div
                key={`welcome-text-${index}`}
                className="flex items-center w-full max-w-[130px] p-3 rounded-md border border-current bg-transparent h-10 px-4 py-[10px]"
              >
                <div className="flex-1">
                  {/* <div className="text-xs font-semibold text-primary-foreground/80">{item.title} </div> */}
                  <div className="text-lg font-semibold text-primary-foreground">{item.title} {item.total}</div>
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <div className="absolute top-4  mobileAvatar ltr:right-4 rtl:left-4 ltr:md:right-[30%] rtl:md:left-[30%] ltr:md:bottom-5 ltr:2xl:right-10 rtl:2xl:left-10 w-[100px] ">
        {/* <Image src={`${process.env.}/${userHeaderData?.profileImage?.url}`} alt="user" className="w-full object-cover" width={100} height={100} /> */}
        <Avatar
          className="ring-1 ring-background ring-offset-[2px] ring-offset-background h-28 w-28">
          <AvatarImage src={getFilePath(userHeaderData?.profileImage?.url)}/>
        </Avatar>
      </div>

    </div>
  );
};

export default WelcomeBlock;