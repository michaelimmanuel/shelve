'use client';

import { type Editor } from '@tiptap/react';
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Heading1, Heading2, Heading3, Minus } from 'lucide-react';
import { useEffect, useState } from 'react';

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    link: false,
    bulletList: false,
    orderedList: false,
    heading1: false,
    heading2: false,
    heading3: false,
  });

  useEffect(() => {
    const updateActiveStates = () => {
      setActiveStates({
        bold: editor.isActive('bold'),
        italic: editor.isActive('italic'),
        link: editor.isActive('link'),
        bulletList: editor.isActive('bulletList'),
        orderedList: editor.isActive('orderedList'),
        heading1: editor.isActive('heading', { level: 1 }),
        heading2: editor.isActive('heading', { level: 2 }),
        heading3: editor.isActive('heading', { level: 3 }),
      });
    };

    // Update on transaction (any editor change)
    editor.on('transaction', updateActiveStates);
    editor.on('selectionUpdate', updateActiveStates);
    editor.on('update', updateActiveStates);

    // Initial update
    updateActiveStates();

    return () => {
      editor.off('transaction', updateActiveStates);
      editor.off('selectionUpdate', updateActiveStates);
      editor.off('update', updateActiveStates);
    };
  }, [editor]);

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  return (
    <div className="flex items-center gap-1 p-1.5 mb-2 bg-muted/50 border border-border rounded-lg">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-md transition-all hover:bg-accent hover:text-accent-foreground ${
          activeStates.bold
            ? 'bg-accent text-accent-foreground'
            : ''
        }`}
        title="Bold (Cmd/Ctrl+B)"
        type="button"
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-md transition-all hover:bg-accent hover:text-accent-foreground ${
          activeStates.italic
            ? 'bg-accent text-accent-foreground'
            : ''
        }`}
        title="Italic (Cmd/Ctrl+I)"
        type="button"
      >
        <Italic className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded-md transition-all hover:bg-accent hover:text-accent-foreground ${
          activeStates.heading1
            ? 'bg-accent text-accent-foreground'
            : ''
        }`}
        title="Heading 1"
        type="button"
      >
        <Heading1 className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded-md transition-all hover:bg-accent hover:text-accent-foreground ${
          activeStates.heading2
            ? 'bg-accent text-accent-foreground'
            : ''
        }`}
        title="Heading 2"
        type="button"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded-md transition-all hover:bg-accent hover:text-accent-foreground ${
          activeStates.heading3
            ? 'bg-accent text-accent-foreground'
            : ''
        }`}
        title="Heading 3"
        type="button"
      >
        <Heading3 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        onClick={setLink}
        className={`p-2 rounded-md transition-all hover:bg-accent hover:text-accent-foreground ${
          activeStates.link
            ? 'bg-accent text-accent-foreground'
            : ''
        }`}
        title="Link (Cmd/Ctrl+K)"
        type="button"
      >
        <LinkIcon className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-md transition-all hover:bg-accent hover:text-accent-foreground ${
          activeStates.bulletList
            ? 'bg-accent text-accent-foreground'
            : ''
        }`}
        title="Bullet List (Cmd/Ctrl+Shift+8)"
        type="button"
      >
        <List className="w-4 h-4" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-md transition-all hover:bg-accent hover:text-accent-foreground ${
          activeStates.orderedList
            ? 'bg-accent text-accent-foreground'
            : ''
        }`}
        title="Numbered List (Cmd/Ctrl+Shift+7)"
        type="button"
      >
        <ListOrdered className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-border mx-1" />

      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-2 rounded-md transition-all hover:bg-accent hover:text-accent-foreground"
        title="Divider"
        type="button"
      >
        <Minus className="w-4 h-4" />
      </button>
    </div>
  );
}
