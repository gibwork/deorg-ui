import { auth } from "@clerk/nextjs/server";
import { getQueryClient } from "@/components/providers/query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getUserData } from "@/actions/get/get-user-data";
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
        const { success, error } = await getUserData();
        if (error) throw new Error(error);
        return success;
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
      <main className="flex flex-col min-h-screen w-full overflow-hidden">
        {/* <Header /> */}

        <div className="flex h-screen overflow-hidden">
          {/* <Sidebar /> */}
          <div className="w-full">{children}</div>
        </div>
      </main>
    </HydrationBoundary>
  );
}
