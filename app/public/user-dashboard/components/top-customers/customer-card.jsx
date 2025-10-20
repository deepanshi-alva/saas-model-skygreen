"use client"
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { getFilePath } from "@/config/file.path";

const CustomerCard = ({ key, item, index }) => {
  const { name, score, image, color, amount } = item;

  return (
    <>
      <div className={cn({
        "order-2 text-center": index === 1,
        "order-1 text-center": index === 2,
        "order-3 text-center": index === 3,
      })}>
        <div className={`relative p-6 pt-12 rounded`}>
          <div className="relative  left-1/2 -translate-x-1/2 ">
            <div className="relative inline-block ring ring-yellow-400 rounded-full">
              {index === 1 &&
                <span className="absolute -top-[29px] left-1/2 -translate-x-1/2  ">
                  <Icon icon="ph:crown-simple-fill" className="h-10 w-10 text-yellow-400" />
                </span>
              }
              <Avatar className="h-16 w-16">
                {/* ${process.env.NEXT_PUBLIC_STRAPI_URL}/${courseDetail.course.course_thumbnail.url} */}
                <AvatarImage src={getFilePath(image)} alt="" />
                {/* <AvatarFallback>{name ? name : name.slice(0, 2)}</AvatarFallback>  */}
                <AvatarFallback className="rounded uppercase bg-success/30 text-success">
                  {name?.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <Badge
                className="w-[18px] h-[18px] bg-warning/90 text-[10px] font-semibold p-0  items-center justify-center   absolute left-[calc(100%-14px)] top-[calc(100%-20px)] bg-yellow-400">
                {index}
              </Badge>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 ">
            <div className="text-base font-semibold text-default-900 dark:text-default-100 mb-1 whitespace-nowrap">{name}</div>
            <Badge className="bg-info/80">{score}</Badge>
          </div>

          {/* <div className="flex-none w-full mt-4">
            <div className="w-full">
              <div className="flex justify-between items-center gap-2 mb-1">
                <span className="text-xs font-medium text-default-800">Score</span>
                <span className="text-xs font-medium text-default-900">{score}%</span>
              </div>
              <Progress value={score} size="sm" color={color} />
            </div>
          </div> */}
        </div>
      </div>
    </>
  );
};

export default CustomerCard;