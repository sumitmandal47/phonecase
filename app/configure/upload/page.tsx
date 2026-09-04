"use client";
import { Progress } from "@/components/ui/progress";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";


import { Image, Loader2, MousePointerSquareDashed } from "lucide-react";
import { useRouter } from "next/navigation";

import { useState, useTransition } from "react";
import Dropzone, { FileRejection } from "react-dropzone";
import { toast } from "sonner";

const Page = () => {
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const router = useRouter();

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: ([data]) => {
      const configId = data.serverData.configId;
      startTransition(() => {
        router.push(`/configure/design?id=${configId}`);
      });
    },
    onUploadProgress(p) {
      setUploadProgress(p);
    },
    onUploadError(err) {
      toast.error("Upload failed", {
        description: err.message || "Please check your file and try again.",
      });
    },
  });

  const onDropRejected = (rejectedFiles: FileRejection[]) => {
    const [file] = rejectedFiles;
    setIsDragOver(false);

    toast.error(`${file.file.type || "File"} is not supported`, {
      description: "Please choose a PNG, JPG, or JPEG image instead.",
    });
  };

  const onDropAccepted = (acceptedFiles: File[]) => {
    startUpload(acceptedFiles, { configId: undefined });
    setIsDragOver(false);
  };

  const [isPending, startTransition] = useTransition();

  return (
    <div
      className={cn(
        "relative flex flex-1 h-full w-full min-h-[360px] sm:min-h-[460px] my-10 sm:my-16 rounded-xl bg-gray-900/5 p-4 sm:p-6 ring-inset ring-gray-950/10 lg:rounded-2xl justify-center flex-col items-center transition-colors",
        {
          "ring-blue-900/25 bg-blue-900/10": isDragOver,
        }
      )}
    >
      <div className="relative flex flex-1 flex-col items-center justify-center w-full">
        <Dropzone
          onDropRejected={onDropRejected}
          onDropAccepted={onDropAccepted}
          accept={{
            "image/png": [".png"],
            "image/jpeg": [".jpeg"],
            "image/jpg": [".jpg"],
          }}
          onDragEnter={() => setIsDragOver(true)}
          onDragLeave={() => setIsDragOver(false)}
        >
          {({ getRootProps, getInputProps }) => (
            <div
              className="h-full w-full flex-1 flex flex-col items-center justify-center cursor-pointer py-10"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              {isDragOver ? (
                <MousePointerSquareDashed className="h-6 w-6 text-zinc-500 mb-2" />
              ) : isUploading || isPending ? (
                <Loader2 className="animate-spin h-6 w-6 text-zinc-500 mb-2" />
              ) : (
                <Image className="h-6 w-6 text-zinc-500 mb-2" />
              )}
              <div className="flex flex-col justify-center mb-2 text-zinc-700 text-sm text-center">
                {isUploading ? (
                  <div className="flex flex-col items-center">
                    <p>Uploading...</p>
                    <Progress
                      value={uploadProgress}
                      className="mt-2 h-2 w-40 bg-gray-300"
                    />
                  </div>
                ) : isPending ? (
                  <div className="flex flex-col items-center">
                    <p>Redirecting, please wait...</p>
                  </div>
                ) : isDragOver ? (
                  <p>
                    <span className="font-semibold">Drop file</span> to upload
                  </p>
                ) : (
                  <p>
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                )}
              </div>
              {isPending ? null : (
                <p className="text-xs text-zinc-500">PNG, JPG, JPEG up to 4MB</p>
              )}
            </div>
          )}
        </Dropzone>
      </div>
    </div>
  );
};

export default Page;
