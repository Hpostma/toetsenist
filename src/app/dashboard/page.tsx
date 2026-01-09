import Link from 'next/link'
import { getAllSessions } from '@/lib/sessions'
import { formatDistanceToNow } from 'date-fns'
import { nl } from 'date-fns/locale'

export const dynamic = 'force-dynamic' // Zorg dat pagina altijd vers is

import LogoutButton from '@/components/LogoutButton'

export default async function DashboardPage() {
    const sessions = await getAllSessions()

    return (
        <div className="min-h-screen bg-neutral-50 p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-800">Mijn Dashboard</h1>
                        <LogoutButton />
                    </div>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-han-red text-white rounded-lg hover:bg-red-700 transition-colors font-bold shadow-sm"
                    >
                        + Nieuwe Toets
                    </Link>
                </div>

                {sessions.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-neutral-200 text-center">
                        <p className="text-neutral-500 text-lg mb-4">Je hebt nog geen toetsen gemaakt.</p>
                        <Link
                            href="/"
                            className="bg-neutral-900 text-white px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors inline-block"
                        >
                            Start je eerste zelftest
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {sessions.map(session => (
                            <Link
                                key={session.id}
                                href={session.status === 'completed' ? `/rapport/${session.id}` : '/'}
                                className="block group"
                            >
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200 hover:shadow-md hover:border-han-red transition-all flex justify-between items-center">
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-lg font-bold text-neutral-800 group-hover:text-han-red transition-colors font-heading">
                                                {session.documentTitle}
                                            </h2>
                                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${session.status === 'completed'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {session.status === 'completed' ? 'Voltooid' : 'Actief'}
                                            </span>
                                        </div>
                                        <div className="text-sm text-neutral-500 flex gap-4">
                                            <span>
                                                {new Date(session.startedAt).toLocaleDateString()}
                                            </span>
                                            <span className="text-neutral-300">•</span>
                                            <span>
                                                Niveau {session.currentLevel}
                                            </span>
                                            <span className="text-neutral-300">•</span>
                                            <span>
                                                {formatDistanceToNow(session.startedAt, { addSuffix: true, locale: nl })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-neutral-300 group-hover:text-han-red transition-colors">
                                        ➤
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
