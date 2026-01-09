import Link from 'next/link'
import { getServerSession, convertSessionToReport } from '@/lib/sessions'
import Rapport from '@/components/Rapport'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function RapportPage({ params }: PageProps) {
    const { id } = await params
    const session = await getServerSession(id)

    if (!session) {
        notFound()
    }

    const reportData = convertSessionToReport(session)

    return (
        <div className="min-h-screen bg-neutral-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="text-neutral-500 hover:text-neutral-800 transition-colors flex items-center gap-2"
                    >
                        ← Terug naar dashboard
                    </Link>
                    <span className="text-neutral-300">|</span>
                    <h1 className="text-xl font-semibold text-neutral-800">
                        Rapport: {session.documentTitle}
                    </h1>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                    <Rapport
                        data={reportData}
                    />
                </div>
            </div>
        </div>
    )
}

