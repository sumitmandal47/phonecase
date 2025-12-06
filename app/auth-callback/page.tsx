

"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getAuthStatus } from "./actions";

const Page = () => {
  const [configId, setConfigId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const configurationId = localStorage.getItem("configurationId");
    if (configurationId) setConfigId(configurationId);
  }, []);

  const { data, isError } = useQuery({
    queryKey: ["auth-callback"],
    queryFn: () => getAuthStatus(),
    retry: false,
  });

  // 👉 REDIRECT INSIDE EFFECT — not inside render
  useEffect(() => {
    if (data?.success) {
      if (configId) {
        localStorage.removeItem("configurationId");
        router.push(`/configure/preview?id=${configId}`);
      } else {
        router.push("/");
      }
    }
  }, [data, configId, router]);

  if (isError) {
    return (
      <div className="w-full mt-24 flex justify-center">
        <div className="flex flex-col items-center gap-2">
          <p className="text-red-500 font-semibold">Authentication failed.</p>
          <p>Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
        <h3 className="font-semibold text-xl">Logging you in...</h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
};

export default Page;
