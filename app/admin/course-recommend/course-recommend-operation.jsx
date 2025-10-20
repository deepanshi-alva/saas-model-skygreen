import toast from "react-hot-toast";
import axiosInstance from "@/config/axios.config";

const handleError = (error, message) => {
    console.error(message, error);
    toast.error(error?.response?.data?.error?.message || message);
    return null;
};

//  http://localhost:1337/api/users?filters[firstName][$containsi]=gaurav&filters[lastName][$containsi]=ar
export const fetchAllUsers = async () => {

    try {
        const { data } = await axiosInstance({
            url: "/api/users?populate=*",
            method: "GET"
        })

        if (data.length === 0) {
            toast.success("No users available");
            return [];
        }
        return data.map((ele) => ({ ...ele, name: `${ele.firstName ? ele.firstName + ' ' + (ele.lastName || '') : ''}` }));
    } catch (error) {
        return handleError(error, "Failed to fetch users");
    }
};

// http://localhost:1337/api/courses?filters[title][$containsi]=course
export const getAllCourses = async () => {
    try {
        const { data } = await axiosInstance({
            url: '/api/courses',
            method: 'GET'
        })
        return data.data
    } catch (error) {
        console.log(error)
    }
}
 
export const getSingleCourseRecommendation = async (courseRecDocId) => {
    try {
        const { data } = await axiosInstance({
            url: `/api/course-recommends/${courseRecDocId}?populate=*`,
            method: 'GET'
        })
        return data.data
    } catch (error) {
        console.log(error)
    }
}


export const updateCourseRecommendation = async (courseRecDocId, courseRecData) => {
    try {
        const { data } = await axiosInstance({
            url: `/api/course-recommends/${courseRecDocId}`,
            method: "PUT",
            data: courseRecData,
        });

        if (data) {
            return true;
        }
    } catch (error) {
        handleError(error, "Failed to update course recommendation");
        return false;
    }
};


export const deleteCourseRecommendation = async (courseRecDocId) => {

    try {
        const { data } = await axiosInstance({
            url: `/api/course-recommends/${courseRecDocId}`,
            method: "DELETE",
        },)
        return data;
    } catch (error) {
        return handleError(error, "failed to delete course recommendation");
    }
};


export const getCourseRecProgress = async (userId, courseDocId) => {
    try {
        const { data } = await axiosInstance({
            url: `/api/course-enrollments?filters[user][id][$eq]=${userId}&filters[course][documentId][$eq]=${courseDocId}`,
            method: 'GET'
        })
        return data.data[0];
    } catch (error) {
        console.log(error)
    }
}
