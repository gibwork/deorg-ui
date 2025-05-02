import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { auth } from "@clerk/nextjs/server";
import { getQueryClient } from "@/components/providers/query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import usersService from "@/services/user.service";
import { getUserWalletBalance } from "@/actions/get/get-wallet-token-balances";
import useNetwork from "@/hooks/use-network";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = getQueryClient();
  const { userId } = auth();
  if (userId) {
    await queryClient.prefetchQuery({
      queryKey: [`user-${userId}`],
      queryFn: async () => {
        const { success, data } = await usersService.getUserData();
        if (!success) {
          throw new Error(data.message);
        } else {
          return data;
        }
      },
    });

    await queryClient.prefetchQuery({
      queryKey: [`userTokenList`],
      queryFn: async () => {
        const userTokens = await getUserWalletBalance(
          useNetwork.getState().network
        );
        if (userTokens.error) throw new Error(userTokens.error);

        return userTokens.success;
      },
    });
  }
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex flex-col min-h-screen w-full  overflow-hidden">
        <Header />

        <div className="flex h-screen ">
          {/* <Sidebar /> */}
          <div className=" w-full  overflow-hidden mt-14 ">{children}</div>
        </div>
      </main>
    </HydrationBoundary>
  );
}
