'use client';

import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function MarkdownEditor({ value, onChange, className }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  return (
    <div className={cn('flex flex-col border border-foreground/20 rounded-md overflow-hidden', className)}>
      {/* Tabs */}
      <div className="flex border-b border-foreground/20 bg-foreground/5">
        <button
          type="button"
          onClick={() => setActiveTab('edit')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'edit'
              ? 'bg-background text-foreground border-b-2 border-foreground'
              : 'text-foreground/60 hover:text-foreground'
          )}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={cn(
            'px-4 py-2 text-sm font-medium transition-colors',
            activeTab === 'preview'
              ? 'bg-background text-foreground border-b-2 border-foreground'
              : 'text-foreground/60 hover:text-foreground'
          )}
        >
          Preview
        </button>
      </div>

      {/* Editor */}
      {activeTab === 'edit' && (
        <div className="min-h-[400px]">
          <CodeMirror
            value={value}
            height="400px"
            extensions={[markdown()]}
            onChange={(value) => onChange(value)}
            theme="dark"
            basicSetup={{
              lineNumbers: true,
              highlightActiveLineGutter: true,
              foldGutter: true,
            }}
          />
        </div>
      )}

      {/* Preview */}
      {activeTab === 'preview' && (
        <div className="min-h-[400px] p-6 prose prose-sm dark:prose-invert max-w-none overflow-auto">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-foreground/50 italic">No content to preview</p>
          )}
        </div>
      )}
    </div>
  );
}
