import { login, signup } from './actions'

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string; error?: string }>
}) {
    const params = await searchParams
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg border border-gray-200">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-han-red text-white flex items-center justify-center rounded-xl mx-auto mb-4 text-2xl font-bold shadow-md">
                        TS
                    </div>
                    <h1 className="text-2xl font-bold font-heading text-gray-900">Welkom bij Toetsenist</h1>
                    <p className="text-gray-500 mt-2">Log in om je voortgang te bekijken</p>
                </div>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="email">
                            Email adres
                        </label>
                        <input
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-han-red focus:ring-2 focus:ring-red-100 outline-none transition-all"
                            id="email"
                            name="email"
                            type="email"
                            placeholder="student@han.nl"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1" htmlFor="password">
                            Wachtwoord
                        </label>
                        <input
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-han-red focus:ring-2 focus:ring-red-100 outline-none transition-all"
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {params?.error && (
                        <div className="p-3 bg-red-50 text-han-red text-sm rounded-lg font-medium border border-red-100">
                            ⚠️ {params.error}
                        </div>
                    )}

                    <div className="flex gap-4 pt-2">
                        <button
                            formAction={login}
                            className="flex-1 bg-han-red text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-colors shadow-sm"
                        >
                            Inloggen
                        </button>
                        <button
                            formAction={signup}
                            className="flex-1 bg-white text-han-red border-2 border-han-red py-3 rounded-lg font-bold hover:bg-red-50 transition-colors"
                        >
                            Registreren
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
