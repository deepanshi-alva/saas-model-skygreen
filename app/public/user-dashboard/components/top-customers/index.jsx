import { useEffect, useState } from "react";
import axiosInstance from "@/config/axios.config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CustomerCard from "./customer-card";
import ListItem from "./list-item";
import { data } from "autoprefixer";

const TopCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const [selectedDate, setSelectedDate] = useState({ month: currentMonth, year: currentYear }); // State to manage selected month and year

  // Generate the last 5 months (including their years)
  // const monthsYears = Array.from({ length: 5 }, (_, i) => {
  //   const date = new Date(currentYear, currentMonth - i, 1);
  //   return { month: date.getMonth(), year: date.getFullYear() };
  // });

  const startYear = 2025;
  const monthsYears = [];

  for(let year = startYear ; year <= currentYear ; year++){
    for(let  month = 0 ; month <= 12; month++){
      if(year === currentYear && month > currentMonth) break 
      monthsYears.push({month , year})
    }
  }

  monthsYears.reverse()

  // Map month indices to their names
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getLeaderBoard = async () => {
    try {
      const { month, year } = selectedDate;
      const startOfMonth = new Date(year, month, 1).toISOString();
      const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();

      // const { data } = await axiosInstance({
      //   url: `/api/points?filters[updatedAt][$gte]=${startOfMonth}&filters[updatedAt][$lt]=${endOfMonth}&populate[user][populate][profileImage][fields][0]=url`,
      //   method: "get",
      // });
        const { data } = await axiosInstance({
        url: `/api/activities?filters[Month]=${monthNames[month]}&filters[Year]=${year}&populate[user][populate][profileImage][fields][0]=url&filters[Points][$ne]=0&sort=Points:desc`,
        method: "get",
      });
      console.log("-------data--------  FROM LEADERBOARD", data);
      
      const length = data.data.length;
      console.log("length--fromleaaderbpard-", length)
      const sortedData =  length < 10 ? data.data : data.data.slice(0,10);
      setCustomers(sortedData);
    } catch (error) {
      console.error(error);
    }
  };

  console.log('sorted data---from leaderboard ',customers);
  useEffect(() => {
    getLeaderBoard();
  }, [selectedDate]); // Refetch leaderboard when the selected date changes

  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center gap-4 mb-0 border-none p-6">
        <CardTitle>
          <svg style={{ display: "inline-block" }} xmlns="http://www.w3.org/2000/svg" width="20.101" height="28" viewBox="0 0 20.101 28">
            <g id="Group_1" data-name="Group 1" transform="translate(-1452 -419)">
              <path id="Path" d="M2.611,8.14a11.618,11.618,0,0,1,6.21-1.88C6.546.011,6.728.468,6.626.332A.821.821,0,0,0,6.044,0C5.985,0,.807,0,.74.005A.825.825,0,0,0,.009.942C.03,1.08-.124.627,2.611,8.14Z" transform="translate(1453.091 419)" fill="#023052" />
              <path id="Path-2" data-name="Path" d="M8.77,1.109a.825.825,0,0,0-.655-1.1C8.018-.005,2.839,0,2.814,0a.818.818,0,0,0-.569.268C2.126.406,2.306-.075,0,6.261A11.618,11.618,0,0,1,6.21,8.14Z" transform="translate(1462.197 419)" fill="#023052" />
              <path id="Path-3" data-name="Path" d="M10.054,0A10.047,10.047,0,1,0,20.1,9.9,10.065,10.065,0,0,0,10.054,0Z" transform="translate(1452 426.907)" fill="#e77f2a" />
              <path id="Path-4" data-name="Path" d="M11.811,5.351,9.043,7.389l1.058,3.3a.825.825,0,0,1-1.272.915L6.073,9.576l-2.757,2.03a.824.824,0,0,1-1.272-.915L3.1,7.389.336,5.351A.824.824,0,0,1,.824,3.864h3.41L5.289.57a.824.824,0,0,1,1.568,0L7.913,3.864h3.41a.824.824,0,0,1,.488,1.487Z" transform="translate(1455.981 430.632)" fill="#fff" />
            </g>
          </svg> Leaderboard
        </CardTitle>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button color="secondary" variant="soft">
              {`${monthNames[selectedDate.month]} ${selectedDate.year}`} <Icon icon="heroicons:chevron-down" className="h-5 w-5 ltr:ml-2 rtl:mr-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[196px]" align="start">
            <DropdownMenuLabel>Recents</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {monthsYears.map(({ month, year }, index) => (
              <DropdownMenuItem key={index} onClick={() => setSelectedDate({ month, year })}>
                {`${monthNames[month]} ${year}`}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-0 pt-0">
        {customers.length > 0 ? <div className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 lightOrange">
            {customers.slice(0, 3).map((customer, index) => (
              <CustomerCard
                key={customer.id}
                item={{
                  name: customer?.user?.firstName || customer?.user?.username,
                  score: customer.Points,
                  image: customer?.user?.profileImage?.url,
                  color: "yellow",
                  amount: customer.amount || 0,
                }}
                index={index + 1}
              />
            ))}
          </div>
          <div className="mt-8 p-6 pt-0">
            {customers.slice(3).map((customer, index) => (
              <ListItem
                key={`customer-${customer.id}`}
                item={{
                  name: customer.user?.firstName || customer.user?.username,
                  score: customer.Points,
                  image: customer.user?.profileImage?.url,
                  color: "yellow",
                  amount: customer.amount || 0,
                }}
                index={index + 4}
              />
            ))}
          </div>
        </div> : <h2 className="text-md text-slate-500 font-semibold courseHeading  text-center p-3">No Leaderboard available</h2>}
        
      </CardContent>
    </Card>
  );
};

export default TopCustomers;
