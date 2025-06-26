import { NextRequest, NextResponse } from 'next/server'
import { writeFile, access, mkdir } from 'fs/promises'
import { join, dirname } from 'path'
import { constants } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const { envContent } = await request.json()
    
    if (!envContent || typeof envContent !== 'string') {
      return NextResponse.json(
        { error: 'Invalid environment content' },
        { status: 400 }
      )
    }

    // Get the project root directory
    const projectRoot = process.cwd()
    const envPath = join(projectRoot, '.env')
    
    try {
      // Check if the directory exists and is writable
      await access(dirname(envPath), constants.W_OK)
    } catch (error) {
      // If directory doesn't exist or isn't writable, try to create it
      try {
        await mkdir(dirname(envPath), { recursive: true })
      } catch (mkdirError) {
        console.error('Error creating directory:', mkdirError)
        return NextResponse.json(
          { error: 'Unable to create or access project directory' },
          { status: 500 }
        )
      }
    }

    // Try to write the file with proper error handling
    try {
      await writeFile(envPath, envContent, { 
        encoding: 'utf8',
        mode: 0o644 // Set proper file permissions
      })
    } catch (writeError) {
      console.error('Error writing .env file:', writeError)
      
      // If write fails, try to remove the file first and then write
      try {
        const { unlink } = await import('fs/promises')
        await unlink(envPath).catch(() => {}) // Ignore error if file doesn't exist
        await writeFile(envPath, envContent, { 
          encoding: 'utf8',
          mode: 0o644 
        })
      } catch (retryError) {
        console.error('Retry write failed:', retryError)
        return NextResponse.json(
          { error: 'Failed to write environment file. Please check file permissions.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Environment file updated successfully' 
    })
  } catch (error) {
    console.error('Unexpected error in save-env route:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred while saving the environment file' },
      { status: 500 }
    )
  }
}