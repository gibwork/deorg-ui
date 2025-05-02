"use server";
import { auth } from "@clerk/nextjs/server";
import axios, { AxiosError } from "axios";

interface ValidateGithubIssueParams {
  url: string;
  branch: string;
}

interface ValidationResponse {
  success?: boolean;
  error?: string;
  type?: "issue" | "branch";
}

interface ErrorRes {
  status_code: number;
  message: string;
}
export async function validateGithubIssue({
  url,
  branch,
}: ValidateGithubIssueParams): Promise<ValidationResponse> {
  const { getToken } = auth();
  const token = await getToken();
  try {
    // Extract owner and repo from GitHub URL
    const match = url.match(/github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/);
    if (!match) {
      return {
        error: "Invalid GitHub issue URL format",
        type: "issue",
      };
    }

    const [, owner, repo, issueNumber] = match;

    // Validate issue exists
    const { data } = await axios.post(
      `${process.env.API_URL}/bounties/issue/verify`,
      {
        issueUrl: url,
        branch,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (data.metadata.issueData.state === "closed") {
      return {
        error: "Issue is closed",
        type: "issue",
      };
    }

    return { success: true };
  } catch (error) {
    const data = (error as AxiosError).response?.data as ErrorRes;

    if (data.message === "Branch not found") {
      return {
        error: "Branch not found",
        type: "branch",
      };
    }
    if (data.message === "Not Found") {
      return {
        error: "Issue not found",
        type: "issue",
      };
    }
    return {
      error: "Failed to validate GitHub issue",
      type: "issue",
    };
  }
}
