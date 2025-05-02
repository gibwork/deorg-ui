// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { Transaction } from "@solana/web3.js";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { usePayModal } from "@/hooks/use-pay-modal";
// import { format } from "date-fns";
// import { useWallet } from "@solana/wallet-adapter-react";
// import { depositToken } from "@/actions/post/create-question";
// import { useTransactionStatus } from "@/hooks/use-transaction-status";
// import { SignInButton, useAuth } from "@clerk/nextjs";
// import PayModal from "@/components/modals/pay-modal";
// import { TagsSelect } from "@/components/tags-select";
// import { Button } from "@/components/ui/button";
// import TiptapEditor from "@/components/tiptap/tiptap-editor";
// import { confirmBountyDepositTransaction } from "@/actions/post/create-bounty";
// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
// import { CalendarIcon, CircleDot, ChevronDown } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { Calendar } from "../ui/calendar";
// import { TimePicker12Demo } from "../time-picker/time-picker-12hour-demo";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../ui/select";
// import { Icons } from "../icons";
// import { useQuery } from "@tanstack/react-query";
// import { getGithubRepoData } from "@/actions/get/get-github-data";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// import { getSupportedTokens } from "@/lib/utils";
// import useNetwork from "@/hooks/use-network";
// import { useWalletSelectModal } from "@/hooks/use-wallet-modal";
// import { getUserSPLTokenBalances } from "@/actions/get/get-wallet-token-balances";
// import { formatTokenAmount } from "@/utils/format-amount";
// import SelectTokenModal from "../modals/select-token-modal";
// import { Deposit } from "@/actions/post/create-task";
// import dayjs from "dayjs";
// import { usePriorityFeeLevelStore } from "@/features/priority-fee/lib/use-priority-fee-level";
// import { useWalletModal } from "@solana/wallet-adapter-react-ui";
// import { useReferralStore } from "@/features/referral/lib/use-referral-store";
// interface TokenMetadata {
//   symbol: string;
//   imgUrl: string;
//   mintAddress: string;
//   decimals: number;
// }
// const formSchema = z.object({
//   repository: z.string().optional(),
//   externalUrl: z.string().url(),
//   ghBranch: z.string(),
//   title: z
//     .string()
//     .min(3, {
//       message: "title must be at least 3 characters.",
//     })
//     .max(100, {
//       message: "title must not be longer than 30 characters.",
//     }),
//   tags: z
//     .string({
//       required_error: "Category is required.",
//     })
//     .array(),
//   overview: z.string().max(10000).min(4),
//   requirements: z.string().max(10000).min(4),
//   timestamp: z.date(),
//   amount: z.coerce.number({
//     message: "Amount is required.",
//   }),
// });

// type FormValues = z.infer<typeof formSchema>;
// const openSourceTags = [
//   "Other",
//   "Python",
//   "JavaScript",
//   "Java",
//   "C++",
//   "C#",
//   "Ruby",
//   "PHP",
//   "Swift",
//   "TypeScript",
//   "Go",
//   "Kotlin",
//   "Rust",
//   "HTML",
//   "CSS",
//   "React",
//   "Angular",
//   "Vue.js",
//   "Django",
//   "Flask",
//   "Spring Boot",
//   "Text",
// ];
// export function CreateBountyForm({ repositories }: { repositories: any[] }) {
//   const router = useRouter();
//   const { userId } = useAuth();
//   const payModal = usePayModal();
//   const formRef = useRef<HTMLFormElement | null>(null);
//   const { publicKey, signTransaction } = useWallet();
//   const walletModal = useWalletModal();
//   const transaction = useTransactionStatus();
//   const network = useNetwork((state) => state.network);
//   const referralCode = useReferralStore((state) => state.referralCode);
//   const clearReferral = useReferralStore((state) => state.clearReferral);

//   const {
//     selectedPriority,
//     maxPriorityFee,
//     exactPriorityFee,
//     isPriorityFeeModeMaxCap,
//   } = usePriorityFeeLevelStore();
//   const selectWalletModal = useWalletSelectModal();

//   const form = useForm<FormValues>({
//     resolver: zodResolver(formSchema),
//     mode: "onChange",
//     defaultValues: {
//       timestamp: dayjs().add(1, "day").toDate(),
//     },
//   });

//   const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
//   const tokenMetadata: TokenMetadata[] = getSupportedTokens();
//   const usdcTokenMetadata = tokenMetadata.find((w) => w.symbol == "SOL");
//   const [paymentDetails, setPaymentDetails] = useState({
//     amount: 0,
//     symbol: "SOL",
//     imgURL: usdcTokenMetadata?.imgUrl!,
//     mintAddress: usdcTokenMetadata?.mintAddress!,
//   });
//   const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

//   const {
//     data: walletTokensData,
//     error: walletTokensError,
//     isLoading: walletTokensLoading,
//     refetch,
//     isRefetching: isWalletTokensRefetching,
//   } = useQuery({
//     queryKey: ["userTokenList"],
//     queryFn: async () => {
//       const userTokens = await getUserSPLTokenBalances(
//         publicKey!.toBase58(),
//         network
//       );
//       if (userTokens.error) throw new Error(userTokens.error);

//       const token = userTokens.success.find(
//         (token: any) => token.address == paymentDetails?.mintAddress
//       );
//       setPaymentDetails({
//         ...paymentDetails,
//         amount: formatTokenAmount(
//           token.tokenInfo.balance,
//           token.tokenInfo.decimals
//         ),
//       });
//       return userTokens.success;
//     },
//     // refetchInterval: 10 * 1000,
//     enabled: !!publicKey,
//   });

//   useEffect(() => {
//     if (network && publicKey) {
//       refetch();
//     }
//   }, [network, publicKey, refetch]);

//   async function pay(data: z.infer<typeof formSchema>) {
//     if (!publicKey || !signTransaction || !paymentDetails) return;

//     const depositPayload: Deposit = {
//       payer: publicKey.toString(),
//       strategy: "blockhash",
//       token: {
//         mintAddress: paymentDetails.mintAddress,
//         amount: Number(data.amount!),
//       },
//       network,
//       priorityFeeLevel: selectedPriority,
//       maxPriorityFee: isPriorityFeeModeMaxCap ? maxPriorityFee : null,
//       priorityFee: !isPriorityFeeModeMaxCap ? exactPriorityFee : null,
//       workType: "Bounty",
//       referral: referralCode ?? null,
//     };

//     const depositCreateResponse = await depositToken(depositPayload);

//     if (depositCreateResponse.error) {
//       if (depositCreateResponse.error.statusCode === 400) {
//         form.setError("amount", { message: "Minimum amount not met" });
//       }
//       throw new Error(depositCreateResponse.error.message);
//     }
//     const retreivedTx = Transaction.from(
//       Buffer.from(depositCreateResponse.success.serializedTransaction, "base64")
//     );

//     const serializedTx = await signTransaction(retreivedTx);

//     const confirmTxPayload = {
//       transactionId: depositCreateResponse.success.transactionId,
//       serializedTransaction: serializedTx?.serialize().toString("base64"),
//       externalUrl: data.externalUrl,
//       title: data.title,
//       overview: data.overview,
//       requirements: data.requirements,
//       ghBranch: data.ghBranch,
//       tags: data.tags,
//       deadline: data.timestamp,
//       referral: referralCode ?? null,
//     };

//     const transactionResponse = await confirmBountyDepositTransaction(
//       confirmTxPayload
//     );

//     if (transactionResponse.error) {
//       throw new Error(transactionResponse.error.message);
//     } else {
//       return transactionResponse;
//     }
//   }

//   const { data, error, isLoading } = useQuery({
//     queryKey: [`github-repo-${selectedRepo}`],
//     queryFn: async () => {
//       const { success, error } = await getGithubRepoData(selectedRepo!);
//       if (error) throw new Error(error);
//       if (success) return success;
//     },
//     enabled: !!selectedRepo,
//   });

//   async function onSubmit(data: z.infer<typeof formSchema>) {
//     // if (data.amount > paymentDetails.amount) {
//     //   form.setError("amount", { message: "Insufficient funds" });
//     //   return toast.warning(
//     //     "Amount must not exceed available balance of " + paymentDetails.amount
//     //   );
//     // }
//     try {
//       const bountyResponse = await pay(data);
//       clearReferral();
//       toast.success("Bounty posted successfully!");
//       router.push(`/bounties/${bountyResponse?.success.id}?share=true`);
//       payModal.onClose();
//     } catch (error) {
//       toast.error("Oops!", {
//         description: (error as Error).message,
//       });
//     } finally {
//       transaction.onEnd();
//     }
//   }

//   React.useEffect(() => {
//     if (!publicKey) {
//       setPaymentDetails({
//         ...paymentDetails,
//         amount: 0,
//       });
//     } else {
//       refetch();
//     }
//     //eslint-disable-next-line
//   }, [publicKey]);

//   return (
//     <>
//       <SelectTokenModal
//         isOpen={isTokenModalOpen}
//         setIsOpen={setIsTokenModalOpen}
//         title="Select Token"
//         description="Select the token you want to pay with"
//         setPaymentDetails={setPaymentDetails}
//       />
//       <Form {...form}>
//         <form
//           ref={formRef}
//           onSubmit={form.handleSubmit(onSubmit)}
//           className="space-y-8"
//         >
//           <div className="flex flex-col xl:flex-row gap-5">
//             <div className=" space-y-8 max-w-2xl 2xl:max-w-3xl">
//               <Select onValueChange={setSelectedRepo}>
//                 <SelectTrigger>
//                   <SelectValue placeholder="Select a repository" />
//                 </SelectTrigger>

//                 <SelectContent>
//                   {repositories.map((repo: any) => (
//                     <SelectItem
//                       value={`${repo.owner.login}/${repo.name}`}
//                       key={`${repo.id}-${repo.node_id}`}
//                     >
//                       <span className="flex items-center gap-1">
//                         <Icons.gitHub className="w-4 h-4" />
//                         {`${repo.owner.login}/${repo.name}`}
//                       </span>
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>

//               <FormField
//                 control={form.control}
//                 name="externalUrl"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Issue</FormLabel>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                       disabled={!selectedRepo || !data?.issues?.length}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select issue" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {data?.issues?.map((issue: any) => (
//                           <SelectItem
//                             value={`${issue.html_url}`}
//                             key={`${issue.id}-${issue.node_id}`}
//                           >
//                             <span className="flex gap-1">
//                               <CircleDot className="w-4 h-4" />
//                               {`${issue.title}`}
//                             </span>
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {/* <FormDescription>
//                 You can manage email addresses in your{" "}
//                 <Link href="/examples/forms">email settings</Link>.
//               </FormDescription> */}
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="ghBranch"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Branch</FormLabel>
//                     <Select
//                       onValueChange={field.onChange}
//                       defaultValue={field.value}
//                       disabled={!selectedRepo || !data?.branches?.length}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select a branch where the pull request should be made to" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {data?.branches?.map((branch: any) => (
//                           <SelectItem
//                             value={`${branch.name}`}
//                             key={`${branch.name}`}
//                           >
//                             <span className="flex gap-1">
//                               <CircleDot className="w-4 h-4" />
//                               {`${branch.name}`}
//                             </span>
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {/* <FormDescription>
//                 You can manage email addresses in your{" "}
//                 <Link href="/examples/forms">email settings</Link>.
//               </FormDescription> */}
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               {/* <FormField
//           control={form.control}
//           name="externalUrl"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Github Issue URL</FormLabel>
//               <FormControl>
//                 <Input placeholder="issue url.." {...field} />
//               </FormControl>

//               <FormMessage />
//             </FormItem>
//           )}
//         /> */}

//               <FormField
//                 control={form.control}
//                 name="title"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Title</FormLabel>
//                     <FormControl>
//                       <Input placeholder="Issue 01" {...field} />
//                     </FormControl>

//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="overview"
//                 render={({ field }) => (
//                   <FormItem className="">
//                     <FormLabel>Overview</FormLabel>
//                     <FormDescription>
//                       Introduce the problem and expand on what you put in the
//                       title. Minimum 20 characters.
//                     </FormDescription>
//                     <FormControl>
//                       <TiptapEditor
//                         content={field.value}
//                         onChange={field.onChange}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="requirements"
//                 render={({ field }) => (
//                   <FormItem className="">
//                     <FormLabel>Requirements</FormLabel>
//                     <FormDescription>
//                       Please outline the requirements that a submission must
//                       meet to be considered for payment.
//                     </FormDescription>
//                     <FormControl>
//                       <TiptapEditor
//                         content={field.value}
//                         onChange={field.onChange}
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />

//               <FormField
//                 control={form.control}
//                 name="timestamp"
//                 render={({ field }) => (
//                   <FormItem className="flex flex-col">
//                     <FormLabel className="text-left">Deadline</FormLabel>
//                     <Popover>
//                       <FormControl>
//                         <PopoverTrigger asChild>
//                           <Button
//                             variant="outline"
//                             className={cn(
//                               "w-[280px] justify-start text-left font-normal",
//                               !field.value && "text-muted-foreground"
//                             )}
//                           >
//                             <CalendarIcon className="mr-2 h-4 w-4" />
//                             {field.value ? (
//                               format(field.value, "PPP HH:mm:ss")
//                             ) : (
//                               <span>Pick a date</span>
//                             )}
//                           </Button>
//                         </PopoverTrigger>
//                       </FormControl>
//                       <PopoverContent className="w-auto p-0">
//                         <Calendar
//                           fromDate={dayjs().add(1, "day").toDate()}
//                           toDate={dayjs("2025-12-31").toDate()}
//                           mode="single"
//                           selected={field.value}
//                           onSelect={field.onChange}
//                           initialFocus
//                         />
//                         <div className="p-3 border-t border-border">
//                           {/* <TimePickerDemo
//                       setDate={field.onChange}
//                       date={field.value}
//                     /> */}
//                           <TimePicker12Demo
//                             setDate={field.onChange}
//                             date={field.value}
//                           />
//                         </div>
//                       </PopoverContent>
//                     </Popover>
//                   </FormItem>
//                 )}
//               />

//               <div className="flex items-center gap-6">
//                 <div className=" flex ">
//                   <FormField
//                     control={form.control}
//                     name="tags"
//                     render={({ field }) => (
//                       <FormItem>
//                         <FormLabel>Tags</FormLabel>

//                         <FormDescription>
//                           Select up to 2 tags to describe what your question in
//                           about.{" "}
//                         </FormDescription>
//                         <FormControl>
//                           <TagsSelect
//                             title="Tag"
//                             disabled={form.formState.isSubmitting}
//                             tags={field.value}
//                             availableTags={openSourceTags}
//                             maxSelectedAllowed={2}
//                             onChange={field.onChange}
//                           />
//                         </FormControl>
//                         <FormMessage />
//                       </FormItem>
//                     )}
//                   />
//                 </div>
//               </div>
//             </div>

//             <div>
//               <FormField
//                 control={form.control}
//                 name="amount"
//                 disabled={form.formState.isSubmitting}
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel className="md:text-base flex justify-between max-w-xs ">
//                       Deposit
//                       <div className="flex items-start gap-1 justify-end translate-y-1 md:translate-y-2 text-muted-foreground ">
//                         {!walletTokensData &&
//                         (walletTokensLoading || isWalletTokensRefetching) ? (
//                           <Icons.spinner className="w-4 h-4 animate-spin" />
//                         ) : (
//                           <span className="text-xs md:text-sm">
//                             {paymentDetails.amount}
//                           </span>
//                         )}
//                         <Button
//                           variant="secondary"
//                           type="button"
//                           className="h-5 px-2 text-xs md:text-sm"
//                           onClick={() => {
//                             form.setValue("amount", paymentDetails.amount);
//                             form.clearErrors();
//                           }}
//                         >
//                           max
//                         </Button>
//                       </div>
//                     </FormLabel>
//                     <FormControl className="w-full rounded-md border border-input">
//                       <div className="flex items-center justify-between max-w-xs">
//                         <Input
//                           className="border-none"
//                           placeholder="Enter Amount"
//                           {...field}
//                         />
//                         <Button
//                           variant="ghost"
//                           type="button"
//                           disabled={form.formState.isSubmitting}
//                           onClick={() => {
//                             if (!publicKey) {
//                               return walletModal.setVisible(true);
//                             }
//                             setIsTokenModalOpen(true);
//                           }}
//                           className="h-7 !px-2 space-x-1 text-xs mr-2"
//                         >
//                           <Avatar className="w-4 h-4 mr-1 ">
//                             <AvatarImage
//                               src={paymentDetails.imgURL}
//                               alt="token"
//                             />
//                             <AvatarFallback className="bg-muted">
//                               ?
//                             </AvatarFallback>
//                           </Avatar>
//                           {paymentDetails.symbol}
//                           <ChevronDown className="size-4" />
//                         </Button>
//                       </div>
//                     </FormControl>
//                     {/* <FormMessage className="text-xs" /> */}
//                   </FormItem>
//                 )}
//               />
//               {!userId ? (
//                 <SignInButton forceRedirectUrl="/questions/ask-question">
//                   <Button size="sm" type="button" className="w-full max-w-xs">
//                     Sign In to create a bounty
//                   </Button>
//                 </SignInButton>
//               ) : !publicKey ? (
//                 <Button
//                   type="button"
//                   className="w-full max-w-xs mt-5"
//                   variant="theme"
//                   onClick={() => selectWalletModal.onOpen()}
//                 >
//                   Connect Wallet
//                 </Button>
//               ) : form.formState.isSubmitting ? (
//                 <Button
//                   disabled
//                   type="button"
//                   variant="theme"
//                   className="w-full max-w-xs flex items-center font-medium text-xs mt-5 "
//                 >
//                   <Icons.spinner className=" w-4 h-4 mr-2   animate-spin" />
//                   Sending Transaction...
//                 </Button>
//               ) : (
//                 <Button
//                   type="submit"
//                   disabled={!!form.formState.errors?.amount}
//                   className="w-full max-w-xs mt-5"
//                   variant="theme"
//                 >
//                   {!!form.formState.errors?.amount
//                     ? form.formState.errors.amount.message
//                     : "Create Work"}
//                 </Button>
//               )}
//             </div>
//           </div>

//           {/* <PayModal
//           formref={formRef}
//           setTxDetails={setPaymentDetails}
//           paymentDetails={paymentDetails}
//         />

//         {!userId ? (
//           <SignInButton forceRedirectUrl="/bounties/create">
//             <Button size="sm" type="button">
//               Sign In to create a bounty
//             </Button>
//           </SignInButton>
//         ) : (
//           <Button type="submit">Create Bounty</Button>
//         )} */}
//         </form>
//       </Form>
//     </>
//   );
// }
