
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
      {/* User image */}
      <div className="absolute inset-0">
        <img className="object-cover w-full h-full" src={imgSrc} alt="image" />
      </div>

      {/* Phone frame */}
      <img
        className="pointer-events-none select-none absolute inset-0 w-full h-full z-20"
        src={
          dark
            ? "/phone-template-dark-edges.png"
            : "/phone-template-white-edges.png"
        }
        alt="phone image"
      />
    </div>
  );
};

export default Phone;
