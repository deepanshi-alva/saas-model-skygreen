"use client";
import Image from "next/image";
import background from "@/public/images/auth/login-screen-skygreen1.png";
import ForgotForm from "./forgot-form";

const ForgotPage = () => {
  return (
    <>
      <div className="min-h-screen bg-background  flex items-center  overflow-hidden w-full">
        <div className="min-h-screen basis-full flex flex-wrap w-full  justify-center overflow-y-auto">
        <div
          className="basis-1/2 bg-primary w-full  relative hidden xl:flex justify-center items-center bg-gradient-to-br
        from-primary-600 via-primary-400 to-primary-600
       "
        >
          <div className="relative z-10 max-w-[1024px]">
            <div>
            <Image
            src={background}
            alt="image"
            className="w-full h-full "
          />
            </div>
          </div>
        </div>

          <div className=" min-h-screen basis-full md:basis-1/2 w-full px-4 py-5 flex justify-center items-center">
            <div className="lg:w-[480px] ">
              <ForgotForm />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPage;
