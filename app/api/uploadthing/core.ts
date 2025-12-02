// export const runtime = "nodejs";

// import { createUploadthing, type FileRouter } from "uploadthing/next";
// import sharp from "sharp";
// import { z } from "zod";
// import { db } from "@/db";

// const f = createUploadthing();

// export const ourFileRouter = {
//   imageUploader: f({
//     image: {
//       maxFileSize: "4MB",
//       maxFileCount: 1,
//     },
//   })
//     .input(z.object({ configId: z.string().optional() }))

//     .middleware(async ({ input }) => {
//       return { input };
//     })
//     .onUploadComplete(async ({ metadata, file }) => {
//       const { configId } = metadata.input;
//       const res = await fetch(file.ufsUrl);

//       const buffer = await res.arrayBuffer();

//       const imgMetadata = await sharp(buffer).metadata();

//       const { width, height } = imgMetadata;

//       if (!configId) {
//         const configuration = await db.configuration.create({
//           data: {
//             imageUrl: file.ufsUrl,
//             height: height || 500,
//             width: width || 500,
//           },
//         });
//         return { configId: configuration.id };
//       } else {
//         const updatedConfiguration = await db.configuration.update({
//           where: {
//             id:configId,
//           },
//           data: {
//             croppedImageUrl: file.ufsUrl,
//           },
//         });
//         return { configId: updatedConfiguration.id };
//       }
//     }),
// } satisfies FileRouter;

// export type OurFileRouter = typeof ourFileRouter;

export const runtime = "nodejs";

import { createUploadthing, type FileRouter } from "uploadthing/next";
import sharp from "sharp";
import { z } from "zod";
import { db } from "@/db";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .input(z.object({ configId: z.string().optional() }))

    .middleware(async ({ input }) => {
      return { input };
    })

    .onUploadComplete(async ({ metadata, file }) => {
      const { configId } = metadata.input;

      // fetch file from UploadThing's temp URL
      const response = await fetch(file.ufsUrl);
      const arrayBuffer = await response.arrayBuffer();

      // sharp requires Node.js Buffer
      const sharpBuffer = Buffer.from(arrayBuffer);

      const imgMetadata = await sharp(sharpBuffer).metadata();
      const { width, height } = imgMetadata;

      if (!configId) {
        // Create new configuration
        const configuration = await db.configuration.create({
          data: {
            imageUrl: file.ufsUrl,
            width: width || 500,
            height: height || 500,
          },
        });

        return { configId: configuration.id };
      } else {
        // Update existing configuration
        const updatedConfig = await db.configuration.update({
          where: { id: configId },
          data: {
            croppedImageUrl: file.ufsUrl,
          },
        });

        return { configId: updatedConfig.id };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
