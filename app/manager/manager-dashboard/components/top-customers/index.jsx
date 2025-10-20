
import DashboardDropdown from "@/components/dashboard-dropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { data } from "./data";
import ListItem from "./list-item";
import CustomerCard from "./customer-card";

const TopCustomers = () => {
  return (
    <Card>
      <CardHeader className="flex-row justify-between items-center gap-4 mb-0 border-none p-6">
        <CardTitle>
          <svg style={{ display: 'inline-block' }} xmlns="http://www.w3.org/2000/svg" width="20.101" height="28" viewBox="0 0 20.101 28">
  <g id="Group_1" data-name="Group 1" transform="translate(-1452 -419)">
    <path id="Path" d="M2.611,8.14a11.618,11.618,0,0,1,6.21-1.88C6.546.011,6.728.468,6.626.332A.821.821,0,0,0,6.044,0C5.985,0,.807,0,.74.005A.825.825,0,0,0,.009.942C.03,1.08-.124.627,2.611,8.14Z" transform="translate(1453.091 419)" fill="#023052"/>
    <path id="Path-2" data-name="Path" d="M8.77,1.109a.825.825,0,0,0-.655-1.1C8.018-.005,2.839,0,2.814,0a.818.818,0,0,0-.569.268C2.126.406,2.306-.075,0,6.261A11.618,11.618,0,0,1,6.21,8.14Z" transform="translate(1462.197 419)" fill="#023052"/>
    <path id="Path-3" data-name="Path" d="M10.054,0A10.047,10.047,0,1,0,20.1,9.9,10.065,10.065,0,0,0,10.054,0Z" transform="translate(1452 426.907)" fill="#e77f2a"/>
    <path id="Path-4" data-name="Path" d="M11.811,5.351,9.043,7.389l1.058,3.3a.825.825,0,0,1-1.272.915L6.073,9.576l-2.757,2.03a.824.824,0,0,1-1.272-.915L3.1,7.389.336,5.351A.824.824,0,0,1,.824,3.864h3.41L5.289.57a.824.824,0,0,1,1.568,0L7.913,3.864h3.41a.824.824,0,0,1,.488,1.487Z" transform="translate(1455.981 430.632)" fill="#fff"/>
  </g>
</svg> Leaderboard</CardTitle>
        {/* <DashboardDropdown /> */}
      </CardHeader>
      <CardContent className="p-0 pt-0">

        <div className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-6 lightOrange">
            {
              data.slice(0, 3).map((item, index) => <CustomerCard key={item.id} item={item} index={index + 1} />)
            }

          </div>
          <div className="mt-8 p-6 pt-0">
            {data.slice(3).map((item, index) =>
              <ListItem key={`customer-${item.id}`} item={item} index={index + 3} />
            )}
          </div>


        </div>
      </CardContent>
    </Card>
  );
};

export default TopCustomers;