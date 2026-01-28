'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [hidePassword, setHidePassword] = useState(true)
  const [error, setError] = useState('')
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError('')
  }

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    setIsAuthenticating(true);
    e.preventDefault()
    
    try {
      const response = await signIn('credentials', {
        email: email,
        password: password,
        redirect: false,
      })

      if (response?.error) {
        console.error('SignIn error:', response.error)
        setError('Invalid credentials. Please try again.')
      } else if (response?.ok) {
        console.log('SignIn successful, redirecting...')
        window.location.href = '/dashboard'
      }
    } catch (err) {
      console.error('SignIn exception:', err)
      setError('An error occurred. Please try again.')
    }
    setIsAuthenticating(false)
  }

  return (
    <div className='w-full min-h-screen bg-secondaryColor dark:bg-black flex items-center justify-center p-4'>
      <div className='w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg'>
        <h1 className='text-3xl font-bold text-center mb-8 text-darkTextColor dark:text-lightTextColor'>
          Sign In
        </h1>
        
        {error && (
          <div className='mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded'>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-darkTextColor dark:text-lightTextColor'>Email</label>
            <input 
              onChange={handleChangeEmail} 
              className='p-2 rounded-[5px] text-darkTextColor dark:text-lightTextColor bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-small focus:outline-none focus:ring-2 focus:ring-detailsColor' 
              name='email' 
              type='email' 
              value={email}
              required
            />
          </div>
          
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-darkTextColor dark:text-lightTextColor'>Password</label>
            <div className='relative'>
              <input 
                onChange={handleChangePassword} 
                className='p-2 rounded-[5px] w-full pr-10 text-darkTextColor dark:text-lightTextColor bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-small focus:outline-none focus:ring-2 focus:ring-detailsColor' 
                name='password' 
                type={hidePassword ? 'password' : 'text'} 
                value={password}
                required
              />
              <button 
                type='button' 
                onClick={() => setHidePassword(!hidePassword)} 
                className='absolute top-1/2 -translate-y-1/2 right-0 my-auto mr-3 hover:scale-110 transition duration-200 text-gray-600 dark:text-gray-400'
              >
                {hidePassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>
          
          <button 
            className='flex p-2 mt-4 bg-detailsColor text-lightTextColor rounded-[5px] hover:scale-105 transition duration-200 shadow-small font-semibold' 
            style={{
              height: 50,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            type='submit'
            disabled={isAuthenticating}
          >
            {isAuthenticating ? <div className='animate-spin'><FaSpinner/></div> : 'Sign In'}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
            Don't have an account?
          </p>
          <button
            onClick={() => window.location.href = '/register'}
            className='text-detailsColor hover:underline font-semibold'
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  )
}