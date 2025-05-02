"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentHistory {
  id: string;
  date: string;
  amount: number;
  recipient: string;
  status: string;
}

interface UpcomingPayment {
  id: string;
  dueDate: string;
  amount: number;
  recipient: string;
}

interface Member {
  id: string;
  name: string;
  role: string;
  ratePerMinute?: number;
  avatar?: string;
}

interface PendingMember {
  id: string;
  name: string;
  role: string;
  ratePerMinute: number;
  proposedBy: string;
  proposedDate: string;
  votes: number;
  quorumRequired: number;
  voters: string[];
}

interface PayrollTabProps {
  members: Member[];
  payroll?: {
    history: PaymentHistory[];
    upcomingPayments: UpcomingPayment[];
  };
}

// Mock data for pending members - in a real app, this would come from the backend
const mockPendingMembers: PendingMember[] = [
  {
    id: "p1",
    name: "Michael Johnson",
    role: "Developer",
    ratePerMinute: 0.07,
    proposedBy: "Jane Doe",
    proposedDate: "2025-04-10",
    votes: 1,
    quorumRequired: 3,
    voters: ["Jane Doe"],
  },
  {
    id: "p2",
    name: "Sarah Williams",
    role: "Designer",
    ratePerMinute: 0.06,
    proposedBy: "John Smith",
    proposedDate: "2025-04-15",
    votes: 2,
    quorumRequired: 3,
    voters: ["John Smith", "Alice Johnson"],
  },
];

// Current user - in a real app, this would come from auth context
const CURRENT_USER = "Jane Doe";

export function PayrollTab({ members, payroll }: PayrollTabProps) {
  const [payrollTab, setPayrollTab] = useState<"payees" | "transactions">(
    "payees"
  );
  const [pendingMembers, setPendingMembers] =
    useState<PendingMember[]>(mockPendingMembers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPayee, setNewPayee] = useState({
    name: "",
    role: "Member",
    ratePerMinute: "0.05",
  });

  // Function to handle voting for a pending member
  const handleVote = (memberId: string) => {
    setPendingMembers((prev) =>
      prev.map((member) => {
        if (member.id === memberId && !member.voters.includes(CURRENT_USER)) {
          return {
            ...member,
            votes: member.votes + 1,
            voters: [...member.voters, CURRENT_USER],
          };
        }
        return member;
      })
    );
  };

  // Handle input changes for new payee form
  const handleInputChange = (field: string, value: string) => {
    setNewPayee((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Function to handle proposing a new payee
  const handleProposePayee = () => {
    if (!newPayee.name || !newPayee.role || !newPayee.ratePerMinute) {
      return; // Don't proceed if any required field is missing
    }

    const newPendingMember: PendingMember = {
      id: `p${Date.now()}`, // Generate a unique ID
      name: newPayee.name,
      role: newPayee.role,
      ratePerMinute: parseFloat(newPayee.ratePerMinute),
      proposedBy: CURRENT_USER,
      proposedDate:
        new Date().toISOString().split("T")[0] || new Date().toISOString(), // Fallback to full ISO string if split fails
      votes: 1, // The proposer automatically votes for the new payee
      quorumRequired: 3, // Default quorum requirement
      voters: [CURRENT_USER], // The proposer is the first voter
    };

    setPendingMembers((prev) => [...prev, newPendingMember]);
    setIsDialogOpen(false);

    // Reset form
    setNewPayee({
      name: "",
      role: "Member",
      ratePerMinute: "0.05",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Payroll Management</h2>
      </div>

      {/* Inner navigation for Payroll */}
      <div className="border-b mb-6">
        <div className="flex space-x-8">
          <button
            className={`pb-2 px-1 ${
              payrollTab === "payees"
                ? "border-b-2 border-primary font-medium"
                : "text-muted-foreground"
            }`}
            onClick={() => setPayrollTab("payees")}
          >
            All Payees
          </button>
          <button
            className={`pb-2 px-1 ${
              payrollTab === "transactions"
                ? "border-b-2 border-primary font-medium"
                : "text-muted-foreground"
            }`}
            onClick={() => setPayrollTab("transactions")}
          >
            Transactions
          </button>
        </div>
      </div>

      {/* Conditional content based on selected tab */}
      {payrollTab === "payees" ? (
        <div>
          {/* Confirmed Payees Section */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Confirmed Payees</h3>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Propose New Payee
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Propose New Payee</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newPayee.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-right">
                        Role
                      </Label>
                      <Select
                        value={newPayee.role}
                        onValueChange={(value) =>
                          handleInputChange("role", value)
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Member">Member</SelectItem>
                          <SelectItem value="Developer">Developer</SelectItem>
                          <SelectItem value="Designer">Designer</SelectItem>
                          <SelectItem value="Manager">Manager</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="rate" className="text-right">
                        Rate ($/min)
                      </Label>
                      <Input
                        id="rate"
                        type="number"
                        step="0.001"
                        min="0.001"
                        value={newPayee.ratePerMinute}
                        onChange={(e) =>
                          handleInputChange("ratePerMinute", e.target.value)
                        }
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      onClick={handleProposePayee}
                      disabled={
                        !newPayee.name ||
                        !newPayee.role ||
                        !newPayee.ratePerMinute
                      }
                    >
                      Propose for Voting
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">Name</th>
                    <th className="py-3 px-4 text-left font-medium">Role</th>
                    <th className="py-3 px-4 text-right font-medium">Rate</th>
                    <th className="py-3 px-4 text-right font-medium">
                      Total Paid
                    </th>
                    <th className="py-3 px-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => {
                    // Calculate total paid to this member
                    const totalPaid =
                      payroll?.history
                        ?.filter((payment) => payment.recipient === member.name)
                        ?.reduce((sum, payment) => sum + payment.amount, 0) ||
                      0;

                    return (
                      <tr key={member.id} className="border-t">
                        <td className="py-3 px-4 font-medium">{member.name}</td>
                        <td className="py-3 px-4">{member.role}</td>
                        <td className="py-3 px-4 text-right">
                          ${member.ratePerMinute?.toFixed(3) || "0.000"}
                          /min
                        </td>
                        <td className="py-3 px-4 text-right">
                          ${totalPaid.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="outline" size="sm">
                            Pay
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pending Payees Section */}
          {pendingMembers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-4">Pending Approval</h3>
              <div className="overflow-hidden rounded-md border bg-muted/20">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Name</th>
                      <th className="py-3 px-4 text-left font-medium">Role</th>
                      <th className="py-3 px-4 text-right font-medium">
                        Proposed Rate
                      </th>
                      <th className="py-3 px-4 text-left font-medium">
                        Proposed By
                      </th>
                      <th className="py-3 px-4 text-center font-medium">
                        Voting Status
                      </th>
                      <th className="py-3 px-4 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingMembers.map((member) => {
                      const hasVoted = member.voters.includes(CURRENT_USER);
                      const votingProgress =
                        (member.votes / member.quorumRequired) * 100;

                      return (
                        <tr key={member.id} className="border-t">
                          <td className="py-3 px-4 font-medium">
                            {member.name}
                          </td>
                          <td className="py-3 px-4">{member.role}</td>
                          <td className="py-3 px-4 text-right">
                            ${member.ratePerMinute.toFixed(3)}/min
                          </td>
                          <td className="py-3 px-4">
                            <div>{member.proposedBy}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(
                                member.proposedDate
                              ).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col items-center">
                              <div className="w-full mb-1">
                                <Progress
                                  value={votingProgress}
                                  className="h-2"
                                />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {member.votes} of {member.quorumRequired} votes
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant={hasVoted ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleVote(member.id)}
                              disabled={hasVoted}
                            >
                              {hasVoted ? "Voted" : "Vote"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Payment History Section */}
          <div>
            <h3 className="text-lg font-medium mb-4">Payment History</h3>
            <div className="overflow-hidden rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="py-3 px-4 text-left font-medium">
                      Recipient
                    </th>
                    <th className="py-3 px-4 text-left font-medium">Date</th>
                    <th className="py-3 px-4 text-right font-medium">Amount</th>
                    <th className="py-3 px-4 text-right font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payroll?.history?.map((payment) => (
                    <tr key={payment.id} className="border-t">
                      <td className="py-3 px-4">{payment.recipient}</td>
                      <td className="py-3 px-4">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
                            payment.status === "Completed"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
