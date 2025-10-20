// "use client";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationEllipsis,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
// } from "@/components/ui/pagination";
// const DafaultPagination = ({ meta, func }) => {
//   const { currentPage, pageCount } = meta;
//   if (pageCount <= 1) return null;
//   const generatePagination = (currentPage, pageCount) => {
//     let pages = [];

//     // Always show the first page
//     pages.push(1);

//     // If currentPage is far from the first page, show "..."
//     if (currentPage > 3) {
//       pages.push("...");
//     }

//     // Show currentPage, one before, and one after (if within range)
//     for (let i = Math.max(2, currentPage - 1); i <= Math.min(pageCount - 1, currentPage + 1); i++) {
//       pages.push(i);
//     }

//     // If currentPage is far from the last page, show "..."
//     if (currentPage < pageCount - 2) {
//       pages.push("...");
//     }

//     // Always show the last page
//     if (pageCount > 1) {
//       pages.push(pageCount);
//     }

//     return pages;
//   };
//   const pages = generatePagination(currentPage, pageCount);
//   console.log('currentPage', currentPage)
//   return (
//     <>
//       <Pagination>
//         <PaginationContent>
//           <PaginationItem className={currentPage === 1 ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}>
//             <PaginationPrevious isDisabled={currentPage === 1} onClick={() => func(currentPage - 1)} />
//           </PaginationItem>

//           {pages.map((page, index) =>
//             page === "..." ? <PaginationItem>
//               <PaginationEllipsis />
//             </PaginationItem> : (
//               <PaginationItem key={page}>
//                 <PaginationLink onClick={() => func(page)} isActive={currentPage === page}>
//                   {page}
//                 </PaginationLink>
//               </PaginationItem>
//             )
//           )}

//           {/* <PaginationItem>
//             <PaginationLink href="#">1</PaginationLink>
//           </PaginationItem>
//           <PaginationItem>
//             <PaginationLink href="#" isActive>
//               2
//             </PaginationLink>
//           </PaginationItem>
//           <PaginationItem>
//             <PaginationLink href="#">3</PaginationLink>
//           </PaginationItem>
//           <PaginationItem>
//             <PaginationEllipsis />
//           </PaginationItem> */}
//           <PaginationItem className={currentPage >= pageCount ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}>
//             <PaginationNext onClick={() => { func(currentPage + 1) }}
//             />
//           </PaginationItem>
//         </PaginationContent>
//       </Pagination>
//     </>
//   );
// };

// export default DafaultPagination;



import { Button } from "@/components/ui/button";

const DefaultPagination = ({ meta, func }) => {
    const { page, pageCount } = meta;

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pageCount) {
            func(newPage);
        }
    };

    return (
        <div className="flex justify-center items-center gap-2 mt-5">
            {/* Previous Button */}
            <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="px-4 py-2"
            >
                Previous
            </Button>

            {/* Page Numbers */}
            {Array.from({ length: pageCount }, (_, i) => (
                <Button
                    key={i + 1}
                    variant={page === i + 1 ? "default" : "outline"} // Highlight active page
                    onClick={() => handlePageChange(i + 1)}
                    className="px-4 py-2"
                >
                    {i + 1}
                </Button>
            ))}

            {/* Next Button */}
            <Button
                variant="outline"
                disabled={page === pageCount}
                onClick={() => handlePageChange(page + 1)}
                className="px-4 py-2"
            >
                Next
            </Button>
        </div>
    );
};

export default DefaultPagination;
