"use client";
import { useAppSelector } from "@/provider/Store";
import { useEffect, useState } from "react";
import axiosInstance from "@/config/axios.config";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getFilePath } from "@/config/file.path";

const WelcomeBlock = () => {
  const user = useAppSelector((state) => state.user);
  const userId = user?.id;
  const [userHeaderData, setUserHeaderData] = useState({});
  const [userData, setUserData] = useState([
    { title: "Rank", total: 0 },
    { title: "Points", total: 0 },
  ]);
  const [loading, setLoading] = useState(true);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getUserDetails = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/api/users?filters[id]=${userId}&populate[profileImage][fields][0]=url&populate[profileImage][fields][1]=name`
      );

      if (data && data.length > 0) {
        setUserHeaderData(data[0]);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const getCurrentUserRating = async () => {
    try {
      let allActivities = [];
      let page = 1;
      let totalPages = 1;
      const month = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      while (page <= totalPages) {
        const { data } = await axiosInstance.get(
          `/api/activities?filters[Month]=${monthNames[month]}&filters[Year]=${currentYear}&populate[user][populate]=true&sort=Points:desc&pagination[page]=${page}`
        );

        const activities = data?.data || [];
        totalPages = data?.meta?.pagination?.pageCount || 1;
        allActivities = [...allActivities, ...activities];
        page++;
      }
      const sortedData = allActivities.sort((a, b) => b.Points - a.Points);
      const userIndex = sortedData.findIndex(activity => activity.user?.id === userId);
      const user = sortedData.find(activity => activity.user?.id === userId);
      setUserData([
        { title: "Rank", total: user.Points !== 0 && userIndex !== -1 ? userIndex + 1 : 0 },
        { title: "Points", total: allActivities?.[userIndex]?.Points || 0 },
      ]);
    } catch (error) {
      console.error("Error fetching user rating:", error);
    }
  };
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([getUserDetails(), getCurrentUserRating()]);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  return (
    <div className="w-full h-full bg-primary rounded-md flex p-6 relative">
      <div className="flex-1">
        <div className="text-lg md:text-2xl font-semibold text-primary-foreground mb-6">
          Welcome<br />
          {userHeaderData?.firstName || "User"} {userHeaderData?.lastName || ""}
        </div>

        {userData.some(item => item.total > 0) ? (
          <div className="flex gap-4 flex-row">
            {userData
              .filter(item => item.total > 0)
              .map((item, index) => (
                <div
                  key={`welcome-text-${index}`}
                  className="flex items-center max-w-auto sm:w-full 2xl:w-auto p-3 rounded-md border border-current bg-transparent h-auto px-4 py-[10px]"
                >
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-primary-foreground">
                      {item.title} {item.total}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) :  null }
      </div>

      <div className="2xl:absolute mobileAvatar md:relative 2xl:top-4 ltr:right-4 rtl:left-4 ltr:md:right-[14%] rtl:md:left-[30%] ltr:md:bottom-0 ltr:2xl:right-4 rtl:2xl:left-10 w-[100px]">
        <Avatar className="2xl:h-28 2xl:w-28 sm:w-16 sm:h-16">
          <AvatarImage
            src={userHeaderData?.profileImage?.url ? getFilePath(userHeaderData.profileImage.url) : ""}
            alt="user"
          />
          <AvatarFallback className="rounded uppercase text-2xl font-bold bg-success/30 text-white">
            {`${userHeaderData?.firstName?.slice(0 ,2) }`.toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default WelcomeBlock;
