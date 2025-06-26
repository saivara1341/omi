import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const { envContent } = await request.json()
    
    if (!envContent || typeof envContent !== 'string') {
      return NextResponse.json(
        { error: 'Invalid environment content' },
        { status: 400 }
      )
    }

    // Write to .env file in the project root
    const envPath = join(process.cwd(), '.env')
    await writeFile(envPath, envContent, 'utf8')

    return NextResponse.json({ 
      success: true, 
      message: 'Environment file updated successfully' 
    })
  } catch (error) {
    console.error('Error writing .env file:', error)
    return NextResponse.json(
      { error: 'Failed to write environment file' },
      { status: 500 }
    )
  }
}