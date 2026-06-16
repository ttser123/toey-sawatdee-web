// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata: Metadata = {
    metadataBase: new URL('https://toey-sawatdee.me'),
    title: {
        default: 'Parinya Sawatdee | Cloud Infrastructure & Software Engineer',
        template: '%s | Parinya Sawatdee',
    },
    description:
        'Motivated Software Engineer specializing in AWS, Next.js, CI/CD pipelines, and SRE Observability. Building scalable cloud infrastructure and exploring system limits.',
    keywords: [
        'Parinya Sawatdee',
        'Cloud Engineer',
        'Software Engineer',
        'AWS',
        'Next.js',
        'CI/CD',
        'DevOps',
        'SRE',
        'Observability',
        'Cloud Infrastructure',
        'Portfolio',
    ],
    alternates: {
        canonical: 'https://toey-sawatdee.me',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    openGraph: {
        title: 'Parinya Sawatdee | Cloud & Software Engineer',
        description:
            'Motivated Software Engineer specializing in AWS, Next.js, CI/CD pipelines, and SRE Observability. Building scalable cloud infrastructure.',
        url: 'https://toey-sawatdee.me',
        siteName: 'Toey Sawatdee Portfolio',
        images: [
            {
                url: '/Open Graph.png',
                width: 1200,
                height: 630,
                alt: 'Parinya Sawatdee Portfolio Preview',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Parinya Sawatdee | Cloud & Software Engineer',
        description:
            'Motivated Software Engineer specializing in AWS, Next.js, CI/CD pipelines, and SRE Observability. Building scalable cloud infrastructure.',
        images: ['/Open Graph.png'],
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                {apiUrl && <link rel="preconnect" href={apiUrl} crossOrigin="anonymous" />}
                <link href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght@6..144,1..1000&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet" />
                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block" />
            </head>
            <body className="relative min-h-screen bg-blueprint text-deep-space-blue-100 font-sans">
                <div className="relative z-10">
                    <ClientLayout>{children}</ClientLayout>
                </div>
            </body>
        </html>
    );
}