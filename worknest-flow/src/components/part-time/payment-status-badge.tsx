import React from "react";
import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from "@/types/part-time";

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({ status }) => {
  const getVariant = () => {
    switch (status) {
      case "Paid":
        return "default"; // Usually green/emerald
      case "Partial":
        return "secondary"; // Usually yellow/blue
      case "Pending":
        return "destructive"; // Usually red
      default:
        return "outline";
    }
  };

  const getStyles = () => {
    switch (status) {
      case "Paid":
        return "bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-sm";
      case "Partial":
        return "bg-tech-blue hover:bg-tech-blue/90 text-white border-none shadow-sm";
      case "Pending":
        return "bg-rose-500 hover:bg-rose-600 text-white border-none shadow-sm";
      default:
        return "";
    }
  };

  return (
    <Badge className={`rounded-full px-3 py-0.5 font-medium ${getStyles()}`} variant={getVariant()}>
      {status}
    </Badge>
  );
};
