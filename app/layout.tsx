import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Radhika',
  description:
    'Radhika is a versatile AI chatbot designed to assist with a wide range of tasks, from answering questions to providing recommendations and engaging in casual conversation.',
  generator: 'Rohan Sharma',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Radhika',
    siteName: 'radhika-sharma',
    url: 'https://radhika-sharma.vercel.app/',
    description:
      'Radhika is a versatile AI chatbot designed to assist with a wide range of tasks, from answering questions to providing recommendations and engaging in casual conversation.',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Radhika AI Chatbot',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Radhika',
    description:
      'Radhika is a versatile AI chatbot designed to assist with a wide range of tasks, from answering questions to providing recommendations and engaging in casual conversation.',
    images: ['/og-image.png'],
  },
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
