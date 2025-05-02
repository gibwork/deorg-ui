"use client";

import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ReferralFAQ = () => {
  const faqSections = [
    {
      title: "How does the referral program work?",
      content:
        "Our referral program enables you to earn a percentage of platform fees when users you refer create or complete work. Each successful referral contributes to your earnings, with potential for higher commissions based on verification status.",
    },
    {
      title: "What are the requirements to become a referrer?",
      content: "To participate in our referral program, you need to:",
      list: [
        "Create an account on our platform",
        "Add and verify your primary wallet",
        "Get a unique referral link",
        "Optionally verify your profile to unlock higher commission rates",
      ],
    },
    {
      title: "How are referral earnings calculated?",
      content: "Referral earnings are dynamically calculated based on:",
      list: [
        "A percentage of platform transaction fees",
        "Your profile verification status",
        "The type of work referred (created or completed)",
      ],
    },
    {
      title: "When and how are referral rewards paid?",
      content:
        "Our referral reward system is designed for speed and transparency:",
      list: [
        "Earnings are calculated in real-time",
        "Payouts are processed immediately to your primary wallet",
      ],
    },
    {
      title: "Terms and Conditions",
      content: "Important guidelines for our referral program:",
      list: [
        "Program terms are subject to change",
        "Fraudulent referral activities will be thoroughly investigated",
        "Platform reserves the right to final interpretation of rules",
        "Referral tracking is transparent and auditable",
      ],
    },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Referral Program FAQ
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {faqSections.map((section, index) => (
            <AccordionItem value={`item-${index}`} key={index}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <span>{section.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  <p>{section.content}</p>
                  {section.list && (
                    <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
                      {section.list.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};

export default ReferralFAQ;
