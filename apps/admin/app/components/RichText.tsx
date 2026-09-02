import StarterKit from '@tiptap/starter-kit';
import { EditorContent, useEditor } from '@tiptap/react';
import { Bold, Heading2, Italic, List, ListOrdered } from 'lucide-react';
import { useEffect } from 'react';

/** Minimal TipTap rich-text editor (CLAUDE.md §9.2). Emits HTML on change. */
export function RichText({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '<p></p>',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: 'prose max-w-none min-h-40 rounded-md border border-[var(--color-neutral-200)] p-3 focus:outline-none' } },
  });

  // Sync external value changes (e.g. after load) without clobbering typing.
  useEffect(() => {
    if (editor && value && editor.getHTML() !== value) editor.commands.setContent(value);
  }, [editor, value]);

  if (!editor) return null;
  const btn = (active: boolean) => `rounded p-1.5 ${active ? 'bg-[var(--color-neutral-200)]' : 'hover:bg-[var(--color-neutral-100)]'}`;

  return (
    <div>
      <div className="mb-2 flex gap-1">
        <button type="button" className={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}><Bold size={16} /></button>
        <button type="button" className={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic size={16} /></button>
        <button type="button" className={btn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 size={16} /></button>
        <button type="button" className={btn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}><List size={16} /></button>
        <button type="button" className={btn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered size={16} /></button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
