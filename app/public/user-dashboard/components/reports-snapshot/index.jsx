"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReportsChart from "./reports-chart";
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import DashboardSelect from "@/components/dasboard-select";
import { cn } from "@/lib/utils";

const allUsersSeries = [
  {
    data: [90, 70, 85, 60, 80, 70, 90, 75, 60, 80],
  },
];
const conversationSeries = [
  {
    data: [80, 70, 65, 40, 40, 100, 100, 75, 60, 80],
  },
];
const eventCountSeries = [
  {
    data: [20, 70, 65, 60, 40, 60, 90, 75, 60, 40],
  },
];
const newUserSeries = [
  {
    data: [20, 70, 65, 40, 100, 60, 100, 75, 60, 80],
  },
];
const SplineArea = () => {
  const { theme: config, setTheme: setConfig } = useThemeStore();
  const { theme: mode } = useTheme();
  const theme = themes.find((theme) => theme.name === config);
  const primary = `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].primary
    })`;
  const warning = `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].warning
    })`;
  const success = `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].success
    })`;
  const info = `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].info
    })`;
  const tabsTrigger = [
    {
      value: "all",
      text: "all user",
      total: "10,234",
      color: "primary",
    },
    {
      value: "event",
      text: "Event Count",
      total: "536",
      color: "warning",
    },
    {
      value: "conversation",
      text: "conversations",
      total: "21",
      color: "success",
    },
    {
      value: "newuser",
      text: "New User",
      total: "3321",
      color: "info",
    },
  ];
  const tabsContentData = [
    {
      value: "all",
      series: allUsersSeries,
      color: primary,
    },
    {
      value: "event",
      series: eventCountSeries,
      color: warning,
    },
    {
      value: "conversation",
      series: conversationSeries,
      color: success,
    },
    {
      value: "newuser",
      series: newUserSeries,
      color: info,
    },
  ];
  return (
    <Card>
      <CardHeader className="border-none pb-0 mb-0 learningActivityBlock 2xl:absolute md:relative">
        <div className="flex items-center gap-2 flex-wrap ">
          <div className="flex-1">
            {/* <div className="text-xl font-semibold text-default-900 whitespace-nowrap">
              Learning Activity
            </div> */}
            <h2>Learning Activity</h2>
            
          </div>
          <div className="flex-none">
            {/* <DashboardSelect /> */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-4 py-1 learnActivHome">
        <Tabs defaultValue="all">
          
          {/* charts data */}
          {tabsContentData.map((item, index) => (
            <TabsContent key={`report-tab-${index}`} value={item.value}>
              <ReportsChart series={item.series} chartColor={item.color} />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SplineArea;
