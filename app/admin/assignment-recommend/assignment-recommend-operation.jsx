import toast from "react-hot-toast";
import axiosInstance from "@/config/axios.config";

const handleError = (error, message) => {
    console.error(message, error);
    toast.error(error?.response?.data?.error?.message || message);
    return null;
};

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

export const getAllCourses = async () => {
    try {
        const { data } = await axiosInstance({
            url: '/api/assignments',
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
            url: `/api/assigment-recommends/${courseRecDocId}?populate=*`,
            method: 'GET'
        })
        console.log("data afterpapulate",data.data)
        return data.data
    } catch (error) {
        console.log(error)
    }
}


export const updateCourseRecommendation = async (courseRecDocId, courseRecData) => {
    console.log("update mode begin", courseRecData);
    try {
        const { data } = await axiosInstance({
            url: `/api/assigment-recommends/${courseRecDocId}`,
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
            url: `/api/assigment-recommends/${courseRecDocId}`,
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
            url: `/api/attempt-contents?filters[user][id][$eq]=${userId}&filters[assignment][documentId][$eq]=${courseDocId}`,
            method: 'GET'
        })
        console.log("this is assignment details", data.data[0]);
        return data.data[0];
    } catch (error) {
        console.log(error)
    }
}
