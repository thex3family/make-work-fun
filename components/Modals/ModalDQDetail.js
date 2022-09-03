import Link from 'next/link';
import { useEffect, useState } from 'react';
import Button from '../ui/Button';
import Router from 'next/router';
import { supabase } from '@/utils/supabase-client';
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export default function ModalDQDetail({ setShowDailyQuestDetail, habit_id, habitDescription, setHabitDescription, habit_title }) {

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editor) {
      return null
    }

    editor.setEditable(!saving)
  }, [editor, saving])

  const MenuBar = ({ editor }) => {
    if (!editor) {
      return null
    }

    return (
      <>
        <Button
          variant='slim'
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
        >
          bold
        </Button>
        <Button
          variant='slim'
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
        >
          italic
        </Button>
        <Button
          variant='slim'
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
        >
          strike
        </Button>
        <Button
          variant='slim'
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive('code') ? 'is-active' : ''}
        >
          code
        </Button>
        <Button
          variant='slim' onClick={() => editor.chain().focus().unsetAllMarks().run()}>
          clear marks
        </Button>
        <Button
          variant='slim' onClick={() => editor.chain().focus().clearNodes().run()}>
          clear nodes
        </Button>
        <Button
          variant='slim'
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={editor.isActive('paragraph') ? 'is-active' : ''}
        >
          paragraph
        </Button>
        <Button
          variant='slim'
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
        >
          h1
        </Button>
        <Button
          variant='slim'
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
        >
          h2
        </Button>
        <Button
          variant='slim'
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
        >
          h3
        </Button>
        <Button
          variant='slim'
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          className={editor.isActive('heading', { level: 4 }) ? 'is-active' : ''}
        >
          h4
        </Button>
        <Button
          variant='slim'
          onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
          className={editor.isActive('heading', { level: 5 }) ? 'is-active' : ''}
        >
          h5
        </Button>
        <Button
          variant='slim'
          onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
          className={editor.isActive('heading', { level: 6 }) ? 'is-active' : ''}
        >
          h6
        </Button>
        <Button
          variant='slim'
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
        >
          bullet list
        </Button>
        <Button
          variant='slim'
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
        >
          ordered list
        </Button>
        <Button
          variant='slim'
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
        >
          code block
        </Button>
        <Button
          variant='slim'
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
        >
          blockquote
        </Button>
        <Button
          variant='slim' onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          horizontal rule
        </Button>
        <Button
          variant='slim' onClick={() => editor.chain().focus().setHardBreak().run()}>
          hard break
        </Button>
        <Button
          variant='slim' onClick={() => editor.chain().focus().undo().run()}>
          undo
        </Button>
        <Button
          variant='slim' onClick={() => editor.chain().focus().redo().run()}>
          redo
        </Button>
      </>
    );
  }

  const editor = useEditor({
    saving,
    extensions: [
      StarterKit
    ],
    editorProps: {
      attributes: {
        class: 'prose border-2 leading-relaxed w-full rounded px-2 py-2 outline-none focus:outline-none overflow-y-auto h-96',
      },
    },
    content: habitDescription ? habitDescription : {
      "type": "doc",
      "content": [
        {
          "type": "heading",
          "attrs": {
            "level": 3
          },
          "content": [
            {
              "type": "text",
              "text": "Hey Hero!"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Your daily quests can get complicated, but "
            },
            {
              "type": "text",
              "marks": [
                {
                  "type": "bold"
                }
              ],
              "text": "they don't have to be."
            }
          ]
        },
        {
          "type": "bulletList",
          "content": [
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Share a reminder to future you. 🥰"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "orderedList",
          "attrs": {
            "start": 1
          },
          "content": [
            {
              "type": "listItem",
              "content": [
                {
                  "type": "paragraph",
                  "content": [
                    {
                      "type": "text",
                      "text": "Or make a list to get things done! 🚀"
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "type": "codeBlock",
          "attrs": {
            "language": null
          },
          "content": [
            {
              "type": "text",
              "text": "I'm fully customizable!"
            }
          ]
        },
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "marks": [
                {
                  "type": "italic"
                }
              ],
              "text": "Psst. Let us know what you want to see next by chatting with us. 🤗"
            }
          ]
        }
      ]
    }
  })

  async function saveDailyQuestDetail() {
    setSaving(true);
    const json = editor.getJSON()
    setHabitDescription(json);
    
    const { data, error } = await supabase
      .from('habits')
      .update({ description: json })
      .eq('id', habit_id);

    // fetchDailies(player, setHabits, setLevelUp, setDailiesCount);
    setShowDailyQuestDetail(false);
  }

  return (
    <>
      <div className="absolute h-screen flex justify-center">
        <div
          className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
        >
          <div className="opacity-50 fixed inset-0 z-40 bg-black"
            onClick={() => setShowDailyQuestDetail(false)}></div>
          <div className="relative w-full my-6 mx-auto max-w-xl max-h-screen z-50">
            {/*content*/}
            <div className="border-4 border-dailies-dark rounded-lg shadow-lg relative flex flex-col w-full bg-dailies-light outline-none focus:outline-none">
            <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                <h3 className="text-xl sm:text-2xl font-semibold text-black">
                  {habit_title}
                </h3>
              </div>
              {/*body*/}
              <div className="p-6 text-black">
                <div className="text-left">
                  {/* <MenuBar editor={editor} /> */}
                  <EditorContent className='outline-none' editor={editor} />
                </div>
              </div>

              {/* <img src="img/default_avatar.png" height="auto" className="w-3/4 mx-auto pb-2" /> */}
              {/*footer*/}
              <div className="flex items-center p-6 border-t border-solid border-blueGray-200 rounded-b">
                <div className="text-center mx-auto">
                  <Button variant="prominent"
                    disabled={saving}
                    className="text-md font-semibold text-emerald-600"
                    onClick={() => saveDailyQuestDetail()}>Save and Close</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
