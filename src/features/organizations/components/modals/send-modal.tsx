"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Organization } from "@/types/types.organization";

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization;
}

export function SendModal({ isOpen, onClose, organization }: SendModalProps) {
  const [selectedToken, setSelectedToken] = useState("");
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Get available tokens from organization treasury
  const availableTokens = organization?.treasuryBalances || [];

  // Find selected token details
  const selectedTokenData = availableTokens.find(
    (token) => token.tokenAccount === selectedToken
  );

  // Validate form
  const isFormValid = () => {
    if (!selectedToken || !amount || !recipient) return false;
    if (isNaN(Number(amount)) || Number(amount) <= 0) return false;
    if (selectedTokenData && Number(amount) > Number(selectedTokenData.ui))
      return false;
    return true;
  };

  // Handle form submission
  const handleSend = async () => {
    if (!isFormValid()) return;

    setIsLoading(true);
    setError("");

    try {
      // TODO: Implement actual send transaction logic
      // This would typically involve:
      // 1. Creating a transaction proposal
      // 2. Getting required signatures from organization members
      // 3. Executing the transaction on the blockchain

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // For now, just show success and close
      console.log("Send transaction created:", {
        token: selectedTokenData?.token.symbol,
        amount,
        recipient,
        organization: organization.id,
      });

      // Reset form and close
      setSelectedToken("");
      setAmount("");
      setRecipient("");
      onClose();
    } catch (err) {
      setError("Failed to create send transaction. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when modal closes
  const handleClose = () => {
    setSelectedToken("");
    setAmount("");
    setRecipient("");
    setError("");
    onClose();
  };

  // Validate recipient address (basic validation)
  const isValidRecipient = (address: string) => {
    if (!address) return true; // Allow empty for now
    // Basic Solana address validation (44 characters, base58)
    return (
      /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address) || address.endsWith(".sol")
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Assets</DialogTitle>
          <DialogDescription>
            Send tokens from your organization&apos;s treasury. This will
            require approval from organization members.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Token Selection */}
          <div className="space-y-2">
            <Label htmlFor="token">Select Token</Label>
            <Select value={selectedToken} onValueChange={setSelectedToken}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a token to send" />
              </SelectTrigger>
              <SelectContent>
                {availableTokens.map((token) => (
                  <SelectItem
                    key={token.tokenAccount}
                    value={token.tokenAccount}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{token.token.symbol}</span>
                      <span className="text-sm text-muted-foreground">
                        Balance: {token.ui}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Address */}
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter wallet address or .sol domain"
              className={!isValidRecipient(recipient) ? "border-red-500" : ""}
            />
            {recipient && !isValidRecipient(recipient) && (
              <p className="text-sm text-red-500">
                Please enter a valid Solana address or .sol domain
              </p>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="any"
                min="0"
                max={selectedTokenData?.ui || undefined}
              />
              {selectedTokenData && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {selectedTokenData.token.symbol}
                </div>
              )}
            </div>
            {selectedTokenData && (
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  Available: {selectedTokenData.ui}{" "}
                  {selectedTokenData.token.symbol}
                </span>
                <button
                  type="button"
                  onClick={() => setAmount(selectedTokenData.ui.toString())}
                  className="text-primary hover:underline"
                >
                  Max
                </button>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Transaction Info */}
          <div className="p-4 bg-muted rounded-md text-xs text-muted-foreground">
            <p>
              This transaction will create a proposal that requires approval
              from organization members before execution.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            className="w-full sm:w-auto"
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Transaction"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
