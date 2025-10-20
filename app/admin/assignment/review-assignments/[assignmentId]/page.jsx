"use client";
import React, { useEffect, useMemo, useState } from "react";
import ProjectList from "./../../../course/ProjectList";
import { useParams } from "next/navigation";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { getFilePath } from "@/config/file.path";
import DataTableColumnHeader from "./components/data-table-column-header";
import axiosInstance from "@/config/axios.config";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* ----------------------------- helpers ----------------------------- */

function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${day}-${month}-${year}`;
}

const buildExportRows = (items = []) =>
  (items || []).map((item) => {
    const totalSubjectiveScore = (item?.answers || [])
      .filter((ans) => ans?.question?.question_type === "Subjective")
      .reduce((sum, ans) => sum + (ans?.marks_awarded || 0), 0);

    const totalSubjectiveMarks = (item?.answers || [])
      .filter((ans) => ans?.question?.question_type === "Subjective")
      .reduce((sum, ans) => sum + (ans?.question?.score || 0), 0);

    const totalMCQScore = (item?.answers || [])
      .filter((ans) => ans?.question?.question_type === "MCQ")
      .reduce((sum, ans) => sum + (ans?.marks_awarded || 0), 0);

    const totalMcqMarks = (item?.answers || [])
      .filter((ans) => ans?.question?.question_type === "MCQ")
      .reduce((sum, ans) => sum + (ans?.question?.score || 0), 0);

    const marks = `${totalMCQScore + totalSubjectiveScore} of ${
      totalSubjectiveMarks + totalMcqMarks
    }`;

    const status = item?.attempt_content_status;
    const hasResult = status === "Complete" || status === "Reviewed";
    const totalScore =
      Number(totalMCQScore ?? 0) + Number(totalSubjectiveScore ?? 0);
    const minScore = Number(item?.assignment?.min_score ?? 0);
    const passed = hasResult && totalScore >= minScore;

    const badgeText = hasResult ? (passed ? "Passed" : "Failed") : status;

    const certUrl = item?.certificate?.url
      ? getFilePath(item.certificate.url)
      : "";

    return {
      employeeCode: item?.user?.[0]?.employeeCode || "-",
      name: item?.user?.[0]
        ? `${item.user[0].firstName || ""} ${
            item.user[0].lastName || ""
          }`.trim()
        : "N/A",
      email: item?.user?.[0]?.email || "-",
      assignmentName: item?.assignment?.title || "N/A",
      totalMarks: marks || "N/A",
      attemptedAt: new Date(item?.createdAt).toDateString() || "N/A",
      status: badgeText,
      // Excel-friendly hyperlink formula
      isCertificateGenerated: certUrl
        ? `=HYPERLINK("${certUrl}","Download Certificate")`
        : "Not Issued",
    };
  });

const fetchAllAttempts = async (assignmentDocumentId) => {
  const pageSize = 100; // bump if your API allows larger page sizes
  const baseParams = {
    filters: { assignment: { documentId: { $eq: assignmentDocumentId } } },
    populate: {
      answers: { populate: { question: { populate: "options" } } },
      user: { populate: "*" },
      certificate: true,
      assignment: { populate: "*" },
    },
    sort: ["createdAt:desc"],
  };

  const first = await axiosInstance.get("/api/attempt-contents", {
    params: { ...baseParams, pagination: { page: 1, pageSize } },
  });

  let all = first.data?.data || [];
  const pageCount = first?.data?.meta?.pagination?.pageCount || 1;

  for (let p = 2; p <= pageCount; p++) {
    const res = await axiosInstance.get("/api/attempt-contents", {
      params: { ...baseParams, pagination: { page: p, pageSize } },
    });
    all = all.concat(res?.data?.data || []);
  }

  return all;
};

const toCsv = (columns, rows, delimiter = ";") => {
  const esc = (v) => {
    const s = String(v ?? "");
    return `"${s.replace(/"/g, '""')}"`;
  };

  const header = columns.map((c) => esc(c.displayName)).join(delimiter);
  const body = rows
    .map((r) => columns.map((c) => esc(r[c.id])).join(delimiter))
    .join("\n");

  return `${header}\n${body}`;
};

/* ----------------------------- main page ----------------------------- */

export default function Page() {
  const [attempts, setAttempts] = useState([]);
  const [assignment, setAssignment] = useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [loading, setLoading] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  const [meta, setMeta] = useState({
    page: 1,
    pageSize: 10,
    pageCount: 0,
    total: 0,
    currentPage: 1,
  });
  const { assignmentId } = useParams();
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const handlePreview = (file) => setSelectedCertificate(file);

  const fetchAttempts = async (pageNo = 1) => {
    try {
      setLoading(true);
      const pageSize = meta.pageSize || 10;
      const { data } = await axiosInstance.get("/api/attempt-contents", {
        params: {
          filters: { assignment: { documentId: { $eq: assignmentId } } },
          populate: {
            answers: { populate: { question: { populate: "options" } } },
            user: { populate: "*" },
            certificate: true,
            assignment: { populate: "*" },
          },
          sort: ["createdAt:desc"],
          pagination: { page: pageNo, pageSize },
        },
      });

      const rows = data?.data || [];
      setEmptyState(!rows.length);
      setAttempts(rows);
      setMeta({ ...(data?.meta?.pagination || {}), currentPage: pageNo });
    } catch (err) {
      console.error("Error fetching Attempts:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentDetail = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/api/assignments/${assignmentId}?populate=*`
      );
      setAssignment(data?.data || {});
    } catch (error) {
      console.error(error);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "user",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Name" />
        ),
        cell: ({ row }) => {
          const username = row.original.user?.[0]
            ? `${row.original.user[0].firstName || ""} ${
                row.original.user[0].lastName || ""
              } (${row.original.user[0].employeeCode || "N/A"})`
            : "N/A";
          const attemptDocId = row.original.documentId;

          return (
            <Link
              href={{
                pathname: `/admin/assignment/attempt-details/${attemptDocId}`,
              }}
              prefetch={false}
              className="flex items-center gap-2"
            >
              <span className="font-semibold text-default-900 capitalize hover:text-primary">
                {username.trim()}
              </span>
            </Link>
          );
        },
      },
      {
        accessorKey: "Marks",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Marks" />
        ),
        cell: ({ row }) => {
          const totalSubjectiveScore = (row.original?.answers || [])
            .filter((ans) => ans?.question?.question_type === "Subjective")
            .reduce((sum, ans) => sum + (ans?.marks_awarded || 0), 0);

          const totalSubjectiveMarks = (row.original?.answers || [])
            .filter((ans) => ans?.question?.question_type === "Subjective")
            .reduce((sum, ans) => sum + (ans?.question?.score || 0), 0);

          const totalMCQScore = (row.original?.answers || [])
            .filter((ans) => ans?.question?.question_type === "MCQ")
            .reduce((sum, ans) => sum + (ans?.marks_awarded || 0), 0);

          const totalMcqMarks = (row.original?.answers || [])
            .filter((ans) => ans?.question?.question_type === "MCQ")
            .reduce((sum, ans) => sum + (ans?.question?.score || 0), 0);

          return (
            <div className="text-sm font-medium text-default-600 whitespace-nowrap">
              {`${totalMCQScore + totalSubjectiveScore} / ${
                totalSubjectiveMarks + totalMcqMarks
              }`}
            </div>
          );
        },
      },
      {
        accessorKey: "certificate",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Certificate" />
        ),
        cell: ({ row }) =>
          row.original.certificate ? (
            <button
              onClick={() => handlePreview(row.original.certificate)}
              className="text-blue-500 hover:underline"
            >
              <Icon icon="mdi:file" className="w-6 h-6" />
            </button>
          ) : (
            "Not Issued"
          ),
      },
      {
        accessorKey: "createdAt",
        header: "Attempt Date",
        cell: ({ row }) => (
          <div className="text-sm font-medium text-default-600 whitespace-nowrap">
            {formatDate(row.getValue("createdAt"))}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.original?.attempt_content_status;

          const totalSubjectiveScore = (row.original?.answers || [])
            .filter((ans) => ans?.question?.question_type === "Subjective")
            .reduce((sum, ans) => sum + (ans?.marks_awarded || 0), 0);

          const totalMCQScore = (row.original?.answers || [])
            .filter((ans) => ans?.question?.question_type === "MCQ")
            .reduce((sum, ans) => sum + (ans?.marks_awarded || 0), 0);

          const hasResult =
            status === "Complete" || status === "Reviewed" || status === "Done";

          const totalScore =
            Number(totalMCQScore ?? 0) + Number(totalSubjectiveScore ?? 0);
          const minScore = Number(row?.original?.assignment?.min_score ?? 0);
          const passed = hasResult && totalScore >= minScore;

          const badgeColor = hasResult
            ? passed
              ? "success"
              : "destructive"
            : status === "In Progress"
            ? "default"
            : status === "Reviewed"
            ? "warning"
            : "info";

          const badgeText = hasResult ? (passed ? "Passed" : "Failed") : status;

          return (
            <div className="flex items-center">
              <Badge color={badgeColor} variant="soft" className="capitalize">
                {badgeText}
              </Badge>
            </div>
          );
        },
        filterFn: (row, id, value) => value.includes(row.getValue(id)),
      },
    ],
    []
  );

  const table = useReactTable({
    data: attempts,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  useEffect(() => {
    getAssignmentDetail();
    fetchAttempts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-5">
      <AssignmentPage assignmentData={attempts} />
      <ProjectList
        table={table}
        columns={columns}
        meta={meta}
        func={fetchAttempts}
      />

      {selectedCertificate && (
        <Dialog defaultOpen onOpenChange={() => setSelectedCertificate(null)}>
          <DialogContent size="full">
            <DialogHeader>
              <DialogTitle className="text-base font-medium text-default-700">
                Certificate Preview
              </DialogTitle>
            </DialogHeader>
            <div className="w-full h-screen">
              <object
                data={
                  selectedCertificate?.url
                    ? getFilePath(selectedCertificate.url)
                    : ""
                }
                type="application/pdf"
                width="100%"
                height="100%"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

/* --------------------------- stats & export -------------------------- */

const AssignmentPage = ({ assignmentData }) => {
  const { assignmentId } = useParams();
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const baseParams = {
          filters: {
            assignment: { documentId: { $eq: assignmentId } },
          },
          populate: {
            answers: { populate: { question: { populate: "options" } } },
            user: { populate: "*" },
            certificate: true,
            assignment: { populate: "*" },
          },
          sort: ["createdAt:desc"],
        };

        const { data: attemptsRes } = await axiosInstance.get(
          "/api/attempt-contents",
          {
            params: { ...baseParams },
          }
        );
        const uniqueAttemptUsers = new Set(
          (attemptsRes?.data || []).map((item) => item?.user?.[0]?.id)
        );
        const totalSubmissions = uniqueAttemptUsers.size;

        const uniquePassedUsers = new Set();
        let certificatesIssued = 0;

        (attemptsRes?.data || []).forEach((item) => {
          const userId = item?.user?.[0]?.id;
          const totalSubjectiveScore = (item?.answers || [])
            .filter((ans) => ans?.question?.question_type === "Subjective")
            .reduce((sum, ans) => sum + (ans?.marks_awarded || 0), 0);

          const totalMCQScore = (item?.answers || [])
            .filter((ans) => ans?.question?.question_type === "MCQ")
            .reduce((sum, ans) => sum + (ans?.marks_awarded || 0), 0);

          const totalScore =
            Number(totalMCQScore ?? 0) + Number(totalSubjectiveScore ?? 0);
          if (userId && totalScore >= Number(item?.assignment?.min_score ?? 0))
            uniquePassedUsers.add(userId);
          if (item?.certificate) certificatesIssued++;
        });

        const passed = uniquePassedUsers.size;
        const failed = Math.max(totalSubmissions - passed, 0);

        setCounts({
          totalSubmissions,
          passed,
          failed,
          certificatesIssued,
        });
      } catch (err) {
        setError(err?.response?.data || err?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [assignmentId]);

  const columns = useMemo(
    () => [
      { id: "employeeCode", displayName: "Employee Code" },
      { id: "name", displayName: "Name" },
      { id: "email", displayName: "Email Address" },
      { id: "assignmentName", displayName: "Assignment Name" },
      { id: "totalMarks", displayName: "Marks" },
      { id: "attemptedAt", displayName: "Attempt Date" },
      { id: "status", displayName: "Status" },
      { id: "isCertificateGenerated", displayName: "Certificate Issued" },
    ],
    []
  );

  const handleExportAll = async () => {
    try {
      setExporting(true);
      const all = await fetchAllAttempts(String(assignmentId));
      const rows = buildExportRows(all);
      const csv = toCsv(columns, rows, ",");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const title = (all?.[0]?.assignment?.title || "Assignment_attempts")
        .replace(/[^\w\-]+/g, "_")
        .slice(0, 80);

      a.download = `${title}_all_${formatDate(new Date())}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap mb-4">
        <h1 className="text-2xl font-bold mb-4">Assignment Statistics</h1>

        <button
          onClick={handleExportAll}
          disabled={exporting}
          className="bg-[#fa7516] text-white px-4 py-2 rounded text-sm hover:bg-[#fa7516]/70 transition-colors duration-300 disabled:opacity-60"
        >
          {exporting ? "Exporting..." : "Export ALL to CSV"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <CardContent>
            <h2 className="text-lg font-semibold">Total Submissions</h2>
            <p className="text-3xl font-bold">
              {counts?.totalSubmissions || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="p-4 bg-green-100">
          <CardContent>
            <h2 className="text-lg font-semibold">Passed Users</h2>
            <p className="text-3xl font-bold text-green-600">
              {counts?.passed || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="p-4 bg-red-100">
          <CardContent>
            <h2 className="text-lg font-semibold">Failed Users</h2>
            <p className="text-3xl font-bold text-red-600">
              {counts.failed || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="p-4 bg-blue-100">
          <CardContent>
            <h2 className="text-lg font-semibold">Certificates Issued</h2>
            <p className="text-3xl font-bold text-blue-600">
              {counts.certificatesIssued || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {loading && <p className="text-center mt-4">Loading...</p>}
      {error && (
        <p className="text-center text-red-500 mt-4">{String(error)}</p>
      )}
    </div>
  );
};
