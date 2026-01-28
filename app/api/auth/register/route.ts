import { NextRequest, NextResponse } from 'next/server'
import AWS from 'aws-sdk'

AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID_AWS,
  secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS,
  region: process.env.COGNITO_REGION,
})

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const cognito = new AWS.CognitoIdentityServiceProvider()

    // Sign up the user
    const signUpParams = {
      ClientId: process.env.COGNITO_CLIENT_ID as string,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
      ],
    }

    const signUpResponse = await cognito.signUp(signUpParams).promise()

    // Auto-confirm the user (skip email verification for this demo)
    // In production, you'd send a verification email instead
    const confirmParams = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID as string,
      Username: email,
    }

    await cognito.adminConfirmSignUp(confirmParams).promise()

    return NextResponse.json({
      message: 'User created successfully',
      userSub: signUpResponse.UserSub,
    })
  } catch (error: any) {
    console.error('Registration error:', error)

    // Handle specific Cognito errors
    if (error.code === 'UsernameExistsException') {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    if (error.code === 'InvalidPasswordException') {
      return NextResponse.json(
        { error: 'Password does not meet requirements' },
        { status: 400 }
      )
    }

    if (error.code === 'InvalidParameterException') {
      return NextResponse.json(
        { error: 'Invalid email or password format' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}