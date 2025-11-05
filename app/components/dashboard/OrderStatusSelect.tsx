"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface OrderStatusSelectProps {
  orderId: number;
  currentStatus: string;
}

const statusOptions = [
  { value: "pending", label: "En attente", color: "text-yellow-600" },
  { value: "processing", label: "En cours", color: "text-blue-600" },
  { value: "shipped", label: "Expédié", color: "text-purple-600" },
  { value: "delivered", label: "Livré", color: "text-green-600" },
  { value: "cancelled", label: "Annulé", color: "text-red-600" },
];

export default function OrderStatusSelect({
  orderId,
  currentStatus,
}: OrderStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === status) return;

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la mise à jour");
      }

      setStatus(newStatus);
      router.refresh();
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Impossible de mettre à jour le statut de la commande"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const currentOption = statusOptions.find((opt) => opt.value === status);

  return (
    <Select
      value={status}
      onValueChange={handleStatusChange}
      disabled={isUpdating}
    >
      <SelectTrigger
        className={`w-[140px] ${currentOption?.color || ""} font-medium`}
      >
        <SelectValue>
          {isUpdating ? "Mise à jour..." : currentOption?.label || status}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className={option.color}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
