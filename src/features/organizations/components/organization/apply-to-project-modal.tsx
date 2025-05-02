"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

interface ApplyToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  project: any;
}

export function ApplyToProjectModal({
  isOpen,
  onClose,
  onSubmit,
  project,
}: ApplyToProjectModalProps) {
  const [role, setRole] = useState("");
  const [motivation, setMotivation] = useState("");
  const [skills, setSkills] = useState("");
  const [commitment, setCommitment] = useState("");
  const [agreeToVoting, setAgreeToVoting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      setError("Please select a role");
      return;
    }

    if (!motivation.trim()) {
      setError("Please explain your motivation for joining this project");
      return;
    }

    if (!skills.trim()) {
      setError("Please list your relevant skills");
      return;
    }

    if (!commitment) {
      setError("Please select your time commitment");
      return;
    }

    if (!agreeToVoting) {
      setError("You must agree to the voting process");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // This is where you would connect to your API/blockchain
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      onSubmit({
        projectId: project.id,
        role,
        motivation,
        skills,
        commitment,
      });
    } catch (err) {
      setError("Failed to submit application. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply to Join Project</DialogTitle>
          <DialogDescription>
            Apply to join &quot;{project.title}&quot; as a contributor. Your
            application will be voted on by existing contributors.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="role">Desired Role</Label>
            <Select
              value={role}
              onValueChange={setRole}
              disabled={isSubmitting}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="developer">Developer</SelectItem>
                <SelectItem value="designer">Designer</SelectItem>
                <SelectItem value="project_manager">Project Manager</SelectItem>
                <SelectItem value="tester">Tester</SelectItem>
                <SelectItem value="content_creator">Content Creator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="motivation">Motivation</Label>
            <Textarea
              id="motivation"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Why do you want to join this project?"
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Relevant Skills</Label>
            <Textarea
              id="skills"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="List your skills relevant to this project"
              disabled={isSubmitting}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="commitment">Time Commitment</Label>
            <Select
              value={commitment}
              onValueChange={setCommitment}
              disabled={isSubmitting}
            >
              <SelectTrigger id="commitment">
                <SelectValue placeholder="Select time commitment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_time">
                  Full-time (40+ hours/week)
                </SelectItem>
                <SelectItem value="part_time">
                  Part-time (20-40 hours/week)
                </SelectItem>
                <SelectItem value="casual">Casual (5-20 hours/week)</SelectItem>
                <SelectItem value="minimal\">
                  Minimal ({"<"} 5 hours/week)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Checkbox
              id="agreeToVoting"
              checked={agreeToVoting}
              onCheckedChange={(checked) =>
                setAgreeToVoting(checked as boolean)
              }
              disabled={isSubmitting}
            />
            <Label htmlFor="agreeToVoting" className="text-sm">
              I understand that my application will be subject to a vote by
              existing contributors
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
