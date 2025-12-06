

"use server";

import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export const getAuthStatus = async () => {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return { success: false, message: "User not authenticated" };
    }

    // Check by email (correct way)
    const existingUser = await db.user.findUnique({
      where: { email: user.email! },
    });

    // Create only if not exists
    if (!existingUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email!,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error("AUTH ERROR:", error);
    return { success: false, message: "Auth error" };
  }
};
