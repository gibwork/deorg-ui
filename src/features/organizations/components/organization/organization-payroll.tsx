"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Clock, DollarSign } from "lucide-react"

export function OrganizationPayroll() {
  const [showRateModal, setShowRateModal] = useState(false)

  // Mock data for contributors
  const contributors = [
    {
      id: 1,
      name: "Alice",
      address: "alice.sol",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "admin",
      rateType: "hourly",
      rate: 50,
      totalEarned: 1250,
      lastPaid: "June 1, 2023",
    },
    {
      id: 2,
      name: "Bob",
      address: "bob.sol",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "contributor",
      rateType: "fixed",
      rate: 500,
      totalEarned: 2000,
      lastPaid: "June 5, 2023",
    },
    {
      id: 3,
      name: "Charlie",
      address: "charlie.sol",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "contributor",
      rateType: "hourly",
      rate: 40,
      totalEarned: 800,
      lastPaid: "June 10, 2023",
    },
  ]

  // Mock data for payment history
  const paymentHistory = [
    {
      id: 1,
      recipient: "Alice",
      recipientAddress: "alice.sol",
      amount: 250,
      date: "June 1, 2023",
      status: "completed",
      txHash: "5xT...",
    },
    {
      id: 2,
      recipient: "Bob",
      recipientAddress: "bob.sol",
      amount: 500,
      date: "June 5, 2023",
      status: "completed",
      txHash: "7zR...",
    },
    {
      id: 3,
      recipient: "Charlie",
      recipientAddress: "charlie.sol",
      amount: 200,
      date: "June 10, 2023",
      status: "completed",
      txHash: "9qP...",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payroll</h2>
          <p className="text-muted-foreground">Manage contributor rates and payment history.</p>
        </div>
        <Button onClick={() => setShowRateModal(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Set My Rate
        </Button>
      </div>

      <Tabs defaultValue="contributors" className="w-full">
        <TabsList>
          <TabsTrigger value="contributors">Contributors</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="contributors" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contributor Rates</CardTitle>
              <CardDescription>View and manage rates for all contributors in the organization.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contributors.map((contributor) => (
                  <div key={contributor.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contributor.avatar || "/placeholder.svg"} alt={contributor.name} />
                        <AvatarFallback>{contributor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contributor.name}</p>
                        <p className="text-sm text-muted-foreground">{contributor.address}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">
                          {contributor.rate} SOL {contributor.rateType === "hourly" ? "/ hour" : "/ project"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {contributor.rateType.charAt(0).toUpperCase() + contributor.rateType.slice(1)} rate
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-medium">{contributor.totalEarned} SOL</p>
                        <p className="text-sm text-muted-foreground">Total earned</p>
                      </div>

                      <Button variant="outline" size="sm">
                        Pay Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>View all payments made to contributors.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full p-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.recipient}</p>
                        <p className="text-sm text-muted-foreground">{payment.recipientAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">{payment.amount} SOL</p>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {payment.date}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      >
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>

                      <Button variant="ghost" size="sm" className="text-xs">
                        View Tx
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Set Rate Modal */}
      <Dialog open={showRateModal} onOpenChange={setShowRateModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Your Rate</DialogTitle>
            <DialogDescription>Set your preferred rate for work in this organization.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rateType">Rate Type</Label>
              <Select defaultValue="hourly">
                <SelectTrigger id="rateType">
                  <SelectValue placeholder="Select rate type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                  <SelectItem value="fixed">Fixed Rate (per project)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Rate (SOL)</Label>
              <Input id="rate" type="number" placeholder="0.00" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills & Expertise</Label>
              <Input id="skills" placeholder="e.g., Frontend, Smart Contracts, Design" />
              <p className="text-xs text-muted-foreground">This helps match you with appropriate tasks.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRateModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Rate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
