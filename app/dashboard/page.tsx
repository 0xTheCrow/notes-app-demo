'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession, signOut, getSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import { FaSpinner, FaTrash } from 'react-icons/fa'

interface NoteType {
  content: string, noteId: string, createdAt: string
}

const Dashboard = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [isInitializingNotes, setIsInitializingNotes] = useState(true)
  const [deletingNoteId, setDeletingNoteId] = useState<string|undefined>(undefined)
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')

  const [foundNotes, setFoundNotes] = useState<NoteType[]>([]);

  const getNotes = () => {
    setIsInitializingNotes(true)
    getSession().then(foundSession => {
      if (foundSession) {
        const cognitoToken = foundSession.idToken;
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
          headers: {
            'Authorization': `Bearer ${cognitoToken}`
          }
        }).then(response => response.json()).then(data => {
          const sortedNotes = data.notes.sort((first:NoteType, second:NoteType) => 
            new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime())
          setFoundNotes(sortedNotes.reverse())
          setIsInitializingNotes(false)
        }).catch(err => {
          console.error(err)
          setIsInitializingNotes(true)
        });
      }
    })
  }

  useMemo(() => {
    getNotes()
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  const saveNote = async (content:string) => {
    setIsSavingNote(true)
    const session = await getSession();
  
    if (!session?.idToken) {
      console.error('No session or token found');
      setIsSavingNote(false);
      return null;
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.idToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: content
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to save note:', error);
        setIsSavingNote(false);
        return null;
      }
      
      const data = await response.json();
      console.log('Note saved:', data);
      setNewNoteText('');
      setIsSavingNote(false);
      getNotes();
      return data.note;
    } catch (error) {
      console.error('Error saving note:', error);
      setIsSavingNote(false);
      return null;
    }
  }

  const deleteNote = async (noteId: string) => {
    setDeletingNoteId(noteId);
    const session = await getSession();
    
    if (!session?.idToken) {
      console.error('No session found');
      setDeletingNoteId(undefined);
      return;
    }
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.idToken}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error('Failed to delete note:', error);
        setDeletingNoteId(undefined);
        return;
      }
      
      const data = await response.json();
      console.log('Note deleted:', data);
      
      setFoundNotes(prevNotes => prevNotes.filter(note => note.noteId !== noteId));
      setDeletingNoteId(undefined);
    } catch (error) {
      console.error('Error deleting note:', error);
      setDeletingNoteId(undefined);
    }
  }

  if (status === 'loading') {
    return (
      <div className='w-full h-screen bg-secondaryColor dark:bg-black flex items-center justify-center'>
        <div className='text-xl text-darkTextColor dark:text-lightTextColor'>
          Loading...
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const Note = (props: {content: string, noteId: string, createdAt: string, key: string}) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    return (
    <div className='flex flex-row gap-2'>
      <div className='w-full p-4 bg-blue-50 dark:bg-gray-900 border border-black-300 rounded'>
        <div className='flex justify-between items-start mb-2'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            {formatDate(props.createdAt)}
          </p>
        </div>
        <p className='text-blue-800 dark:text-blue-200'>
          {props.content}
        </p>
      </div>
      <button
        disabled={deletingNoteId === props.noteId}
        onClick={() => {deleteNote(props.noteId)}}
        className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-200 w-[100px]'
      >
        {deletingNoteId === props.noteId ? 
          <div className='flex justify-center w-full'>
            <FaSpinner className='animate-spin'/>
          </div> 
          : 
          <div className='flex justify-center w-full'>
            <FaTrash/>
          </div>}
      </button>
    </div>
  );
  }


  return (
    <div className='w-full min-h-screen bg-secondaryColor dark:bg-black flex flex-col'>
      <nav className='w-full bg-white dark:bg-gray-800 shadow-md p-4'>
        <div className='max-w-6xl mx-auto flex justify-between items-center'>
          <h1 className='text-xl font-bold text-darkTextColor dark:text-lightTextColor'>
            Notes App
          </h1>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-200'
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className='flex-1 max-w-6xl mx-auto w-full p-8'>
        <div className=''>
          <h2 className='text-3xl font-bold mb-4 text-darkTextColor dark:text-lightTextColor'>
            Welcome, {session?.user?.name}!
          </h2>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mt-4'>
          <h2 className='text-3xl font-bold mb-4 text-darkTextColor dark:text-lightTextColor'>
            Create a New Note:
          </h2>
          <div className='gap-1 flex flex-row'>
            <div className='border border-black rounded flex-grow'>
              <input className='w-full p-4 rounded' value={newNoteText} onChange={(e) => setNewNoteText(e.target.value)}/>
            </div>
            <button
              onClick={() => {saveNote(newNoteText)}}
              disabled={isSavingNote || newNoteText.length === 0}
              className='px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition duration-200 w-[200px]'
            >
              {isSavingNote ? <div className='flex justify-center w-full'><FaSpinner className='animate-spin'/></div> : 'Save Note'}
            </button>
          </div>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mt-4'>
          <h2 className='text-3xl font-bold mb-4 text-darkTextColor dark:text-lightTextColor'>
            Saved Notes:
          </h2>
          <div className='flex flex-col gap-1'>
            { isInitializingNotes ? 
              `Loading your notes...` : ``}

            {
              foundNotes.length === 0 ? 
                !isInitializingNotes ? `No notes.` : ``
              :
                foundNotes.map((note, index) => <Note key={`note-${index}`} content={note.content} noteId={note.noteId} createdAt={note.createdAt}/>)
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
