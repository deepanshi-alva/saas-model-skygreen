"use client";
import dynamic from "next/dynamic";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
import { useThemeStore } from "@/store";
import { useTheme } from "next-themes";
import { themes } from "@/config/thems";
import { useEffect, useState } from "react";
import axiosInstance from '@/config/axios.config';

import {
  getGridConfig,
  getXAxisConfig,
  getYAxisConfig,
} from "@/lib/appex-chart-options";

const SplineArea = ({ height = 157 }) => {
  const { theme: config, setTheme: setConfig, isRtl } = useThemeStore();
  const { theme: mode } = useTheme();
  const theme = themes.find((theme) => theme.name === config);


  const [series, setSeries] = useState([
    {
      name: "Points",
      data: [],
    },
    {
      name: "Time Spent (Minutes)",
      data: [], // Placeholder or static data for now
    },
  ]);

  console.log("seriesseries", series);


  const options = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 4,
    },
    colors: [
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].primary})`,
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].success})`,
    ],
    tooltip: {
      theme: mode === "dark" ? "dark" : "light",
    },
    grid: getGridConfig(
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartGird})`
    ),

    fill: {
      type: "gradient",
      colors: [
        `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].primary})`,
        `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].success})`,
      ],
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.2,
        opacityTo: 0.1,
        stops: [50, 100, 0],
      },
    },
    yaxis: {
      min: 0, // Start at 0
      // max: 200, // End at 200
      tickAmount: 2, // Divide into 4 ticks (0, 50, 100, 150, 200)
      labels: {
        style: {
          colors: `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`,
        },
      },
    },
    xaxis: getXAxisConfig(
      `hsl(${theme?.cssVars[mode === "dark" ? "dark" : "light"].chartLabel})`
    ),
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    legend: {
      position: "top", // Move the legend to the top
      horizontalAlign: "right", // Align the legend to the right
      labels: {
        colors: `hsl(${theme?.cssVars[
          mode === "dark" || mode === "system" ? "dark" : "light"
        ].chartLabel
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
      }
    },
  };

  // const getCurrentUserRating = async () => {
  //   try {
  //     // http://localhost:1337/api/points?filters[user][id][$eq]=1&populate[user][populate]
  //     const { data } = await axiosInstance({
  //       url: `/api/points?filters[user][id][$eq]=${userId}&populate[user][populate]`,
  //       method: "GET",
  //     });
  //     console.log("getCurrentUserRatingReportCart", data.data);
  //     // Extract the point data and update the series
  //     const pointsData = data.data.map((item) => item.point); // Assuming `data.data` is an array
  //     console.log("pointsData", pointsData);
  //     setSeries((prevSeries) => [
  //       { ...prevSeries[0], data: pointsData },
  //       prevSeries[1], // Keep the "Time Spent" series unchanged
  //     ]);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  // const getLearningActivity = async () => {
  //   try {
  //     // Step 1: Fetch documentIds
  //     const { data } = await axiosInstance({
  //       url: `/api/course-enrollments?filters[user][id][$eq]=${userId}`,
  //       method: "GET",
  //     });
  //     const documentIds = data.data.map((item) => item.documentId);
  //     console.log("documentIds:", documentIds);

  //     // Step 2: Initialize variables for looping through months
  //     const year = new Date().getFullYear(); // Current year
  //     const monthlyWatchTimes = []; // To store watch time for each month
  //     const monthlyPoints = [];
  //     const pointsData = await axiosInstance({
  //       url: `/api/point`, // Replace with your Strapi endpoint for points
  //       method: "GET",
  //     });
  //     const topicPoints = pointsData.data.data.topic;
  //     for (let month = 0; month < 12; month++) {
  //       // Generate dateStart and dateEnd for the current month
  //       const dateStart = new Date(year, month, 1).toISOString(); // Start of the month
  //       const dateEnd = new Date(year, month + 1, 0, 23, 59, 59).toISOString(); // End of the month

  //       console.log(`Processing month: ${month + 1}, Start: ${dateStart}, End: ${dateEnd}`);

  //       // Step 3: Prepare API calls for each documentId for the current month
  //       const apiCalls = documentIds.map((documentId) =>
  //         axiosInstance({
  //           url: `/api/course-enrollments/${documentId}?populate[topicProgress][filters][firstRecorded][$gte]=${dateStart}&populate[topicProgress][filters][firstRecorded][$lte]=${dateEnd}`,
  //           method: "GET",
  //         })
  //       );

  //       // Step 4: Execute all API calls in parallel for the current month
  //       const results = await Promise.all(apiCalls.map(p => p.catch(e => null))); // Catch individual errors
  //       console.log("API Results:", results);
  //       let monthlyWatchTime = 0;
  //       let monthlyPoint = 0;
  //       results.forEach((result) => {
  //         if (result && result.data) {
  //           const topicProgress = result.data.data.topicProgress || [];
  //           topicProgress.forEach((topic) => {
  //             // Calculate total watch time
  //             monthlyWatchTime += parseInt(topic.watchTime) || 0;

  //             // Check if the topic is completed and calculate points
  //             if (topic.is_completed) {
  //               monthlyPoint += topicPoints; // Add points for each completed topic
  //             }
  //           });
  //         }
  //       });
  //       // Step 5: Extract and sum watchTime for the current month
  //       // const monthlyWatchTime = results.reduce((sum, result) => {
  //       //   if (result && result.data) {
  //       //     const topicProgress = result.data.data.topicProgress || [];
  //       //     const watchTimeSum = topicProgress.reduce((topicSum, topic) => {
  //       //       return topicSum + (parseFloat(topic.watchTime) || 0); // Convert watchTime to a number
  //       //     }, 0);
  //       //     return sum + watchTimeSum;
  //       //   }
  //       //   return sum;
  //       // }, 0);

  //       // Add to monthly watch times, set to 0 if no data
  //       // monthlyWatchTimes.push(monthlyWatchTime || 0);
  //       monthlyWatchTimes.push(monthlyWatchTime || 0); // Push watch time
  //       monthlyPoints.push(monthlyPoint || 0);
  //     }
  //     // Step 5: Log results for all months
  //     console.log("Monthly Watch Times:", monthlyWatchTimes);
  //     console.log("Monthly Points:", monthlyPoints);
  //     // Step 6: Update state with new series data
  //     setSeries((prevSeries) => [
  //       {
  //         ...prevSeries[0], // Maintain the Points series
  //         data: monthlyPoints, // Keep existing Points data
  //       },
  //       {
  //         ...prevSeries[1], // Update the Time Spent series
  //         data: monthlyWatchTimes,
  //       },
  //     ]);


  //   } catch (error) {
  //     console.error("Error:", error);
  //   }
  // };
  const getLearningActivity = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/learning-activity`,
        method: 'get'
      });

      console.log("data activity", data);
      const { monthlyWatchTimes, monthlyOverallPoints } = data;

      // Convert Watch Times from Seconds to Minutes
      const watchTimesInMinutes = monthlyWatchTimes.map(time => Math.round(time / 60));

      setSeries([
        {
          data: monthlyOverallPoints, // Keep existing Points data
        },
        {
          data: watchTimesInMinutes, // Converted Time Spent data
        },
      ]);
    } catch (error) {
      console.error("Error:", error);
    }
  };


  useEffect(() => {
    // getCurrentUserRating()
    getLearningActivity()
  }, [])
  return (
    <Chart
      options={options}
      series={series}
      type="area"
      height={height}
      width={"100%"}
    />
  );
};

export default SplineArea;
