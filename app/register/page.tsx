'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [hidePassword, setHidePassword] = useState(true)
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true)
  const [error, setError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChangeEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError('')
  }

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setError('')
  }

  const handleChangeConfirmPassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsRegistering(true)

    // Validation
    if (!email || !password || !confirmPassword) {
      setError('All fields are required')
      setIsRegistering(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsRegistering(false)
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      setIsRegistering(false)
      return
    }

    // Password requirements check
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      setError('Password must contain uppercase, lowercase, number, and special character')
      setIsRegistering(false)
      return
    }

    try {
      // Call API route to register user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to create account')
        setIsRegistering(false)
        return
      }

      setSuccess(true)
      
      // Auto sign-in after successful registration
      setTimeout(async () => {
        const signInResponse = await signIn('credentials', {
          email: email,
          password: password,
          redirect: false
        })

        if (signInResponse?.ok) {
          window.location.href = '/dashboard'
        } else {
          // If auto sign-in fails, redirect to login
          window.location.href = '/'
        }
      }, 1500)
    } catch (err) {
      console.error('Registration error:', err)
      setError('Failed to create account. Please try again.')
      setIsRegistering(false)
    }
  }

  if (success) {
    return (
      <div className='w-full min-h-screen bg-secondaryColor dark:bg-black flex items-center justify-center p-4'>
        <div className='w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center'>
          <div className='text-6xl mb-4'>✅</div>
          <h2 className='text-2xl font-bold mb-2 text-darkTextColor dark:text-lightTextColor'>
            Account Created!
          </h2>
          <p className='text-gray-600 dark:text-gray-400'>
            Signing you in...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen bg-secondaryColor dark:bg-black flex items-center justify-center p-4'>
      <div className='w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg'>
        <h1 className='text-3xl font-bold text-center mb-8 text-darkTextColor dark:text-lightTextColor'>
          Create Account
        </h1>
        
        {error && (
          <div className='mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 rounded'>
            {error}
          </div>
        )}

        <div className='mb-6 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-300 text-blue-800 dark:text-blue-200 rounded text-sm'>
          <p className='font-semibold mb-1'>Password Requirements:</p>
          <ul className='text-xs list-disc list-inside'>
            <li>At least 8 characters</li>
            <li>Uppercase and lowercase letters</li>
            <li>At least one number</li>
            <li>At least one special character</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-1'>
            <label className='text-xs text-darkTextColor dark:text-lightTextColor'>Email</label>
            <input 
              onChange={handleChangeEmail} 
              className='p-2 rounded-[5px] text-darkTextColor dark:text-lightTextColor bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-small focus:outline-none focus:ring-2 focus:ring-detailsColor' 
              name='email' 
              type='email' 
              value={email}
              placeholder='your@email.com'
              required
              disabled={isRegistering}
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
                placeholder='Minimum 8 characters'
                required
                disabled={isRegistering}
              />
              <button 
                type='button' 
                onClick={() => setHidePassword(!hidePassword)} 
                className='absolute top-1/2 -translate-y-1/2 right-0 my-auto mr-3 hover:scale-110 transition duration-200 text-gray-600 dark:text-gray-400'
                disabled={isRegistering}
              >
                {hidePassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-xs text-darkTextColor dark:text-lightTextColor'>Confirm Password</label>
            <div className='relative'>
              <input 
                onChange={handleChangeConfirmPassword} 
                className='p-2 rounded-[5px] w-full pr-10 text-darkTextColor dark:text-lightTextColor bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 shadow-small focus:outline-none focus:ring-2 focus:ring-detailsColor' 
                name='confirmPassword' 
                type={hideConfirmPassword ? 'password' : 'text'} 
                value={confirmPassword}
                placeholder='Re-enter your password'
                required
                disabled={isRegistering}
              />
              <button 
                type='button' 
                onClick={() => setHideConfirmPassword(!hideConfirmPassword)} 
                className='absolute top-1/2 -translate-y-1/2 right-0 my-auto mr-3 hover:scale-110 transition duration-200 text-gray-600 dark:text-gray-400'
                disabled={isRegistering}
              >
                {hideConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>
          
          <button 
            className='p-2 mt-4 bg-detailsColor text-lightTextColor rounded-[5px] hover:scale-105 transition duration-200 shadow-small font-semibold disabled:opacity-50 disabled:cursor-not-allowed' 
            type='submit'
            disabled={isRegistering}
          >
            {isRegistering ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
            Already have an account?
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className='text-detailsColor hover:underline font-semibold'
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  )
}