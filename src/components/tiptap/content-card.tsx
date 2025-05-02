"use client";

import React from "react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";

import { EditorContent, ReactNodeViewRenderer, useEditor } from "@tiptap/react";

import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";

// load all highlight.js languages
import { lowlight } from "lowlight";

import CodeBlockView from "@/components/tiptap/code-block-view";
import { TipTapEditorCssClasses } from "@/lib/utils";
import { TiptapExtensions } from "./extensions";

lowlight.registerLanguage("html", html);
lowlight.registerLanguage("css", css);
lowlight.registerLanguage("js", js);
lowlight.registerLanguage("ts", ts);

const ContentCard = ({ content }: any) => {
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
      }).configure({ lowlight }),
    ],
    content: content,
    parseOptions: {
      preserveWhitespace: true
    }
  });

  return (
    <div className={`prose dark:prose-invert ${TipTapEditorCssClasses}`}>
      <EditorContent className="editor__content text-sm" editor={editor} />
    </div>
  );
};

export default ContentCard;
