import React, { useEffect, useState } from 'react'
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
  editorRef,
}) => {
  // Re-render tick to guarantee toolbar active states update on cursor move and selection change
  const [, setSelectionTick] = useState(0)

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
      setSelectionTick((t) => t + 1)
    },
    onSelectionUpdate: () => {
      setSelectionTick((t) => t + 1)
    },
    onTransaction: () => {
      setSelectionTick((t) => t + 1)
    },
  })

  // Synchronize when external content changes (e.g. loading a different entry)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', false)
    }
  }, [content, editor])

  // Expose editor instance to parent (for auto-focusing on Enter)
  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor
    }
  }, [editor, editorRef])

  if (!editor) {
    return null
  }

  // Highly responsive toolbar button:
  // onMouseDown preventDefault prevents losing the active editor selection when clicked!
  const ToolbarBtn = ({ onClick, isActive, icon: Icon, title, disabled = false }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        // Essential: prevent blur on editor so highlighted text remains selected
        e.preventDefault()
      }}
      onClick={(e) => {
        e.preventDefault()
        if (disabled) return
        onClick()
      }}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`p-1.5 sm:p-2 rounded-lg text-xs font-medium transition-all select-none cursor-pointer active:scale-90 touch-manipulation flex items-center justify-center ${
        disabled
          ? 'opacity-25 cursor-not-allowed text-neutral-500'
          : isActive
          ? 'bg-sage-400/25 text-sage-300 light:text-sage-800 border border-sage-400/35 font-bold shadow-xs'
          : 'text-neutral-400 hover:text-neutral-100 light:text-neutral-600 light:hover:text-neutral-900 hover:bg-white/10 light:hover:bg-black/10'
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  )

  const canUndo = editor.can().undo()
  const canRedo = editor.can().redo()

  return (
    <div className="w-full relative group">
      {/* Editorial Floating / Attached Toolbar - positioned with top-14 to avoid colliding with top nav */}
      {!readOnly && (
        <div
          className="sticky top-14 sm:top-16 z-20 mb-6 inline-flex max-w-full overflow-x-auto no-scrollbar items-center gap-1 p-1 sm:p-1.5 rounded-2xl backdrop-blur-md 
            bg-[#1A1C20]/90 border border-white/10 shadow-zen transition-all duration-300
            light:bg-[#F3EFE6]/95 light:border-black/10 light:shadow-sm"
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
          <div className="w-[1px] h-4 bg-white/10 light:bg-black/10 mx-0.5 flex-shrink-0" />
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
          <div className="w-[1px] h-4 bg-white/10 light:bg-black/10 mx-0.5 flex-shrink-0" />
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
          <div className="w-[1px] h-4 bg-white/10 light:bg-black/10 mx-0.5 flex-shrink-0" />
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
          <div className="w-[1px] h-4 bg-white/10 light:bg-black/10 mx-0.5 flex-shrink-0" />
          <ToolbarBtn
            icon={Undo2}
            title="Undo (Ctrl+Z)"
            onClick={() => editor.chain().focus().undo().run()}
            isActive={false}
            disabled={!canUndo}
          />
          <ToolbarBtn
            icon={Redo2}
            title="Redo (Ctrl+Y / Ctrl+Shift+Z)"
            onClick={() => editor.chain().focus().redo().run()}
            isActive={false}
            disabled={!canRedo}
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
