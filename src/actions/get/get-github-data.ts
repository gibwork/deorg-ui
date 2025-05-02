"use server";

import { auth } from "@clerk/nextjs/server";
import axios from "axios";

export const getGithubRepos = async () => {
  const { userId, getToken } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.get(
      `${process.env.API_URL}/users/${userId}/repos`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch repos" };
  }
};

export const getGithubRepoData = async (repo: string) => {
  const { userId, getToken } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.get(
      `${process.env.API_URL}/users/${repo}/issues`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch repos" };
  }
};

export const compareCommits = async (attemptId: string) => {
  const { userId, getToken } = auth();
  const token = await getToken();
  try {
    const { data } = await axios.get(
      `${process.env.API_URL}/users/compare-commits/${attemptId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return { success: data };
  } catch (error) {
    return { error: "Could not fetch repos" };
  }
};
