'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Heading from '@tiptap/extension-heading';
import { useEffect, useState } from 'react';
import { markdownToHTML, htmlToMarkdown } from '@/lib/utils/markdown';
import { EditorToolbar } from './editor-toolbar';

interface WysiwygNoteEditorProps {
  value: string; // markdown string
  onChange: (value: string) => void; // returns markdown string
  placeholder?: string;
  className?: string;
  minHeight?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export function WysiwygNoteEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  className = '',
  minHeight = '100px',
  disabled = false,
  autoFocus = false,
}: WysiwygNoteEditorProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  const editor = useEditor({
    immediatelyRender: false, // Prevent SSR hydration mismatch
    extensions: [
      StarterKit.configure({
        heading: false, // Disable default heading to use custom
        blockquote: false, // Disable quotes for MVP
        codeBlock: false, // Disable code blocks for MVP
        // horizontalRule is enabled by default
      }),
      Heading.configure({
        levels: [1, 2, 3], // H1, H2, H3
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 dark:text-blue-400 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    editorProps: {
      attributes: {
        class: `prose prose-sm dark:prose-invert max-w-none focus:outline-none ${className}`,
      },
    },
    autofocus: autoFocus,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = htmlToMarkdown(html);
      onChange(markdown);
    },
  });

  // Initialize editor content from markdown
  useEffect(() => {
    if (!editor || isInitialized) return;

    const loadContent = async () => {
      if (value) {
        const html = await markdownToHTML(value);
        editor.commands.setContent(html);
      }
      setIsInitialized(true);
    };

    loadContent();
  }, [editor, value, isInitialized]);

  // Update disabled state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [editor, disabled]);

  if (!editor) {
    return (
      <div
        className="w-full rounded-md border border-border bg-background p-3 text-foreground/60"
        style={{ minHeight }}
      >
        Loading editor...
      </div>
    );
  }

  return (
    <div className="relative">
      {editor && <EditorToolbar editor={editor} />}
      <div
        className="w-full rounded-md border border-border bg-background transition-all focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-background focus-within:ring-foreground/20 p-3"
        style={{ minHeight }}
      >
        <EditorContent
          editor={editor}
          className="w-full"
        />
      </div>

      <style jsx global>{`
        .ProseMirror {
          min-height: ${minHeight};
          outline: none;
        }

        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: var(--foreground);
          opacity: 0.4;
          pointer-events: none;
          height: 0;
        }

        .ProseMirror p {
          margin: 0.5rem 0;
        }

        .ProseMirror p:first-child {
          margin-top: 0;
        }

        .ProseMirror p:last-child {
          margin-bottom: 0;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .ProseMirror li {
          margin: 0.25rem 0;
        }

        .ProseMirror strong {
          font-weight: 700;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror a {
          color: var(--accent);
          text-decoration: underline;
          cursor: pointer;
        }

        .ProseMirror a:hover {
          opacity: 0.8;
        }

        .ProseMirror h1 {
          font-size: 2em;
          font-weight: 700;
          line-height: 1.2;
          margin: 1rem 0 0.5rem;
        }

        .ProseMirror h1:first-child {
          margin-top: 0;
        }

        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: 700;
          line-height: 1.3;
          margin: 0.75rem 0 0.5rem;
        }

        .ProseMirror h2:first-child {
          margin-top: 0;
        }

        .ProseMirror h3 {
          font-size: 1.25em;
          font-weight: 600;
          line-height: 1.4;
          margin: 0.5rem 0 0.5rem;
        }

        .ProseMirror h3:first-child {
          margin-top: 0;
        }

        .ProseMirror hr {
          border: none;
          border-top: 2px solid var(--border);
          margin: 1.5rem 0;
        }
      `}</style>
    </div>
  );
}
