import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

const SortHeader = ({ column, title }) => {
    return (
        <button
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900 transition"
        >
            {title}
            {column.getIsSorted() === "asc" ? (
                <ArrowUp className="h-4 w-4" />
            ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="h-4 w-4" />
            ) : null}
        </button>
    );
};

export default SortHeader;   