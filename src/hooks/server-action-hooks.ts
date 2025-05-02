import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";
import {
  createServerActionsKeyFactory,
  setupServerActionHooks,
} from "zsa-react-query";

export const QueryKeyFactory = createServerActionsKeyFactory({
  getBadges: () => ["getBadges"],
  getUserData: (id: string) => ["getUserData", id],
  getBounties: () => ["getBounties"],
  getBounty: (id: string) => ["getBounty", id],
  getQuestions: () => ["getQuestions"],
  getQuestion: (id: string) => ["getQuestion", id],
  getTasks: () => ["getTasks"],
  getTask: (id: string) => ["getTask", id],
});

const {
  useServerActionQuery,
  useServerActionMutation,
  useServerActionInfiniteQuery,
} = setupServerActionHooks({
  hooks: {
    useQuery: useQuery,
    useMutation: useMutation,
    useInfiniteQuery: useInfiniteQuery,
  },
  queryKeyFactory: QueryKeyFactory,
});

export {
  useServerActionInfiniteQuery,
  useServerActionMutation,
  useServerActionQuery,
};
