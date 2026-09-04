import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db";
import { formatPrice } from "@/lib/utils";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";
import StatusDropdown from "./StatusDropdown";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Package, TrendingUp, DollarSign, Calendar } from "lucide-react";

const Page = async () => {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

  if (!user) {
    redirect("/api/auth/login?returnTo=/dashboard");
  }

  if (ADMIN_EMAIL && user.email !== ADMIN_EMAIL) {
    return notFound();
  }

  const orders = await db.order.findMany({
    where: {
      isPaid: true,
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      user: true,
      shippingAddress: true,
      configuration: true,
    },
  });

  const lastWeekSum = await db.order.aggregate({
    where: {
      isPaid: true,
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7)),
      },
    },
    _sum: {
      amount: true,
    },
  });

  const lastMonthSum = await db.order.aggregate({
    where: {
      isPaid: true,
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 30)),
      },
    },
    _sum: {
      amount: true,
    },
  });

  const WEEKLY_GOAL = 500;
  const MONTHLY_GOAL = 2500;

  const weeklyAmount = lastWeekSum._sum.amount ?? 0;
  const monthlyAmount = lastMonthSum._sum.amount ?? 0;
  const monthlyProgress = Math.min(
    Math.round((monthlyAmount / MONTHLY_GOAL) * 100),
    100
  );

  return (
    <div className="flex min-h-screen w-full bg-muted/40 py-8">
      <MaxWidthWrapper>
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900">
                Dashboard
              </h1>
              <p className="text-sm sm:text-base text-zinc-500 mt-1">
                Welcome back, {user.given_name || user.email}. Here is your store summary.
              </p>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <span>Last 7 Days</span>
                  <DollarSign className="h-4 w-4 text-zinc-400" />
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-bold">
                  {formatPrice(weeklyAmount)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-zinc-500">
                  of {formatPrice(WEEKLY_GOAL)} weekly goal
                </div>
              </CardContent>
              <CardFooter>
                <Progress
                  value={(weeklyAmount / WEEKLY_GOAL) * 100}
                  className="h-2 bg-zinc-200"
                />
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <span>Last 30 Days</span>
                  <TrendingUp className="h-4 w-4 text-zinc-400" />
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-bold">
                  {formatPrice(monthlyAmount)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-zinc-500">
                  of {formatPrice(MONTHLY_GOAL)} monthly goal
                </div>
              </CardContent>
              <CardFooter>
                <Progress value={monthlyProgress} className="h-2 bg-zinc-200" />
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <span>Active Orders</span>
                  <Package className="h-4 w-4 text-zinc-400" />
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-bold">
                  {orders.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-zinc-500">
                  Orders placed in the last 7 days
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center justify-between text-xs font-medium uppercase tracking-wider text-zinc-500">
                  <span>Monthly Target</span>
                  <Calendar className="h-4 w-4 text-zinc-400" />
                </CardDescription>
                <CardTitle className="text-2xl sm:text-3xl font-bold">
                  {monthlyProgress}%
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-zinc-500">
                  Target achievement rate
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Section */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                Incoming Orders
              </h2>
              <p className="text-sm text-zinc-500">
                Manage and update recent customer orders.
              </p>
            </div>

            <Card className="overflow-hidden">
              {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <Package className="h-12 w-12 text-zinc-400 mb-3" />
                  <h3 className="text-lg font-semibold text-zinc-900">
                    No orders found
                  </h3>
                  <p className="text-sm text-zinc-500 max-w-sm mt-1">
                    There are no paid orders placed in the last 7 days yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead className="hidden sm:table-cell">Status</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead className="hidden lg:table-cell">Address</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id} className="bg-accent/10">
                          <TableCell>
                            <div className="font-medium text-zinc-900">
                              {order.shippingAddress?.name || "Customer"}
                            </div>
                            <div className="text-xs text-zinc-500 truncate max-w-[160px] sm:max-w-xs">
                              {order.user.email}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize bg-zinc-100 text-zinc-800">
                              {order.status.replace("_", " ")}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs text-zinc-500">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell text-xs text-zinc-500">
                            {order.shippingAddress ? (
                              <span>
                                {order.shippingAddress.city},{" "}
                                {order.shippingAddress.country}
                              </span>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatPrice(order.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end">
                              <StatusDropdown
                                id={order.id}
                                orderStatus={order.status}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default Page;
