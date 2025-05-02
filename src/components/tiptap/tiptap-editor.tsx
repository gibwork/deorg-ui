import React, { useEffect, useImperativeHandle, forwardRef } from "react";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import {
  EditorContent,
  ReactNodeViewRenderer,
  useEditor,
  Content,
  Editor,
} from "@tiptap/react";

import { TipTapEditorCssClasses } from "@/lib/utils";
import { TiptapExtensions } from "./extensions";
import Menubar from "./menu-bar";
import "@/styles/tiptap.scss";

import { lowlight } from "lowlight";
import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import CodeBlockEditor from "./extensions/code-block-editor";
import { useDebounceCallback } from "usehooks-ts";
import { handleImagePaste } from "./extensions/upload-image";

lowlight.registerLanguage("html", html);
lowlight.registerLanguage("css", css);
lowlight.registerLanguage("js", js);
lowlight.registerLanguage("ts", ts);

const cleanStyles = (html: string) => {
  return html.replace(/style="[^"]*"/g, "");
};

interface TiptapEditorProps {
  onChange: (content: string) => void;
  content: Content;
}

export interface TiptapEditorRef {
  setContent: (content: Content) => void;
}

const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(
  ({ onChange, content }, ref) => {
    const handleChange = (newContent: string) => {
      onChange(newContent);
    };

    const editor = useEditor({
      immediatelyRender: false,
      extensions: [
        ...TiptapExtensions,

        CodeBlockLowlight.extend({
          addNodeView() {
            // @ts-ignore
            return ReactNodeViewRenderer(CodeBlockEditor);
          },
        }).configure({
          lowlight,
          defaultLanguage: "javascript",
        }),
      ],
      // editorProps: {
      //   handlePaste: (view, event) => handleImagePaste(view, event),
      // },
      onUpdate: ({ editor }) => {
        // get markdown
        debouncedUpdates(editor);
      },
      content: content,
      parseOptions: {
        preserveWhitespace: true,
      },
    });

    const debouncedUpdates = useDebounceCallback((editor: Editor) => {
      const content = editor?.getHTML();
      const cleanContent = content?.replace(/<p[^>]*>\s*<\/p>/g, "").trim();
      handleChange(cleanContent || "");
    }, 500);

    useImperativeHandle(ref, () => ({
      setContent: (newContent: Content) => {
        editor?.commands.setContent(newContent);
      },
    }));

    useEffect(() => {
      if (content === "") {
        editor?.commands.setContent(content);
      }
    }, [content, editor]);

    return (
      <div
        className={`editor border rounded-lg prose dark:prose-invert ${TipTapEditorCssClasses}`}
      >
        {editor && <Menubar editor={editor} />}
        <EditorContent
          style={{ whiteSpace: "pre-line", minHeight: "100px" }}
          className="editor__content p-1 md:px-3 py-2"
          editor={editor}
        />
      </div>
    );
  }
);

TiptapEditor.displayName = "TiptapEditor";

export default TiptapEditor;
