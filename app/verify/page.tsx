'use client'

import React, { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'

export default function Verify() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')
  
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')

  // Generate a random verification code when component mounts
  useEffect(() => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setGeneratedCode(code)
  }, [])

  const handleChangeCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value.toUpperCase())
    setError('')
  }

  const handleVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsVerifying(true)

    // Simulate API verification delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Check if verification code matches
    if (verificationCode === generatedCode) {
      // Verification successful - sign in the user
      if (email) {
        const response = await signIn('credentials', {
          email: email,
          redirect: false
        })

        if (response?.ok) {
          window.location.href = '/dashboard'
        } else {
          setError('Failed to sign in. Please try logging in manually.')
          setIsVerifying(false)
        }
      } else {
        setError('Missing account information. Please register again.')
        setIsVerifying(false)
      }
    } else {
      setError('Invalid verification code. Please try again.')
      setIsVerifying(false)
      setVerificationCode('')
    }
  }

  const handleResendCode = () => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    setGeneratedCode(newCode)
    setVerificationCode('')
    setError('')
  }

  if (!email) {
    return (
      <div className='w-full min-h-screen bg-secondaryColor dark:bg-black flex items-center justify-center p-4'>
        <div className='w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center'>
          <div className='text-6xl mb-4'>⚠️</div>
          <h2 className='text-2xl font-bold mb-4 text-darkTextColor dark:text-lightTextColor'>
            Invalid Access
          </h2>
          <p className='text-gray-600 dark:text-gray-400 mb-6'>
            Please register an account first.
          </p>
          <button
            onClick={() => window.location.href = '/register'}
            className='px-6 py-2 bg-detailsColor text-lightTextColor rounded-[5px] hover:scale-105 transition duration-200 shadow-small font-semibold'
          >
            Go to Registration
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen bg-secondaryColor dark:bg-black flex items-center justify-center p-4'>
      <div className='w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg'>
        <div className='text-center mb-6'>
          <div className='text-6xl mb-4'>📧</div>
          <h1 className='text-3xl font-bold mb-2 text-darkTextColor dark:text-lightTextColor'>
            Verify Your Account
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Welcome, <span className='font-semibold'>{email}</span>!
          </p>
        </div>

        <div className='mb-6 p-4 bg-green-50 dark:bg-green-900 border border-green-300 text-green-800 dark:text-green-200 rounded'>
          <p className='font-semibold mb-2'>✅ Account Created Successfully!</p>
          <p className='text-sm'>Please verify your account to continue.</p>
        </div>

        <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-300 text-blue-800 dark:text-blue-200 rounded'>
          <p className='font-semibold mb-2'>Demo Verification Code:</p>
          <p className='text-2xl font-mono font-bold text-center py-2'>
            {generatedCode}
          </p>
          <p className='text-xs mt-2'>
            In a real app, this would be sent to your email or phone.
          </p>
        </div>

        {error && (
          <div className='mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded'>
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-darkTextColor dark:text-lightTextColor'>
              Verification Code
            </label>
            <input 
              onChange={handleChangeCode} 
              className='p-3 rounded-[5px] text-center text-xl font-mono tracking-widest uppercase text-darkTextColor dark:text-lightTextColor bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-small focus:outline-none focus:ring-2 focus:ring-detailsColor' 
              name='verificationCode' 
              type='text' 
              value={verificationCode}
              placeholder='Enter code'
              maxLength={6}
              required
              disabled={isVerifying}
            />
          </div>
          
          <button 
            className='p-3 mt-2 bg-detailsColor text-lightTextColor rounded-[5px] hover:scale-105 transition duration-200 shadow-small font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100' 
            type='submit'
            disabled={isVerifying}
          >
            {isVerifying ? 'Verifying...' : 'Verify Account'}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
            Didn't receive the code?
          </p>
          <button
            onClick={handleResendCode}
            className='text-detailsColor hover:underline font-semibold text-sm'
            disabled={isVerifying}
          >
            Resend Code
          </button>
        </div>

        <div className='mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center'>
          <button
            onClick={() => window.location.href = '/'}
            className='text-sm text-gray-600 dark:text-gray-400 hover:text-darkTextColor dark:hover:text-lightTextColor'
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    </div>
  )
}