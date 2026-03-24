"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  List 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

type RichTextEditorProps = {
  content: string;
  onChange: (html: string) => void;
  onTextChange?: (text: string) => void;
  placeholder?: string;
  error?: boolean;
};

export function RichTextEditor({ content, onChange, onTextChange, placeholder, error }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: placeholder || "Nhập mô tả...",
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      if (onTextChange) {
        onTextChange(editor.getText());
      }
    },
    editorProps: {
      attributes: {
        class: cn(
          "focus:outline-none min-h-[120px] px-3 py-2 text-sm dark:text-zinc-100 prose prose-sm dark:prose-invert max-w-none",
          "ul:list-disc ul:pl-4 ol:list-decimal ol:pl-4"
        ),
      },
    },
  });

  // Update content when it changes from outside (e.g. initialData load)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={cn(
      "border rounded-xl overflow-hidden transition-all bg-white dark:bg-zinc-900",
      error ? "border-red-500 ring-1 ring-red-500/20" : "border-zinc-300 dark:border-zinc-700"
    )}>
      <div className="flex items-center gap-1 p-1 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            editor.isActive("bold") 
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" 
              : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            editor.isActive("italic") 
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" 
              : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            editor.isActive("underline") 
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" 
              : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            editor.isActive("bulletList") 
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" 
              : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          )}
        >
          <List className="w-4 h-4" />
        </button>
      </div>
      <style jsx global>{`
        .ProseMirror ul {
          list-style-type: disc;
          padding-left: 1.2rem;
        }
        .ProseMirror ol {
          list-style-type: decimal;
          padding-left: 1.2rem;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
      `}</style>
      <EditorContent editor={editor} className="cursor-text" />
    </div>
  );
}
