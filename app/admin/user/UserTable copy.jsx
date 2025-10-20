// "use client";
// import * as React from "react";
// import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
// import {
//   flexRender,
//   getCoreRowModel,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { Loader2 } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import {
//   DropdownMenu,
//   DropdownMenuCheckboxItem,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import toast from "react-hot-toast";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { Icon } from "@iconify/react";
// import { cn } from "@/lib/utils";
// import { fetchSingleUser, blockUser, fetchAllRoles } from "@/components/auth/admin-operation";
// import { useState } from "react";
// import { useSelector } from "react-redux";
// import AddUser from "./add-user";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import axios from "axios";
// import ProjectList from "../course/ProjectList";
// import axiosInstance from "@/config/axios.config";
// import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"; import { getFilePath } from "@/config/file.path";

// export function Users() {
//   const [pageStart, setPageStart] = useState(0)
//   const [inputValue, setInputValue] = useState('')
//   const [sorting, setSorting] = React.useState([]);
//   const [columnFilters, setColumnFilters] = React.useState([]);
//   const [columnVisibility, setColumnVisibility] = React.useState({});
//   const [rowSelection, setRowSelection] = React.useState({});
//   const [users, setUsers] = React.useState([]);
//   const [isFormOpen, setIsFormOpen] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [selectedRoles, setSelectedRoles] = useState([]);
//   const userDetails = useSelector((state) => state.user);
//   const [allUsers, setAllUsers] = useState([]); // Store all users
//   const [isLoading, setIsLoading] = useState(true)
//   const siteSetting = useSelector((state) => state.siteSetting);
//   const { data, loading, error } = siteSetting || {};
//   const [meta, setMeta] = useState({ "page": 1, "pageSize": 10, "pageCount": 0, "total": 0, "currentPage": 1 });
//   const [filterValue, setFilterValue] = useState("");
//   // const [selectedRole, setSelectedRole] = useState("All"); 
//   const [emptyState, setEmptyState] = useState(false);
//   const [filterState, setfilterStatus] = useState(false);
//   const [disablePage, setDisablePage] = useState(false);
//   const [selectedRole, setSelectedRole] = useState("All");
//   const [totalUsersCount, setTotalUsersCount] = useState(null);
//   const loadRoles = async () => {
//     try {
//       const fetchedRoles = await fetchAllRoles();
//       const formattedRoles = fetchedRoles?.roles.map((role) => ({
//         value: role.id,
//         label: role.name,
//       }));
//       setSelectedRoles(formattedRoles.filter(ele => ele.label));
//     } catch (error) {
//       console.error("Failed to fetch roles:", error);
//     }
//   };

//   React.useEffect(() => {
//     loadRoles();
//     handleFetchUsers();
//   }, []);

//   // const handleSelectSelectedUsers = () => {
//   //   const selectedUserDetails = table.getSelectedRowModel().rows.map(row => row.original);
//   //   console.log("------Selected Users: ----------", selectedUserDetails);
//   // };

//   const handleSendPasswordReset = async (option) => {
//     let selectedUserDetails = [];

//     if (option === "selected") {
//       selectedUserDetails = table.getSelectedRowModel().rows.map((row) => row.original);
//     } else if (option === "all") {
//       selectedUserDetails = allUsers; // Select all users irrespective of pagination
//     } else {
//       selectedUserDetails = allUsers.filter((user) => user.role?.name === option);
//     }

//     console.log(`Sending password reset to: ${option}`, selectedUserDetails);

//     if (selectedUserDetails.length === 0) {
//       toast.error("No users selected for password reset.");
//       return;
//     }

//     try {
//       const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

//       // Loop through each selected user and send password reset email
//       await Promise.all(
//         selectedUserDetails.map(async (user) => {
//           await axios.post(`${STRAPI_URL}/api/auth/forgot-password`, {
//             email: user.email,
//           });
//         })
//       );

//       toast.success(`Password reset emails sent to ${selectedUserDetails.length} users.`);
//     } catch (error) {
//       console.error("Failed to send password reset emails:", error);
//       toast.error("Failed to send password reset emails. Please try again.");
//     }
//   };
//   console.log('selected Role', selectedRole)
//   const columns = [
//     {
//       id: "select",
//       header: ({ table }) => (
//         <Checkbox
//           checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
//           onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
//           aria-label="Select all"
//         />
//       ),
//       cell: ({ row }) => (
//         <Checkbox
//           checked={row.getIsSelected()}
//           onCheckedChange={(value) => row.toggleSelected(!!value)}
//           aria-label="Select row"
//         />
//       ),
//       enableSorting: false,
//       enableHiding: false,
//     },
//     {
//       accessorKey: "id",
//       header: "ID",
//       cell: ({ row }) => (
//         <div className="  font-medium  text-card-foreground/80">
//           <div className="flex space-x-3  rtl:space-x-reverse items-center">
//             <span className="capitalize text-sm text-card-foreground whitespace-nowrap">
//               {row?.original?.id}
//             </span>
//           </div>
//         </div>
//       ),
//     },
//     {
//       accessorKey: "name",
//       header: "Name",
//       cell: ({ row }) => (
//         <div className="  font-medium  text-card-foreground/80">
//           <div className="flex space-x-3  rtl:space-x-reverse items-center">
//             <Avatar className=" rounded-full">
//               <AvatarImage src={getFilePath(row?.original?.profileImage?.url) || ''} />
//               <AvatarFallback className="rounded uppercase bg-success/30 text-success">
//                 {row?.original?.name.slice(0, 2)}
//               </AvatarFallback>
//             </Avatar>
//             <span className="capitalize text-sm text-card-foreground whitespace-nowrap">
//               {(row?.original?.name || "")}
//             </span>
//           </div>
//         </div>
//       ),
//     },
//     {
//       accessorKey: "email",
//       header: ({ column }) => {
//         return (
//           <Button
//             variant="ghost"
//             onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
//           >
//             Email
//             <ArrowUpDown className="ml-2 h-4 w-4" />
//           </Button>
//         );
//       },
//       cell: ({ row }) => <div className="lowercase whitespace-nowrap">{row.getValue("email")}</div>,
//     },

//     {
//       accessorKey: "status",
//       header: "Status",
//       cell: ({ row }) => {
//         const isBlocked = row?.original?.blocked;
//         const color = isBlocked ? "destructive" : "success";
//         const label = isBlocked ? "Blocked" : "Active";

//         return (
//           <Badge variant="soft" color={color} className="capitalize">
//             {label}
//           </Badge>
//         );
//       },
//     },

//     {
//       accessorKey: "role",
//       header: () => <div className="text-right">Role</div>,
//       filterFn: "roleFilter",
//       cell: ({ row }) => {
//         return <div className="text-right font-medium">{row?.original?.role?.name || ""}</div>;
//       },
//     },
//     {
//       id: "actions",
//       enableHiding: false,
//       cell: ({ row }) => {
//         const user = row.original;
//         const [loading, setLoading] = useState(false);

//         const handleBlockToggle = async (userId) => {
//           setLoading(true);
//           try {
//             setUsers((prevUsers) =>
//               prevUsers.map((user) =>
//                 user.id === userId ? { ...user, blocked: !user.blocked } : user
//               )
//             );
//             await blockUser(userId, user.blocked);
//           } catch (error) {
//             console.error("Failed to toggle block status:", error);
//             setUsers((prevUsers) =>
//               prevUsers.map((user) =>
//                 user.id === userId ? { ...user, blocked: user.blocked } : user
//               )
//             );
//           } finally {
//             setLoading(false);
//           }
//         };

//         const handleUpdateUser = async (user) => {
//           setSelectedUser(user);
//           setIsFormOpen(true);
//         };

//         return (
//           <div className=" text-end">
//             <DropdownMenu>
//               <DropdownMenuTrigger disabled={userDetails.id === row.original.id} asChild>
//                 <Button variant="ghost" className="h-8 w-8 p-0">
//                   <span className="sr-only">Open menu</span>
//                   <MoreHorizontal className="h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent align="end">
//                 <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                 <DropdownMenuSeparator />
//                 <DropdownMenuItem onClick={() => handleUpdateUser(user)}>
//                   Edit
//                 </DropdownMenuItem>
//                 <DropdownMenuItem onClick={() => handleBlockToggle(user.id)} disabled={loading}>
//                   {user.blocked ? "Unblock" : "Block"}
//                 </DropdownMenuItem>
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         );
//       },
//     },
//   ];
//   const table = useReactTable({
//     data: users,
//     columns,
//     onSortingChange: setSorting,
//     onColumnFiltersChange: setColumnFilters,
//     getCoreRowModel: getCoreRowModel(),
//     getPaginationRowModel: getPaginationRowModel(),
//     getSortedRowModel: getSortedRowModel(),
//     getFilteredRowModel: getFilteredRowModel(),
//     onColumnVisibilityChange: setColumnVisibility,
//     onRowSelectionChange: setRowSelection,
//     state: {
//       sorting,
//       columnFilters,
//       columnVisibility,
//       rowSelection,
//       globalFilter: inputValue
//     },
//     // initialState: {
//     //   pagination: {
//     //     pageSize: 50, // ✅ Set initial page size to 50
//     //   }
//     // },
//     filterFns: {
//       roleFilter: (row, columnId, filterValue) => {
//         const roleName = row.getValue(columnId);
//         return filterValue.includes(roleName.name);
//       }
//     },
//   });

//   React.useEffect(() => {
//     if (!isFormOpen) {
//       handleFetchUsers();
//     }
//   }, [isFormOpen])



//   // const fetchAllUsers = async (pageNo = 1, pageSize = 50, selectedRole = "") => {
//   //   console.log('Fetching users...', pageNo, selectedRole);
//   //   try {
//   //     let pageCount;
//   //     let start;
//   //     let users;
//   //     let total;
//   //     const query = new URLSearchParams();
//   //     if (selectedRole === 'All' && !filterValue) {
//   //       // Get total users count
//   //       const { data } = await axiosInstance.get(`/api/users/count`);
//   //       total = data;
//   //       pageCount = Math.ceil(total / pageSize);
//   //       // Fetch paginated users
//   //       start = (pageNo - 1) * pageSize;
//   //       const { data: response } = await axiosInstance.get(`/api/users?start=${start}&limit=${pageSize}&populate=*&status=published`);
//   //       users = response;
//   //       setfilterStatus(false);
//   //     } else {
//   //       // Apply search filter if filterValue exists
//   //       if (filterValue) {
//   //         query.append("filters[$or][0][username][$containsi]", filterValue);
//   //         query.append("filters[$or][1][email][$containsi]", filterValue);
//   //         setfilterStatus(true);
//   //       }
//   //       // Apply role filter if selected
//   //       if (selectedRole && selectedRole !== 'All') {
//   //         query.append("filters[role][name][$eq]", selectedRole.toUpperCase()); // Convert role to uppercase
//   //       }

//   //       const { data } = await axiosInstance.get(`/api/users?${query.toString()}`);
//   //       total = data.length;
//   //       // Calculate total pages
//   //       pageCount = Math.ceil(total / pageSize);
//   //       // Fetch paginated users
//   //       start = (pageNo - 1) * pageSize;
//   //       const { data: response } = await axiosInstance.get(`/api/users?${query.toString()}&start=${start}&limit=${pageSize}&populate=*&status=published`);
//   //       users = response;
//   //     }
//   //     const meta = {
//   //       page: pageNo,
//   //       pageSize,
//   //       pageCount,
//   //       total,
//   //       currentPage: pageNo,
//   //     };
//   //     // Update meta manually
//   //     setMeta(meta);
//   //     console.log('meta', meta);
//   //     console.log("users", users);
//   //     return users.map((ele) => ({
//   //       ...ele,
//   //       name: `${ele.firstName ? ele.firstName + " " + (ele.lastName || "") : ""}`,
//   //     }));
//   //   } catch (error) {
//   //     console.error("❌ Error fetching users:", error);
//   //     toast.error("Failed to fetch users");
//   //     return []; // Return empty array on failure
//   //   }
//   // };
//   const fetchAllUsers = async (pageNo = 1, pageSize = 50, role = selectedRole) => {
//     console.log('Fetching users...', pageNo, role);
//     try {
//       let pageCount;
//       let start;
//       let users;
//       let total = totalUsersCount;
//       console.log('total inside the fetchAllUsers',total);
//       const query = new URLSearchParams();
//       if (selectedRole === 'All' && !filterValue) {
//         // Get total users count
//         if (!total) {
//           const { data } = await axiosInstance.get(`/api/users/count`);
//           total = data;
//           setTotalUsersCount(data); // Store total count globally
//         }
//         pageCount = Math.ceil(total / pageSize);
//         // Fetch paginated users
//         start = (pageNo - 1) * pageSize;
//         const { data: response } = await axiosInstance.get(`/api/users?start=${start}&limit=${pageSize}&populate=*&status=published`);
//         users = response;
//         setfilterStatus(false);
//       } else {
//         // Apply search filter if filterValue exists
//         if (filterValue) {
//           query.append("filters[$or][0][username][$containsi]", filterValue);
//           query.append("filters[$or][1][email][$containsi]", filterValue);
//           setfilterStatus(true);
//         }
//         // Apply role filter if selected
//         if (selectedRole && selectedRole !== 'All') {
//           query.append("filters[role][name][$eq]", role.toUpperCase()); // Convert role to uppercase
//         }

//         if (!total) {
//           const { data: totalData } = await axiosInstance.get(`/api/users?${query.toString()}`);
//           total = totalData.length;
//           setTotalUsersCount(total);
//         }
//         // Calculate total pages
//         pageCount = Math.ceil(total / pageSize);
//         // Fetch paginated users
//         start = (pageNo - 1) * pageSize;
//         const { data: response } = await axiosInstance.get(`/api/users?${query.toString()}&start=${start}&limit=${pageSize}&populate=*&status=published`);
//         users = response;
//       }
//       const meta = {
//         page: pageNo,
//         pageSize,
//         pageCount,
//         total,
//         currentPage: pageNo,
//       };
//       // Update meta manually
//       setMeta(meta);
//       console.log('meta', meta);
//       console.log("users", users);
//       return users.map((ele) => ({
//         ...ele,
//         name: `${ele.firstName ? ele.firstName + " " + (ele.lastName || "") : ""}`,
//       }));
//     } catch (error) {
//       console.error("❌ Error fetching users:", error);
//       toast.error("Failed to fetch users");
//       return []; // Return empty array on failure
//     }
//   };
//   // const handleFetchUsers = async (pageNo = 1) => {
//   //   setIsLoading(true); // Start loading
//   //   try {
//   //     const data = await fetchAllUsers(pageNo, meta.pageSize);
//   //     const sortedData = data.sort((a, b) => Number(b.id) - Number(a.id));
//   //     setUsers(sortedData);
//   //     setAllUsers(sortedData);
//   //   } catch (error) {
//   //     console.error("Error fetching users:", error);
//   //   } finally {
//   //     setIsLoading(false); // Stop loading
//   //   }
//   // };
//   // const handleFetchUsers = async (pageNo = 1, resetPagination = false) => {
//   //   setIsLoading(true); // Start loading
//   //   try {
//   //     const newPageNo = resetPagination ? 1 : pageNo; // Reset pagination if searching
//   //     const data = await fetchAllUsers(newPageNo, meta.pageSize);
//   //     const sortedData = data.sort((a, b) => Number(b.id) - Number(a.id));
//   //     setUsers(sortedData);
//   //     setAllUsers(sortedData);
//   //     if (resetPagination) {
//   //       setMeta((prev) => ({ ...prev, currentPage: 1 }));
//   //     }
//   //   } catch (error) {
//   //     console.error("Error fetching users:", error);
//   //   } finally {
//   //     setIsLoading(false); // Stop loading
//   //   }
//   // };
//   const handleFetchUsers = async (pageNo = 1, resetPagination = false, role = selectedRole) => {
//     setIsLoading(true); // Start loading
//     try {
//       setSelectedRole(role);
//       if (selectedRole !== role) {
//         setTotalUsersCount(null); // Only reset when switching roles
//       }
//       const newPageNo = resetPagination ? 1 : pageNo; // Reset pagination if searching
//       const data = await fetchAllUsers(newPageNo, meta.pageSize, role); // Pass selectedRole
//       const sortedData = data.sort((a, b) => Number(b.id) - Number(a.id));

//       setUsers(sortedData);
//       setAllUsers(sortedData);

//       if (resetPagination) {
//         setMeta((prev) => ({ ...prev, currentPage: 1 }));
//       }
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     } finally {
//       setIsLoading(false); // Stop loading
//     }
//   };

//   console.log('users in Users', users);
//   const handleAddUser = () => {
//     setIsFormOpen(true);
//   };

//   const handleCloseForm = () => {
//     setIsFormOpen(false);
//     setSelectedUser(null);
//   };
//   const debounce = (func, delay) => {
//     let debounceTimer
//     return function () {
//       const context = this
//       const args = arguments
//       clearTimeout(debounceTimer)
//       debounceTimer
//         = setTimeout(() => func.apply(context, args), delay)
//     }
//   }
//   React.useEffect(() => {
//     const debouncedFetch = debounce(() => handleFetchUsers(1, true, selectedRole), 400);
//     debouncedFetch();
//   }, [filterValue]);

//   console.log('total ', totalUsersCount);
//   return (
//     <>
//       <div className="space-y-5">

//         <CardHeader className="p-6">

//           <CardTitle className="text-xl font-medium capitalize items-center flex justify-between">
//             <h3>Users</h3>
//             <div className="flex gap-3">
//               {/* <Input
//                 placeholder="Search by email, username..."
//                 value={inputValue}
//                 // onChange={(event) => {
//                 //   setInputValue(event.target.value);
//                 // }}
//                 onChange={(event) => setFilterValue(event.target.value)}
//                 className="max-w-sm min-w-[200px] h-10"
//               /> */}
//               <Input
//                 placeholder="Search by email, username..."
//                 value={filterValue}
//                 onChange={(event) => setFilterValue(event.target.value)}
//                 className="max-w-sm min-w-[200px] h-10"
//               />

//               <Button onClick={handleAddUser}>
//                 Add User
//               </Button>
//               {/* <Button variant="outline" onClick={handleSelectSelectedUsers}>
//                 Send Password Reset Email
//               </Button> */}
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <Button variant="outline">Send Password Reset Mail</Button>
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end">
//                   <DropdownMenuLabel>Send To</DropdownMenuLabel>
//                   <DropdownMenuSeparator />
//                   <DropdownMenuItem onClick={() => handleSendPasswordReset("selected")}>
//                     Selected Users
//                   </DropdownMenuItem>
//                   <DropdownMenuItem onClick={() => handleSendPasswordReset("all")}>
//                     All Users
//                   </DropdownMenuItem>
//                   <DropdownMenuSeparator />
//                   {selectedRoles.map((role) => (
//                     <DropdownMenuItem key={role.value} onClick={() => handleSendPasswordReset(role.label)}>
//                       {role.label}
//                     </DropdownMenuItem>
//                   ))}
//                 </DropdownMenuContent>
//               </DropdownMenu>
//               <AddUser
//                 open={isFormOpen}
//                 onClose={handleCloseForm}
//                 user={selectedUser}
//                 onUserUpdated={handleFetchUsers}
//               />
//             </div>
//           </CardTitle>
//         </CardHeader>

//       </div>

//       <div className="flex items-center flex-wrap gap-2 px-4">
//       </div>
//       <Tabs defaultValue="All" className="inline-block w-full px-4 mb-6">
//         <TabsList className="py-2 p-1 py-2 rounded-none h-14 bg-transparent text-muted-foreground rounded-sm justify-start px-4">
//           <TabsTrigger
//             value="All"
//             className="text-base font-medium capitalize  data-[state=active]:shadow-none  data-[state=active]:bg-transparent data-[state=active]:text-primary transition duration-150 before:transition-all before:duration-150 relative before:absolute
//          before:left-1/2 before:-bottom-[5px] before:h-[2px]
//            before:-translate-x-1/2 before:w-0 data-[state=active]:before:bg-primary data-[state=active]:before:w-full"
//             onClick={() => {
//               setTotalUsersCount(null);
//               handleFetchUsers(1, meta.pageSize, "All");
//             }}
//           >
//             All
//           </TabsTrigger>

//           {Array.from(new Set(selectedRoles.map((role) => role.label))).map((roleLabel) => (
//             <TabsTrigger
//               key={roleLabel}
//               value={roleLabel}
//               className="text-base font-medium capitalize data-[state=active]:shadow-none  data-[state=active]:bg-transparent data-[state=active]:text-primary transition duration-150 before:transition-all before:duration-150 relative before:absolute
//          before:left-1/2 before:-bottom-[5px] before:h-[2px]
//            before:-translate-x-1/2 before:w-0 data-[state=active]:before:bg-primary data-[state=active]:before:w-full"
//               // onClick={() =>
//               //   setColumnFilters([{ id: "role", value: [roleLabel] }])
//               // }
//               onClick={() => {
//                 console.log('total user count ',totalUsersCount);
//                 handleFetchUsers(1, meta.pageSize, roleLabel);
//                 setFilterValue("");
//               }}
//             >
//               <div className="capitalize">
//                 {roleLabel.toLowerCase()}
//               </div>
//             </TabsTrigger>
//           ))}
//         </TabsList>
//       </Tabs>
//       {isLoading ? (
//         <div className="flex flex-col justify-center items-center py-10 space-y-3">
//           <Loader2 className="animate-spin w-8 h-8 text-gray-500" />
//           <span className="text-gray-600 text-sm font-medium">Please wait...</span>
//         </div>
//       ) : (
//         <div className="m-6 mt-0 rounded-md border">
//           <Table >
//             <TableHeader className="bg-default-100">
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <TableRow key={headerGroup.id}>
//                   {headerGroup.headers.map((header) => {
//                     return (
//                       <TableHead key={header.id}>
//                         {header.isPlaceholder
//                           ? null
//                           : flexRender(
//                             header.column.columnDef.header,
//                             header.getContext()
//                           )}
//                       </TableHead>
//                     );
//                   })}
//                 </TableRow>
//               ))}
//             </TableHeader>
//             <TableBody>
//               {table.getRowModel().rows?.length ? (
//                 table.getRowModel().rows.map((row) => (
//                   <TableRow
//                     className="hover:bg-default-100"
//                     key={row.id}
//                     data-state={row.getIsSelected() && "selected"}
//                   >
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell key={cell.id}>
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext()
//                         )}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan={columns.length}
//                     className="h-24 text-center last:text-center"
//                   >
//                     No results.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>


//       )}
//       <div className="flex items-center gap-4 flex-wrap justify-end w-full p-6">
//         <div className="flex flex-wrap items-center gap-6 lg:gap-8">
//           <div className="flex w-[100px] items-center justify-center text-sm font-medium text-muted-foreground">
//             {meta?.pageCount > 0 ? `Page ${meta.currentPage} of 
//                                     ${meta.pageCount}` : null}
//           </div>
//           <div className="flex items-center gap-2">
//             <Button
//               variant="outline"
//               className="hidden h-8 w-8 p-0 lg:flex"
//               onClick={() => handleFetchUsers(1, false, selectedRole)}
//               disabled={meta?.currentPage <= 1}
//             >
//               <span className="sr-only">Go to first page</span>
//               <ChevronsLeft className="h-4 w-4 rtl:rotate-180" />
//             </Button>
//             <Button
//               variant="outline"
//               className="h-8 w-8 p-0"
//               // onClick={() => table.previousPage()}
//               onClick={() => { handleFetchUsers(meta?.currentPage - 1, false, selectedRole) }}
//               disabled={meta?.currentPage <= 1}
//             >
//               <span className="sr-only">Go to previous page</span>
//               <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
//             </Button>
//             <Button
//               variant="outline"
//               className="h-8 w-8 p-0"
//               onClick={() => { handleFetchUsers(meta?.currentPage + 1, false, selectedRole) }}
//               disabled={meta?.currentPage >= meta?.pageCount}
//             >
//               <span className="sr-only">Go to next page</span>
//               <ChevronRight className="h-4 w-4 rtl:rotate-180" />
//             </Button>
//             <Button
//               variant="outline"
//               className="hidden h-8 w-8 p-0 lg:flex"
//               onClick={() => handleFetchUsers(meta?.pageCount, false, selectedRole)}
//               disabled={meta?.currentPage >= meta?.pageCount}
//             >
//               <span className="sr-only">Go to last page</span>
//               <ChevronsRight className="h-4 w-4 rtl:rotate-180" />
//             </Button>
//           </div>
//         </div>
//       </div>
//       {/* <div className="m-6 mt-0 rounded-md border">
// <ProjectList
//   // data={filteredDataUser}  // Pass the correct user data
//   table={table}
//   columns={columns}
//   meta={meta}
//   func={handleFetchUsers}  // Function to fetch paginated users
// />
// </div> */}
//     </>
//   );
// }

// export default Users;

