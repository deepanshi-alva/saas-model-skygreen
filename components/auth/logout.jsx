import axios from "axios";
import toast from "react-hot-toast";
import { setUser } from '@/provider/slice/UserSlice';

const logout = async (dispatch, push) => {
    const token = localStorage.getItem("token");
    const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

    try {
        if (!token) {
            toast.error("User not logged in");
            dispatch(setUser(null));
            return;
        }

        const { data } = await axios.post(`${STRAPI_URL}/api/logout`, { token });

        if (data) {
            localStorage.removeItem("token");
            dispatch(setUser(null));
            toast.success("Successfully logged out");
            push("/");
        }
    } catch (error) {
        console.error("Logout error:", error);
        toast.error("Failed to log out. Please try again.");
    }
};

export default logout;
