import { configureStore } from "@reduxjs/toolkit"
import { useDispatch, useSelector } from "react-redux"
import { userReducer } from "./slice/UserSlice"
import siteSettingReducer from "./slice/siteSettingSlice";
export const store = configureStore({
    reducer: { user: userReducer, siteSetting: siteSettingReducer, }
})

export const useAppDispatch = () => useDispatch()
export const useAppSelector = useSelector