"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

interface RoleDropdownProps {
  currentRole: string;
  memberId: string;
  organizationId: string;
  currentUserRole: string;
  memberExternalId: string;
}

const ROLES = ["ADMIN", "CONTRIBUTOR", "MEMBER"] as const;

export function RoleDropdown({
  currentRole,
  memberId,
  organizationId,
  currentUserRole,
  memberExternalId,
}: RoleDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();
  const { userId, getToken } = useAuth();

  const updateMemberRole = async (newRole: string) => {
    const token = await getToken();

    const { data } = await axios.patch(
      `${process.env.API_URL}/organizations/${organizationId}/members/${memberId}`,
      { role: newRole },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return data;
  };

  const mutation = useMutation({
    mutationFn: updateMemberRole,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organization", organizationId],
      });
      toast.success("Role updated successfully");
    },
    onError: () => {
      toast.error("Failed to update role");
    },
  });

  const handleRoleChange = async (newRole: string) => {
    if (newRole === currentRole) return;
    mutation.mutate(newRole);
  };

  const isDisabled =
    currentUserRole !== "ADMIN" ||
    mutation.isPending ||
    memberExternalId === userId;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-[120px] justify-between"
          disabled={isDisabled}
        >
          {currentRole}
          <ChevronDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {ROLES.map((role) => (
          <DropdownMenuItem
            key={role}
            onClick={() => handleRoleChange(role)}
            className={role === currentRole ? "bg-accent" : ""}
            disabled={isDisabled}
          >
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
