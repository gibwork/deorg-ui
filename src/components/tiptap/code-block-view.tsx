"use client";

import { cn } from "@/lib/utils";
import "@/styles/codeblockcomponent.scss";

import { NodeViewContent, NodeViewWrapper } from "@tiptap/react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

type CodeBlockComponentProps = {
  node: {
    attrs: { language: string | number | readonly string[] | undefined };
  };
  updateAttributes: (attrs: { language: string | null }) => void;
  extension: {
    options: {
      lowlight: {
        listLanguages: () => string[];
      };
    };
  };
  showPlaceholder?: boolean;
};

const CodeBlockView = ({
  node: {
    attrs: { language: defaultLanguage },
  },
  updateAttributes,
  extension,
  showPlaceholder,
}: any) => {
  const pathname = usePathname();

  return (
    <NodeViewWrapper className={cn("code-block-v2")}>
      <select
        contentEditable={false}
        defaultValue={defaultLanguage}
        onChange={(event) => updateAttributes({ language: event.target.value })}
      >
        <option value="null">auto</option>
        <option disabled>—</option>
        {extension.options.lowlight
          .listLanguages()
          .map((lang: any, index: number) => (
            <option key={index} value={lang}>
              {lang}
            </option>
          ))}
      </select>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};

export default CodeBlockView;
