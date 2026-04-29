import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import TurndownService from 'turndown';

/**
 * Convert markdown string to HTML
 * Used when loading markdown into the WYSIWYG editor
 */
export async function markdownToHTML(markdown: string): Promise<string> {
  if (!markdown || markdown.trim() === '') {
    return '';
  }

  try {
    const file = await unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(markdown);

    return String(file);
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    return markdown; // Fallback to raw markdown
  }
}

/**
 * Convert HTML string to markdown
 * Used when saving from the WYSIWYG editor to the database
 */
export function htmlToMarkdown(html: string): string {
  if (!html || html.trim() === '') {
    return '';
  }

  try {
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      bulletListMarker: '-',
    });

    // Preserve line breaks
    turndownService.addRule('lineBreak', {
      filter: 'br',
      replacement: () => '  \n',
    });

    // Clean up paragraph spacing
    turndownService.addRule('paragraph', {
      filter: 'p',
      replacement: (content) => {
        return content.trim() ? `\n\n${content}\n\n` : '';
      },
    });

    const markdown = turndownService.turndown(html);
    return markdown.trim();
  } catch (error) {
    console.error('Error converting HTML to markdown:', error);
    return html; // Fallback to raw HTML
  }
}
