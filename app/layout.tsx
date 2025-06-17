import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Radhika-Bot',
  description: 'Radhika-Bot is a versatile AI chatbot designed to assist with a wide range of tasks, from answering questions to providing recommendations and engaging in casual conversation.',
  generator: 'Rohan Sharma',
  icons: {
    icon: '/favicon.ico',
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
