import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TiptapImage from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextStyle from "@tiptap/extension-text-style";
import Typography from "@tiptap/extension-typography";
import TiptapUnderline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { Placeholder as ImagePlaceholder } from "../plugins/placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import { Markdown } from "tiptap-markdown";

const CustomImage = TiptapImage.extend({
  addProseMirrorPlugins() {
    return [ImagePlaceholder];
  },
}).configure({
  allowBase64: true,
  HTMLAttributes: {
    class: "rounded-md !max-w-xs md:!max-w-md 2xl:!max-w-lg",
  },
});
export const TiptapExtensions = [
  StarterKit.configure({
    hardBreak: {
      keepMarks: true,
    },
    paragraph: {
      HTMLAttributes: {
        class: "min-h-[1rem]",
      },
    },
    bulletList: {
      HTMLAttributes: {
        class:
          "list-disc list-outside leading-3 my-2 [&_li]:leading-6 [&_li]:mt-2",
      },
    },
    orderedList: {
      HTMLAttributes: {
        class:
          "list-decimal list-outside leading-3 my-2 [&_li]:leading-6 [&_li]:mt-2",
      },
    },
    listItem: {
      HTMLAttributes: {
        class: "leading-normal -mb-2 list-item",
      },
    },
    blockquote: {
      HTMLAttributes: {
        class: "border-l-4 border-gray-2 italic font-medium",
      },
    },
    codeBlock: false,
    code: {
      HTMLAttributes: {
        class:
          "rounded-lg border border-gray-2 bg-gray-200 dark:bg-zinc-700 px-1 py-0.5 font-normal",
        spellcheck: "false",
      },
    },
    horizontalRule: {
      HTMLAttributes: {
        class: "border-gray-2",
      },
    },
  }),
  Markdown.configure({
    html: true,
    transformCopiedText: true,
    transformPastedText: true,
  }),
  // CustomImage,
  TiptapImage,
  TiptapUnderline,
  TextStyle.extend({
    parseHTML() {
      return [
        {
          tag: "span",
          getAttrs: (element) => {
            const hasStyles = (element as HTMLElement).hasAttribute("style");

            if (!hasStyles) {
              return false;
            }
            (element as HTMLElement).setAttribute("style", "");
            return null;
          },
        },
      ];
    },
  }),
  Color,
  Typography,
  Link.extend({ inclusive: false }).configure({
    HTMLAttributes: {
      class: "underline underline-offset-2 cursor-pointer font-normal",
      // Change rel to different value
      // Allow search engines to follow links(remove nofollow)
      rel: "noopener noreferrer",
      // Remove target entirely so links open in current tab
      target: "_blank",
    },
    autolink: true,
  }),
  //   FileHandler.configure({
  //     allowedMimeTypes: ["image/png", "image/jpeg", "image/gif", "image/webp"],
  //     onDrop: (editor, files) => uploadImg(files[0], editor.view),
  //   }),

  Placeholder.configure({
    includeChildren: true,
    placeholder: ({ node }: { node: any }) => {
      if (node.type.name === "heading") {
        return `Heading ${node.attrs.level}`;
      }

      return "Write or type '/ ' for commands";
    },
  }),
  Highlight,
  TaskList.configure({
    HTMLAttributes: {
      class: "pl-0 ",
    },
  }),
  TaskItem.configure({
    HTMLAttributes: {
      class: "flex items-start [&_p]:my-0",
    },
    nested: true,
  }),
  CharacterCount.configure({
    limit: 10000,
  }),
  // HardBreak.extend({
  //   addKeyboardShortcuts() {
  //     return {
  //       'Enter': ({ editor }) => editor.commands.setHardBreak(),
  //       'Shift-Enter': ({ editor }) => editor.commands.setHardBreak()
  //     };
  //   },
  // }),
];
