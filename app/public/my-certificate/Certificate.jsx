"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/config/axios.config";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { SortHeader } from "@/app/admin/assignment/SortHeader";
import ProjectList from "@/app/admin/course/ProjectList";
import { formatDateToIST } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Blank from "@/components/blank";
import { fetchSiteSetting } from "@/provider/slice/siteSettingSlice";
import { useDispatch, useSelector } from "react-redux";
import { getFilePath } from "../../../config/file.path";

const Page = () => {
  const [certificates, setCertificates] = useState([]);
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState([]);
  const [open, setOpen] = useState(false);
  const [certificateId, setCertificateId] = useState();

  const dispatch = useDispatch();
  const siteSetting = useSelector((state) => state.siteSetting);
  const { data, loading, error } = siteSetting || {};
  const user = useSelector((state) => state.user);

  const [meta, setMeta] = useState({
    page: 1,
    pageSize: data?.pageSize || 10,
    pageCount: 0,
    total: 0,
    currentPage: 1,
  });
  const [filterValue, setFilterValue] = useState("");
  const [emptyState, setEmptyState] = useState(false);

  useEffect(() => {
    dispatch(fetchSiteSetting());
  }, [dispatch]);

  useEffect(() => {
    getCertificateData(meta.currentPage);
  }, [meta.currentPage, meta.pageSize]);

  const debounce = (func, delay) => {
    let debounceTimer;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  useEffect(() => {
    debounce(() => getCertificateData(meta.currentPage), 400)();
  }, [filterValue]);

  const getCertificateData = async (pageNo = 1) => {
    try {
      const pageSize = meta.pageSize || 10;
      const queryParams = `pagination[page]=1&pagination[pageSize]=100&filters[user][id][$eq]=${user.id}`;

      const [attemptContentsRes, enrollmentsRes] = await Promise.all([
        axiosInstance.get(
          `/api/attempt-contents?${queryParams}&populate[0]=user&populate[1]=certificateLogo&populate[2]=certificate&populate[3]=assignment`
        ),
        axiosInstance.get(
          `/api/course-enrollments?${queryParams}&populate[0]=user&populate[1]=certificate_complection&populate[2]=certificate_enrollment&populate[3]=enrollCertificateLogoId&populate[4]=certificateCompletionLogoId&populate[5]=course`
        ),
      ]);

      console.log(
        "actual atttempt certificates",
        attemptContentsRes,
        "actual course certificate",
        enrollmentsRes
      );

      // Function to convert date and time to a sortable timestamp
      const parsePublishedAt = (publishedAt) => {
        if (!publishedAt?.date || !publishedAt?.time) return 0; // Handle missing values
        const dateStr = publishedAt.date.split("-").reverse().join("-"); // Convert to YYYY-MM-DD format
        const timeStr = publishedAt.time.toUpperCase(); // Ensure AM/PM format is correct
        return new Date(`${dateStr} ${timeStr}`).getTime(); // Convert to timestamp
      };

      const defaultLogo = "/images/defaultimage/logo.png";

      // Extract attempt-based certificates
      const attemptCertificates = (attemptContentsRes.data?.data || []).map(
        (cert) => ({
          id: cert.id,
          name: `${cert.assignment?.title} Assessment` || "N/A",
          type:
            cert?.total_marks >= cert?.assignment?.min_score ? "Pass" : "Fail",
          badgeLogo: cert.certificateLogo?.url
            ? getFilePath(cert.certificateLogo.url)
            : defaultLogo,
          certificateUrl: cert.certificate?.url
            ? getFilePath(cert.certificate.url)
            : null,
          publishedAt: formatDateToIST(cert.publishedAt),
          timestamp: parsePublishedAt(formatDateToIST(cert.publishedAt)),
        })
      );

      // Extract enrollment-based certificates
      const enrollmentCertificates = (enrollmentsRes.data?.data || []).map(
        (cert) => ({
          id: cert.id,
          name: cert.course?.title || "N/A",
          type: cert.Course_Status === "Completed" ? "Completion" : "null",
          badgeLogo: cert.enrollCertificateLogoId?.url
            ? getFilePath(cert.enrollCertificateLogoId.url)
            : cert.certificateCompletionLogoId?.url
            ? getFilePath(cert.certificateCompletionLogoId.url)
            : null,
          certificateUrl: cert.certificate_enrollment?.url
            ? getFilePath(cert.certificate_enrollment.url)
            : cert.certificate_complection?.url
            ? getFilePath(cert.certificate_complection.url)
            : null,
          publishedAt: formatDateToIST(cert.publishedAt),
          timestamp: parsePublishedAt(formatDateToIST(cert.publishedAt)),
        })
      );

      console.log("enrollmentsRes h kya bahi ", enrollmentsRes)

      // Calculate total items and page count from both APIs
      const totalItems =
        (attemptContentsRes.data.meta.pagination.total || 0) +
        (enrollmentsRes.data.meta.pagination.total || 0);

      const pageCount = Math.ceil(totalItems / pageSize);
      console.log("------page count--------", pageCount);

      // Combine certificates
      const combinedCertificates = [
        ...attemptCertificates,
        ...enrollmentCertificates,
      ]
        .filter((cert) => cert.certificateUrl)
        .sort((a, b) => b.timestamp - a.timestamp) // Sort by date (optional)
        .slice((pageNo - 1) * pageSize, pageNo * pageSize); // Slice according to pagination

      setCertificates(combinedCertificates);
      setEmptyState(combinedCertificates.length === 0);
      setMeta({
        page: pageNo,
        pageSize: pageSize,
        total: totalItems,
        pageCount: pageCount,
        currentPage: pageNo,
      });
      console.log("------------metaaaaaaaaa----------", meta);
    } catch (error) {
      console.error("Error fetching certificates:", error);
    }
  };

  console.log("combined certificates", certificates);

  async function downloadFromUrl(url, fileName) {
    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "download.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Failed to download file. Please try again.");
    }
  }

  const columns = [
    {
      accessorKey: "id",
      header: ({ column }) => <SortHeader column={column} title="ID" />,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("id")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "badgeLogo",
      header: ({ column }) => <SortHeader column={column} title="Badge" />,
      cell: ({ row }) => {
        const logoUrl = row.getValue("badgeLogo");
        return (
          <div className="flex justify-center">
            <img
              src={logoUrl}
              alt="Certificate Logo"
              className="w-12 h-12 rounded-full border border-gray-300 object-cover"
            />
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => <SortHeader column={column} title="Name" />,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("name")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: ({ column }) => <SortHeader column={column} title="Type" />,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("type")}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "publishedAt",
      header: ({ column }) => <SortHeader column={column} title="Issue Date" />,
      cell: ({ row }) => (
        <div className="flex gap-2">
          {row?.original?.publishedAt.date} {row?.original?.publishedAt.time}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const certificateUrl = row.original.certificateUrl;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="">
                <DropdownMenuItem
                  onClick={() => {
                    if (certificateUrl) {
                      window.open(certificateUrl, "_blank");
                    } else {
                      alert("Certificate not available!");
                    }
                  }}
                >
                  Preview
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    if (certificateUrl) {
                      downloadFromUrl(
                        certificateUrl,
                        `certificate_${row.original.id}.pdf`
                      );
                    } else {
                      alert("Certificate not available for download!");
                    }
                  }}
                >
                  Download
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  // const columns = [
  //     {
  //         accessorKey: "id",
  //         header: ({ column }) => <SortHeader column={column} title="ID" />,
  //         cell: ({ row }) => {
  //             const certificateUrl = row.original.certificateUrl;
  //             return certificateUrl ? (
  //                 <div className="flex gap-2">
  //                     <span className="max-w-[500px] truncate font-medium">
  //                         {row.getValue("id")}
  //                     </span>
  //                 </div>
  //             ) : null; // If no certificate URL, don't render anything
  //         },
  //     },
  //     {
  //         accessorKey: "badgeLogo",
  //         header: ({ column }) => <SortHeader column={column} title="Badge" />,
  //         cell: ({ row }) => {
  //             const certificateUrl = row.original.certificateUrl;
  //             const logoUrl = row.getValue("badgeLogo") || "/images/defaultimages/logo.PNG"; // Default image

  //             return certificateUrl ? (
  //                 <div className="flex justify-center">
  //                     <img
  //                         src={logoUrl}
  //                         alt="Certificate Logo"
  //                         className="w-12 h-12 rounded-full border border-gray-300 object-cover"
  //                         onError={(e) => {
  //                             e.target.onerror = null;
  //                             e.target.src = "/images/defaultimages/logo.PNG"; // Set fallback logo on error
  //                         }}
  //                     />
  //                 </div>
  //             ) : null; // If no certificate URL, don't render anything
  //         },
  //     },
  //     {
  //         accessorKey: "name",
  //         header: ({ column }) => <SortHeader column={column} title="Name" />,
  //         cell: ({ row }) => {
  //             const certificateUrl = row.original.certificateUrl;
  //             return certificateUrl ? (
  //                 <div className="flex gap-2">
  //                     <span className="max-w-[500px] truncate font-medium">
  //                         {row.getValue("name")}
  //                     </span>
  //                 </div>
  //             ) : null;
  //         },
  //     },
  //     {
  //         accessorKey: "type",
  //         header: ({ column }) => <SortHeader column={column} title="Type" />,
  //         cell: ({ row }) => {
  //             const certificateUrl = row.original.certificateUrl;
  //             return certificateUrl ? (
  //                 <div className="flex gap-2">
  //                     <span className="max-w-[500px] truncate font-medium">
  //                         {row.getValue("type")}
  //                     </span>
  //                 </div>
  //             ) : null;
  //         },
  //     },
  //     {
  //         accessorKey: "publishedAt",
  //         header: ({ column }) => <SortHeader column={column} title="Issue Date" />,
  //         cell: ({ row }) => {
  //             const certificateUrl = row.original.certificateUrl;
  //             return certificateUrl ? (
  //                 <div className="flex gap-2">
  //                     {row?.original?.publishedAt.date} {row?.original?.publishedAt.time}
  //                 </div>
  //             ) : null;
  //         },
  //     },
  //     {
  //         id: "actions",
  //         header: "Action",
  //         cell: ({ row }) => {
  //             const certificateUrl = row.original.certificateUrl;

  //             return certificateUrl ? (
  //                 <div className="flex justify-end">
  //                     <DropdownMenu>
  //                         <DropdownMenuTrigger asChild>
  //                             <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
  //                                 <MoreHorizontal className="h-4 w-4" />
  //                             </Button>
  //                         </DropdownMenuTrigger>
  //                         <DropdownMenuContent align="end" className="">
  //                             <DropdownMenuItem
  //                                 onClick={() => {
  //                                     window.open(certificateUrl, "_blank");
  //                                 }}
  //                             >
  //                                 Preview
  //                             </DropdownMenuItem>
  //                             <DropdownMenuSeparator />
  //                             <DropdownMenuItem
  //                                 onClick={() => {
  //                                     downloadFromUrl(certificateUrl, `certificate_${row.original.id}.pdf`);
  //                                 }}
  //                             >
  //                                 Download
  //                             </DropdownMenuItem>
  //                         </DropdownMenuContent>
  //                     </DropdownMenu>
  //                 </div>
  //             ) : null;
  //         },
  //     },
  // ];

  const table = useReactTable({
    data: certificates,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex: meta.currentPage - 1, // 0-based index for react-table
        pageSize: meta.pageSize,
      },
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: (updater) => {
      const newPageIndex =
        typeof updater === "function"
          ? updater({ pageIndex: meta.currentPage - 1 }).pageIndex
          : updater.pageIndex;
      const newPage = newPageIndex + 1; // Convert back to 1-based page number
      setMeta((prev) => ({ ...prev, currentPage: newPage }));
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true, // Enable manual pagination since we're handling it
    pageCount: meta.pageCount, // Provide total page count
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800">
          My Certificates
        </div>
      </div>
      {emptyState ? (
        <Blank className="flex flex-col items-center justify-center h-full space-y-3">
          <div className="text-default-900 text-xl font-normal">
            No Certificates found matching your criteria.
          </div>
        </Blank>
      ) : (
        <div className="grid grid-cols-12 gap-6 mt-6">
          <div className="col-span-12">
            <ProjectList
              table={table}
              columns={columns}
              meta={meta}
              func={getCertificateData}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
