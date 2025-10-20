"use client";
import dynamic from "next/dynamic";
// const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import Chart from "react-apexcharts";

import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";
import {
  getGridConfig,
  getLabel,
  getYAxisConfig,
} from "@/lib/appex-chart-options";
import { Icon } from "@iconify/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardSelect from "@/components/dasboard-select";
import { Button } from '@/components/ui/button'
import { useState } from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";

const GroupedBar = ({ height = 350, dynamicSeries, setSelectedYear, selectedYear }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const handleYearSelect = (year) => {
    setSelectedYear(year);
  };
  const { theme: config, setTheme: setConfig, isRtl } = useThemeStore();
  const { theme: mode } = useTheme();

  const theme = themes.find((theme) => theme.name === config);

  const series = dynamicSeries || [
    {
      data: [44, 55, 41, 64, 22, 43],
    },
    {
      data: [53, 32, 33, 52, 13, 44],
    },
  ];
  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        dataLabels: {
          position: "top",
        },
      },
    },
    // title: {
    //   text: "Enrollments",
    //   align: "left",
    //   // margin: 10,
    //   // offsetX: 9,
    //   // offsetY: -10,
    //   style: {
    //     fontSize: '20px',
    //     fontWeight: '500',
    //     color: '#333',
    //     fontFamily: 'sans-serif',
    //   },
    // },
    dataLabels: {
      enabled: false,
      // offsetX: -2,
      // style: {
      //   fontSize: "12px",
      //   fontWeight: 700,
      //   colors: [
      //     `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel
      //     })`,
      //   ],
      // },
    },
    stroke: {
      show: false,
      width: 1,
      colors: [
        `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`,
      ],
    },
    colors: [
      '#0096c7',
      '#ade8f4'
    ],
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
      custom: function ({ series, seriesIndex, dataPointIndex, w }) {
        const value = series[seriesIndex][dataPointIndex];
        const category = w.globals.labels[dataPointIndex];
        const label =
          seriesIndex === 0 ? "Mandatory" : "Elective";

        return `
          <div style="padding: 8px; font-size: 14px; color: #333;">
            <strong>${label}</strong><br/>
            Month: ${category}<br/>
            Count: ${value}
          </div>
        `;
      },
    },
    grid: getGridConfig(
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartGird})`
    ),
    yaxis: {
      // title: {
      //   text: "Y-Axis Label",
      //   style: {
      //     fontSize: '14px', 
      //     fontWeight: 'medium', 
      //     fontFamily: 'sans-serif',
      //     colors: `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
      //   },
      // },
      min: 0,
      max: 10,
      labels: {
        formatter: function (value) {
          return `${value}`;
        },
        style: {
          fontSize: '16px',
          fontWeight: 'medium',
          fontFamily: 'sans-serif',
          colors: `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontSize: '16px',
          fontWeight: 'medium',
          fontFamily: 'sans-serif',
          colors: `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`,
        },
      },
    },
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },

    legend: {
      position: "top",
      horizontalAlign: "center",
      offsetY: 0,
      labels: {
        colors: `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel
          })`,
      },
      itemMargin: {
        horizontal: 5,
        vertical: 5,
      },
      markers: {
        width: 10,
        height: 10,
        radius: 10,
        offsetX: isRtl ? 5 : -5
      },
      formatter: function (seriesName, opts) {
        if (opts.seriesIndex === 0) {
          return "Mandatory"; // Label for Series 1
        } else if (opts.seriesIndex === 1) {
          return "Elective"; // Label for Series 2
        }
      },
    },
  };
  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center w-full py-4">
        <div className="self-start pt-2">
            <CardTitle>Enrollments</CardTitle>
        </div>
        <DropdownMenu className="self-end">
          <DropdownMenuTrigger asChild>
            <Button color="secondary" variant="soft">
              {selectedYear}
              <Icon icon="heroicons:chevron-down" className=" h-5 w-5 ltr:ml-2 rtl:mr-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[196px] " align="start">
            <DropdownMenuLabel>Recents</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {years.map((year) => (
              <DropdownMenuItem key={year} onClick={() => handleYearSelect(year)}>
                {year}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Chart
        options={options}
        series={series}
        type="bar"
        height={height}
        width={"100%"}
      />
    </div>
  );
};

export default GroupedBar;
