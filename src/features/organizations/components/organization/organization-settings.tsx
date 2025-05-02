"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useOrganization } from "../../hooks/use-organization";

export function OrganizationSettings({
  organizationId,
}: {
  organizationId: string;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: organization } = useOrganization(organizationId);

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Implement API call to update organization settings
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Success!
      console.log("Saved general settings:", organization);
    } catch (err) {
      setError("Failed to save settings. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your organization settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 mt-6">
          <form onSubmit={handleSaveGeneral}>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Organization Profile</CardTitle>
                <CardDescription>
                  Update your organization&apos;s basic information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    value={organization?.name}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={3}
                    value={organization?.description}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    // value={organization?.website}
                    value="orgnaization.domain.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      // value={organization?.twitter}
                      value="organization.twitter"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discord">Discord</Label>
                    <Input
                      id="discord"
                      // value={organization?.discord}
                      value="organization.discord"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="publicProfile"
                    checked={false}
                    // onCheckedChange={(checked) =>
                    //   setOrgData({ ...orgData, publicProfile: checked })
                    // }
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="publicProfile">
                    Make organization profile public
                  </Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Save className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="governance" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Governance Settings</CardTitle>
              <CardDescription>
                Configure how proposals and voting work in your organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="votingThreshold">
                  Voting Approval Threshold (%)
                </Label>
                <Input
                  id="votingThreshold"
                  type="number"
                  min="1"
                  max="100"
                  // value={orgData.votingThreshold}
                  value="60"
                />
                <p className="text-xs text-muted-foreground">
                  Percentage of votes needed for a proposal to pass.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="votingPeriod">Voting Period (days)</Label>
                <Input
                  id="votingPeriod"
                  type="number"
                  min="1"
                  // value={orgData.votingPeriod}
                  value="3"
                />
                <p className="text-xs text-muted-foreground">
                  How long proposals remain open for voting.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rolePromotion">
                  Role Promotion Requirements
                </Label>
                <Select defaultValue="majority">
                  <SelectTrigger id="rolePromotion">
                    <SelectValue placeholder="Select requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="majority">
                      Simple Majority (50%+)
                    </SelectItem>
                    <SelectItem value="supermajority">
                      Super Majority (66%+)
                    </SelectItem>
                    <SelectItem value="consensus">
                      Full Consensus (100%)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Voting threshold for promoting members to new roles.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Governance Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure advanced options for your organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoPayments"
                  checked={false}
                  // onCheckedChange={(checked) =>
                  //   setOrgData({ ...orgData, autoPayments: checked })
                  // }
                />
                <div>
                  <Label htmlFor="autoPayments">Automatic Payments</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically pay contributors when tasks are completed and
                    approved.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="treasury">Treasury Management</Label>
                <Select defaultValue="multisig">
                  <SelectTrigger id="treasury">
                    <SelectValue placeholder="Select treasury type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multisig">
                      Multisig Wallet (Default)
                    </SelectItem>
                    <SelectItem value="program">
                      Program-Controlled Treasury
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  How your organization&apos;s funds are managed and controlled.
                </p>
              </div>

              <div className="pt-6">
                <Button variant="destructive">Dissolve Organization</Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This action requires approval from all admins and will return
                  funds to contributors.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>
                <Save className="mr-2 h-4 w-4" />
                Save Advanced Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
