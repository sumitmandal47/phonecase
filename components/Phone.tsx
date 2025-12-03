
"use client";

import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface PhoneProps extends HTMLAttributes<HTMLDivElement> {
  imgSrc: string;
  dark?: boolean;
}

const Phone = ({ imgSrc, className, dark = false, ...props }: PhoneProps) => {
  return (
    <div
      className={cn(
        "relative pointer-events-none z-10 overflow-hidden w-[260px] h-[500px]",
        className
      )}
      {...props}
    >
      
      <div className="absolute inset-0">
        <img className="object-cover w-full h-full" src={imgSrc} alt="image" />
      </div>

   
      <img
        className="pointer-events-none select-none absolute inset-0 w-full h-full z-20"
        src={
          dark
            ? "/phone-template-dark-edges.png"
            : "/phone-template-white-edges.png"
        }
        alt="phone image"
      />

      <div className="absolute -z-10 inset-0 ">
        
      <img className="object-cover min-w-full min-h-full" src={imgSrc} alt="overlaying pgone image" />
      </div>
    </div>
  );
};

export default Phone;
