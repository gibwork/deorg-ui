import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ArrowUpRight, ArrowDownLeft } from "lucide-react";

export function OrganizationTransactions({ orgId }: { orgId: string }) {
  // Mock data for transactions
  const transactions = [
    {
      id: 1,
      type: "outgoing",
      amount: 25,
      recipient: "bob.sol",
      description: "Payment for landing page design",
      date: "June 10, 2023",
      time: "14:32",
      status: "confirmed",
      txHash: "5xT...",
    },
    {
      id: 2,
      type: "incoming",
      amount: 500,
      sender: "alice.sol",
      description: "Treasury funding",
      date: "June 8, 2023",
      time: "09:15",
      status: "confirmed",
      txHash: "7zR...",
    },
    {
      id: 3,
      type: "outgoing",
      amount: 100,
      recipient: "charlie.sol",
      description: "Payment for smart contract development",
      date: "June 5, 2023",
      time: "16:45",
      status: "confirmed",
      txHash: "9qP...",
    },
    {
      id: 4,
      type: "incoming",
      amount: 200,
      sender: "dave.sol",
      description: "Treasury funding",
      date: "June 3, 2023",
      time: "11:20",
      status: "confirmed",
      txHash: "3mN...",
    },
    {
      id: 5,
      type: "outgoing",
      amount: 50,
      recipient: "alice.sol",
      description: "Payment for community management",
      date: "June 1, 2023",
      time: "13:10",
      status: "confirmed",
      txHash: "2kL...",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
        <p className="text-muted-foreground">
          View all on-chain transactions for your organization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            A record of all financial transactions on the Solana blockchain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`rounded-full p-2 ${
                      tx.type === "incoming"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}
                  >
                    {tx.type === "incoming" ? (
                      <ArrowDownLeft className="h-5 w-5" />
                    ) : (
                      <ArrowUpRight className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <p className="font-medium">
                      {tx.type === "incoming" ? "Received from" : "Sent to"}{" "}
                      {tx.type === "incoming" ? tx.sender : tx.recipient}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tx.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        tx.type === "incoming"
                          ? "text-green-600 dark:text-green-400"
                          : ""
                      }`}
                    >
                      {tx.type === "incoming" ? "+" : "-"}
                      {tx.amount} SOL
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.date} at {tx.time}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                  >
                    {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                  </Badge>

                  <Button variant="ghost" size="sm" className="text-xs">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
