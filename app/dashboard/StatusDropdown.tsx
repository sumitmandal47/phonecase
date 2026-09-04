"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { changeOrderStatus } from "./actions";
import { toast } from "sonner";

const LABEL_MAP: Record<keyof typeof OrderStatus, string> = {
  awaiting_shipment: "Awaiting Shipment",
  shipped: "Shipped",
  fullFilled: "Fulfilled",
};

const StatusDropdown = ({
  id,
  orderStatus,
}: {
  id: string;
  orderStatus: OrderStatus;
}) => {
  const router = useRouter();

  const { mutate: mutateStatus, isPending } = useMutation({
    mutationKey: ["change-order-status", id],
    mutationFn: changeOrderStatus,
    onSuccess: () => {
      toast.success("Order status updated!");
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to update status", {
        description: "Please try again later.",
      });
    },
  });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-48 sm:w-52 justify-between items-center text-xs sm:text-sm h-8 sm:h-9"
          disabled={isPending}
          isLoading={isPending}
        >
          <span>{LABEL_MAP[orderStatus]}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.keys(OrderStatus).map((status) => (
          <DropdownMenuItem
            key={status}
            className={cn(
              "flex text-xs sm:text-sm gap-1 items-center p-2.5 cursor-pointer hover:bg-zinc-100",
              {
                "bg-zinc-100 font-medium": orderStatus === status,
              }
            )}
            onClick={() =>
              mutateStatus({ id, newStatus: status as OrderStatus })
            }
          >
            <Check
              className={cn(
                "mr-2 h-4 w-4 text-primary",
                orderStatus === status ? "opacity-100" : "opacity-0"
              )}
            />
            {LABEL_MAP[status as keyof typeof OrderStatus]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StatusDropdown;
