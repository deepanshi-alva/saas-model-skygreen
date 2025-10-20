"use client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UserTable from "./UserTable";

const UserPage = () => {
  return (
    <div className=" space-y-5">
      <Card>
        {/* <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader> */}
        <CardContent className="p-0">
          <UserTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPage;
