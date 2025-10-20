'use client'
import { Provider } from "react-redux"
import { store } from "./Store"
import { useRef } from "react"

export default function StoreProvider({ children }) {
    const storeRef = useRef()
    if (!storeRef.current) {
        // Create the store instance the first time this renders
        storeRef.current = store
    }
    return <Provider store={storeRef.current}>{children}</Provider>
}