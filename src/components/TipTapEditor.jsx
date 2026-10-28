import React, { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Code,
  Terminal,
  Minus,
  Undo2,
  Redo2,
} from 'lucide-react'

export const TipTapEditor = ({
  content,
  onChange,
  onTypingStateChange,
  placeholder = 'Unpack what you understood today... write with a free mind.',
  readOnly = false,
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'code-block-sanctuary',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: content || '',
    editable: !readOnly,
    editorProps: {
      attributes: {
        class: 'tiptap focus:outline-none min-h-[460px] cursor-text leading-relaxed font-sans',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
      if (onTypingStateChange) {
        onTypingStateChange(true)
      }
    },
  })

  // Synchronize when external content changes (e.g. loading a different entry)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', false)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const ToolbarBtn = ({ onClick, isActive, icon: Icon, title }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
        isActive
          ? 'bg-sage-400/20 text-sage-400 dark:text-sage-300 light:text-sage-700 font-semibold'
          : 'text-neutral-400 hover:text-neutral-200 light:text-neutral-500 light:hover:text-neutral-800 hover:bg-white/5 light:hover:bg-black/5'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  )

  return (
    <div className="w-full relative group">
      {/* Editorial Floating / Attached Toolbar */}
      {!readOnly && (
        <div
          className="sticky top-2 z-20 mb-4 inline-flex items-center gap-1 p-1 rounded-xl backdrop-blur-md 
            bg-[#1A1C20]/80 border border-white/10 shadow-lg transition-opacity duration-300
            light:bg-[#F3EFE6]/90 light:border-black/10 light:shadow-sm"
        >
          <ToolbarBtn
            icon={Bold}
            title="Bold (Ctrl+B)"
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
          />
          <ToolbarBtn
            icon={Italic}
            title="Italic (Ctrl+I)"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
          />
          <div className="w-[1px] h-4 bg-white/10 light:bg-black/10 mx-0.5" />
          <ToolbarBtn
            icon={Heading1}
            title="Heading 1 (# )"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
          />
          <ToolbarBtn
            icon={Heading2}
            title="Heading 2 (## )"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
          />
          <ToolbarBtn
            icon={Heading3}
            title="Heading 3 (### )"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
          />
          <div className="w-[1px] h-4 bg-white/10 light:bg-black/10 mx-0.5" />
          <ToolbarBtn
            icon={Quote}
            title="Aha! Quote (> )"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
          />
          <ToolbarBtn
            icon={Code}
            title="Inline Code (`code`)"
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
          />
          <ToolbarBtn
            icon={Terminal}
            title="Code Block (```)"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
          />
          <div className="w-[1px] h-4 bg-white/10 light:bg-black/10 mx-0.5" />
          <ToolbarBtn
            icon={List}
            title="Bullet List (- )"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
          />
          <ToolbarBtn
            icon={ListOrdered}
            title="Ordered List (1. )"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
          />
          <ToolbarBtn
            icon={Minus}
            title="Divider (---)"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            isActive={false}
          />
          <div className="w-[1px] h-4 bg-white/10 light:bg-black/10 mx-0.5" />
          <ToolbarBtn
            icon={Undo2}
            title="Undo"
            onClick={() => editor.chain().focus().undo().run()}
            isActive={false}
          />
          <ToolbarBtn
            icon={Redo2}
            title="Redo"
            onClick={() => editor.chain().focus().redo().run()}
            isActive={false}
          />
        </div>
      )}

      {/* Editor Content Area */}
      <div className="prose prose-invert max-w-none focus:outline-none">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
