"use client";

import React from "react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { EditorContent, ReactNodeViewRenderer, useEditor } from "@tiptap/react";
import { cn, TipTapEditorCssClasses } from "@/lib/utils";
import { TiptapExtensions } from "./extensions";

import { lowlight } from "lowlight";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import CodeBlockView from "./code-block-view";

lowlight.registerLanguage("html", html);
lowlight.registerLanguage("css", css);
lowlight.registerLanguage("js", js);
lowlight.registerLanguage("ts", ts);
const Content = ({
  content,
  className,
}: {
  content: any;
  className?: string;
}) => {
  const [editable, setEditable] = React.useState(false);
  const editor = useEditor({
    editable,
    immediatelyRender: false,
    extensions: [
      ...TiptapExtensions,
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockView);
        },
      }).configure({
        lowlight,
      }),
    ],
    content: content,
    parseOptions: {
      preserveWhitespace: true
    }
  });

  return (
    <div className={`dark:prose-invert prose-a:text-theme ${TipTapEditorCssClasses}`}>
      <EditorContent
        className={cn("editor__content", className)}
        editor={editor}
      />
    </div>
  );
};

export default Content;
