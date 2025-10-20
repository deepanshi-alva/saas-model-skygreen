import toast from "react-hot-toast";
import axiosInstance from "@/config/axios.config";

const handleError = (error, message) => {
  console.error(message, error);
  toast.error(error?.response?.data?.error?.message || message);
  return null;
};

export const getAllCourses = async () => {
  try {
    const { data } = await axiosInstance({
      url: "/api/courses",
      method: "GET",
    });
    return data.data;
  } catch (error) {
    console.log(error);
  }
};

export const getSingleCourseRecommendation = async (courseRecDocId) => {
  try {
    const { data } = await axiosInstance({
      url: `/api/course-recommends/${courseRecDocId}?populate=*`,
      method: "GET",
    });
    return data.data;
  } catch (error) {
    console.log(error);
  }
};

export const getCourseRecProgress = async (userId, courseDocId) => {
  try {
    const { data } = await axiosInstance({
      url: `/api/course-enrollments?filters[user][id][$eq]=${userId}&filters[course][documentId][$eq]=${courseDocId}`,
      method: "GET",
    });
    return data.data[0];
  } catch (error) {
    console.log(error);
  }
};
