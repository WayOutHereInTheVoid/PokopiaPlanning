import { parseData } from '@/lib/parseData'
import MainClient from './MainClient'

export default function Home() {
  const pokemonData = parseData()

  return (
    <main className="min-h-screen bg-gray-50 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Pokopia Companion</h1>
          <p className="mt-2 text-sm text-slate-600">Optimize housing and furnishings for your Pokémon.</p>
        </header>

        <MainClient initialData={pokemonData} />
      </div>
    </main>
  )
}
