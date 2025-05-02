"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import { Card, CardContent } from "./ui/card";
import { motion } from "framer-motion";
import { FADE_UP_ANIMATION_VARIANTS } from "@/lib/framer-variants";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Icons } from "./icons";
interface CreateItem {
  title: string;
  href: string;
  // icon: keyof typeof Icons;
  description: string;
}

const createItems: CreateItem[] = [
  {
    title: "Create a Task",
    // icon: "createTask",
    href: "/create-work/new-task",
    description: "Transform challenges into opportunities with community collaboration. Crowdsource solutions by tapping into a diverse pool of talent, creativity, and expertise to meet your needs efficiently.",
  },
  // {
  //   title: "Open Source",
  //   icon: "createBounty",
  //   href: "/bounties/create",
  //   description: "Connect your Github Account and add a a bounty.",
  // },
];

function CreateWork() {
  return (
    <motion.section
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.15,
          },
        },
      }}
      className="pb-24 w-full max-w-6xl mx-auto "
    >
      <motion.div variants={FADE_UP_ANIMATION_VARIANTS} className="flex">
        <motion.div
          variants={FADE_UP_ANIMATION_VARIANTS}
          className="flex flex-col w-full"
        >
          <div className="w-full ">
            <h1 className="text-3xl md:text-4xl font-medium ">
              Find Work, Find Talent.
            </h1>
            {/* <p className="text-base md:text-lg text-muted-foreground md:mb-4 pt-2">
              Kickstart new opportunities, collaborate on open-source projects, or share your expertise—shape how you engage with our community and create impactful work.
            </p> */}
          </div>
          <div className="rounded-lg md:max-w-xl  py-4 w-full ">
            <p className="text-lg font-medium">
              Select an option below to get started:
            </p>
            <div className="space-y-4 mt-4">
              <div className="flex flex-col md:flex-row gap-4 items-stretch">
                {createItems.map((item: CreateItem, idx: number) => {
                  return (
                    <Link key={idx} href={item.href} className="w-full">
                      <Card className="rounded-md transition-all hover:ring-2 hover:ring-theme overflow-hidden">
                        <CardContent className="p-4 py-4">
                          <span className="font-medium text-xl pt-2 ">
                            {item.title}
                          </span>
                          <p className=" text-muted-foreground ">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
              <div className="">
                <Link href={"/services/create"} className="w-full ">
                  <Card className=" rounded-md  transition-all hover:ring-2 hover:ring-theme overflow-hidden ">
                    <CardContent className="p-4 py-4">
                      <span className="font-medium pt-2 text-xl">Offer a Service</span>
                      <p className="text-muted-foreground ">
                        Offer your skills and connect with users for custom
                        services.
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="p-2 md:max-w-2xl">
        <motion.h2
          variants={FADE_UP_ANIMATION_VARIANTS}
          className=" flex items-center gap-2 font-medium mt-6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-4 dark:fill-white"
            viewBox="0 0 512 512"
          >
            <path d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm169.8-90.7c7.9-22.3 29.1-37.3 52.8-37.3l58.3 0c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24l0-13.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1l-58.3 0c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" />
          </svg>
          Frequently Asked Questions
        </motion.h2>

        <motion.div
          variants={FADE_UP_ANIMATION_VARIANTS}
          className="me-4 text-sm"
        >
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Can I request a refund?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                You can immediately cancel your task andwithdraw the funds. 
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-left">
                Are there any fees for using Gibwork?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Gibwork charges a 5% SOL service fee on transactions, the lowest
                in the industry!
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger className="text-left">
                Why is payment required at the time of creating a task?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Each task and bounty is guaranteed payment through escrow. This
                makes it easier to release payment once the work is done.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-left">
                What payment methods does Gibwork support?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Gibwork only supports wallet payments. To create a post,
                you&apos;ll need the payment amount plus a 5% service fee in
                SOL.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default CreateWork;
