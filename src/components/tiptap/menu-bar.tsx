import type { Editor, Range } from "@tiptap/react";
import MenuItem from "./menu-item";

import React, { Fragment } from "react";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Highlighter,
  Image as ImageButton,
  Italic,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  SquareCode,
  Strikethrough,
  Undo2,
  WrapText,
} from "lucide-react";
import { uploadImg } from "./extensions/upload-image";
interface CommandProps {
  editor: Editor;
  range?: Range;
}
const Menubar = ({ editor }: CommandProps) => {
  const items = [
    {
      icon: <Bold className="w-3 h-3 md:w-4 md:h-4" />,
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
    },
    {
      icon: <Italic className="w-3 h-3 md:w-4 md:h-4" />,
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
    },
    {
      icon: <Strikethrough className="w-3 h-3 md:w-4 md:h-4" />,
      title: "Strike",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive("strike"),
    },
    {
      icon: <Code className="w-3 h-3 md:w-4 md:h-4" />,
      title: "Code",
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive("code"),
    },
    // {
    //   icon: <Highlighter className="w-3 h-3 md:w-4 md:h-4" />,
    //   title: "Highlight",
    //   action: () => editor.chain().focus().toggleHighlight().run(),
    //   isActive: () => editor.isActive("highlight"),
    // },
    // {
    //   type: "divider",
    // },
    {
      icon: <Heading1 className="w-3 h-3 md:w-4 md:h-4" />,
      title: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive("heading", { level: 1 }),
    },
    {
      icon: <Heading2 className="w-3 h-3 md:w-4 md:h-4" />,
      title: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive("heading", { level: 2 }),
    },
    // {
    //   icon: <Pilcrow className="w-3 h-3 md:w-4 md:h-4" />,
    //   title: "Paragraph",
    //   action: () => editor.chain().focus().setParagraph().run(),
    //   isActive: () => editor.isActive("paragraph"),
    // },
    {
      icon: <List className="w-3 h-3 md:w-4 md:h-4" />,
      title: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive("bulletList"),
    },
    {
      icon: <ListOrdered className="w-3 h-3 md:w-4 md:h-4" />,
      title: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive("orderedList"),
    },
    {
      icon: <ListChecks className="w-3 h-3 md:w-4 md:h-4" />,
      title: "Task List",
      action: () => editor.chain().focus().toggleTaskList().run(),
      isActive: () => editor.isActive("taskList"),
    },
    {
      icon: <SquareCode className="w-3 h-3 md:w-4 md:h-4" />,
      title: "Code Block",
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: () => editor.isActive("codeBlock"),
    },
    {
      type: "divider",
    },
    {
      icon: <Quote className="w-3 h-3 md:w-4 md:h-4" />,
      title: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive("blockquote"),
    },
    // {
    //   title: "Image",
    //   icon: <ImageButton className="w-3 h-3 md:w-4 md:h-4" />,
    //   action: () => {
    //     editor.chain().focus().focus().run();
    //     const input = document.createElement("input");
    //     input.type = "file";
    //     input.accept = "image/*";
    //     input.onchange = async () => {
    //       if (input.files?.length) {
    //         uploadImg(input.files[0]!, editor.view);
    //       }
    //     };
    //     input.click();
    //   },
    // },
    // {
    //   icon: <Minus className="w-3 h-3 md:w-4 md:h-4" />,
    //   title: "Horizontal Rule",
    //   action: () => editor.chain().focus().setHorizontalRule().run(),
    // },
    // {
    //   type: "divider",
    // },
    // {
    //   icon: <WrapText className="w-3 h-3 md:w-4 md:h-4" />,
    //   title: "Hard Break",
    //   action: () => editor.chain().focus().setHardBreak().run(),
    // },
    // {
    //   icon: <RemoveFormatting className="w-3 h-3 md:w-4 md:h-4" />,
    //   title: "Clear Format",
    //   action: () => editor.chain().focus().clearNodes().unsetAllMarks().run(),
    // },
    // {
    //   type: "divider",
    // },
    // {
    //   icon: <Undo2 className="w-3 h-3 md:w-4 md:h-4" />,
    //   title: "Undo",
    //   action: () => editor.chain().focus().undo().run(),
    // },
    // {
    //   icon: <Redo2 className="w-3 h-3 md:w-4 md:h-4" />,
    //   title: "Redo",
    //   action: () => editor.chain().focus().redo().run(),
    // },
  ];

  return (
    <div className="editor__header border-b border-gray-3 dark:border-zinc-700 flex items-center gap-1">
      {items.map((item, index) => (
        <Fragment key={index}>
          {item.type === "divider" ? (
            <div className="h-[1.23rem] ml-[0.5rem] mr-[0.75rem] w-[1px] hidden md:block bg-black dark:bg-zinc-600" />
          ) : (
            <MenuItem {...item} />
          )}
        </Fragment>
      ))}
    </div>
  );
};

export default Menubar;
