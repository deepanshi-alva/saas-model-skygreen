"use client";

import * as React from "react";
import { flexRender } from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
export default function ProjectList({ data, table, columns, setIsCreateQuestionOpen,
  setQuestionId, meta, func }) {
  return (
    <Card className="rounded-lg">
      <CardContent className="p-0 pb-5">
        <Table>
          <TableHeader>
            {table?.getHeaderGroups()?.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="border border-default-200 last:text-end"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="border border-default-200"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex-none mt-4">
        <div className="flex items-center gap-4 flex-wrap justify-end w-full">
          {/* <div className="flex-1 text-sm whitespace-nowrap text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>

          <div className="flex-none flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="w-8 h-8 "
            >
              <Icon icon="heroicons:chevron-left" className="w-4 h-4 rtl:rotate-180" />
            </Button>
            <ul className=" flex gap-3 items-center">
              {table.getPageOptions().map((page, pageIdx) => (
                <li key={pageIdx}>
                  <Button
                    onClick={() => table.setPageIndex(pageIdx)}
                    className={`w-8 h-8`}
                    variant={`${pageIdx === table.getState().pagination.pageIndex
                        ? ""
                        : "outline"
                      }`}
                  >
                    {page + 1}
                  </Button>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="w-8 h-8"
            >
              <Icon icon="heroicons:chevron-right" className="w-4 h-4 rtl:rotate-180" />
            </Button>
          </div> */}
          <div className="flex flex-wrap items-center gap-6 lg:gap-8">
            <div className="flex w-[100px] items-center justify-center text-sm font-medium text-muted-foreground">
              {meta?.pageCount > 0 ? `Page ${meta.currentPage} of 
                                    ${meta.pageCount}` : null}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => func(1)}
                disabled={meta?.currentPage <= 1}
              >
                <span className="sr-only">Go to first page</span>
                <ChevronsLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                // onClick={() => table.previousPage()}
                onClick={() => { func(meta?.currentPage - 1) }}
                disabled={meta?.currentPage <= 1}
              >
                <span className="sr-only">Go to previous page</span>
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => { func(meta?.currentPage + 1) }}
                disabled={meta?.currentPage >= meta?.pageCount}
              >
                <span className="sr-only">Go to next page</span>
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
              <Button
                variant="outline"
                className="hidden h-8 w-8 p-0 lg:flex"
                onClick={() => func(meta?.pageCount)}
                disabled={meta?.currentPage >= meta?.pageCount}
              >
                <span className="sr-only">Go to last page</span>
                <ChevronsRight className="h-4 w-4 rtl:rotate-180" />
              </Button>
            </div>
          </div>

        </div>
      </CardFooter>
    </Card>
  );
}
