'use client'

import { useState, useMemo } from "react";
import Image from "next/image";
import { Search, Home, LibraryBig, Plus, X, AlertTriangle } from 'lucide-react'
import { getFurnitureSuggestions } from '@/lib/furniture'

// Habitat color mapping for UI
const habitatColors = {
  'Bright': 'bg-yellow-400',
  'Cool': 'bg-blue-300',
  'Dark': 'bg-purple-800',
  'Dry': 'bg-orange-300',
  'Humid': 'bg-teal-500',
  'Warm': 'bg-red-500',
  'default': 'bg-gray-300'
}

export default function MainClient({ initialData }) {
  const [activeTab, setActiveTab] = useState('browse')
  const [searchTerm, setSearchTerm] = useState('')
  const [habitatFilter, setHabitatFilter] = useState('')
  const [areaFilter, setAreaFilter] = useState('')
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [houseResidents, setHouseResidents] = useState([])

  // Pokemon filtering logic
  const filteredPokemon = useMemo(() => {
    return initialData.filter(pokemon => {
      const matchesSearch = pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesHabitat = habitatFilter === '' || pokemon.idealHabitat === habitatFilter
      const matchesArea = areaFilter === '' || pokemon.habitats.some(h => h.areas[areaFilter])

      return matchesSearch && matchesHabitat && matchesArea
    })
  }, [initialData, searchTerm, habitatFilter, areaFilter])

  // House compatibility logic
  const compatibilityIssue = useMemo(() => {
    if (houseResidents.length <= 1) return null

    const idealHabitat = houseResidents[0].idealHabitat
    const conflicts = houseResidents.filter(r => r.idealHabitat !== idealHabitat)

    if (conflicts.length > 0) {
      return `Habitat conflict! All Pokémon must share the same Ideal Habitat. (Expected: ${idealHabitat})`
    }

    return null
  }, [houseResidents])

  // Handle adding to house
  const addToHouse = (pokemon) => {
    if (houseResidents.length >= 4) {
      alert("Maximum of 4 Pokémon per house!")
      return
    }
    if (houseResidents.find(r => r.number === pokemon.number)) {
      alert("This Pokémon is already in the house!")
      return
    }
    setHouseResidents([...houseResidents, pokemon])
    setSelectedPokemon(null)
    setActiveTab('house')
  }

  // Handle removing from house
  const removeFromHouse = (pokemonNumber) => {
    setHouseResidents(houseResidents.filter(r => r.number !== pokemonNumber))
  }

  // Get pokeapi sprite
  const getSpriteUrl = (numberStr) => {
    const num = parseInt(numberStr.replace('#', ''), 10)
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${num}.png`
  }

  // Count shared favorites across residents
  const allFavorites = useMemo(() => houseResidents.flatMap(r => r.favorites), [houseResidents])
  const favoriteCounts = useMemo(() => {
    return allFavorites.reduce((acc, fav) => {
      acc[fav] = (acc[fav] || 0) + 1
      return acc
    }, {})
  }, [allFavorites])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">
      {/* Navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50/50">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'browse'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <LibraryBig className="w-4 h-4 mr-2" />
          Pokémon Browser
        </button>
        <button
          onClick={() => setActiveTab('house')}
          className={`flex items-center px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'house'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
        >
          <Home className="w-4 h-4 mr-2" />
          House Builder
          {houseResidents.length > 0 && (
            <span className="ml-2 bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs">
              {houseResidents.length}/4
            </span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex-grow relative">

        {/* BROWSE TAB */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search Pokémon..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <select
                value={habitatFilter}
                onChange={(e) => setHabitatFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
              >
                <option value="">All Habitats</option>
                <option value="Bright">Bright</option>
                <option value="Cool">Cool</option>
                <option value="Dark">Dark</option>
                <option value="Dry">Dry</option>
                <option value="Humid">Humid</option>
                <option value="Warm">Warm</option>
              </select>

              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none"
              >
                <option value="">All Areas</option>
                <option value="Withered Wastelands">Withered Wastelands</option>
                <option value="Bleak Beach">Bleak Beach</option>
                <option value="Rocky Ridges">Rocky Ridges</option>
                <option value="Sparkling Skylands">Sparkling Skylands</option>
                <option value="Palette Town">Palette Town</option>
                <option value="Dream Island">Dream Island</option>
              </select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredPokemon.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500">
                  No Pokémon found matching your filters.
                </div>
              ) : (
                filteredPokemon.map((pokemon) => (
                  <button
                    key={pokemon.number}
                    onClick={() => setSelectedPokemon(pokemon)}
                    className="group flex flex-col items-center bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  >
                    <div className={`w-full h-2 ${habitatColors[pokemon.idealHabitat] || habitatColors.default}`} />
                    <div className="p-4 w-full flex flex-col items-center gap-2">
                      <div className="w-16 h-16 relative bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 group-hover:bg-slate-100 transition-colors">
                        <Image width={64} height={64}
                          src={getSpriteUrl(pokemon.number)}
                          alt={pokemon.name}
                          className="w-16 h-16 object-contain pixelated"
                          loading="lazy"
                        />
                      </div>
                      <div className="text-center w-full">
                        <div className="text-xs text-slate-400 font-mono">{pokemon.number}</div>
                        <div className="font-semibold text-slate-800 truncate" title={pokemon.name}>{pokemon.name}</div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-1">
                          <span className="block">{pokemon.idealHabitat} &bull; {pokemon.primaryLocation}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* HOUSE BUILDER TAB */}
        {activeTab === 'house' && (
          <div className="space-y-8 pb-16">
            {compatibilityIssue && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Compatibility Warning</h3>
                  <p className="text-sm mt-1">{compatibilityIssue}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Residents */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-800">Current Residents ({houseResidents.length}/4)</h2>
                  {houseResidents.length < 4 && (
                    <button
                      onClick={() => setActiveTab('browse')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add Pokémon
                    </button>
                  )}
                </div>

                {houseResidents.length === 0 ? (
                  <div className="p-12 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-center bg-slate-50/50">
                    <Home className="w-12 h-12 text-slate-300 mb-4" />
                    <h3 className="font-medium text-slate-900 mb-1">No residents yet</h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-6">
                      Go to the Pokémon Browser to find and add Pokémon to your house plan.
                    </p>
                    <button
                      onClick={() => setActiveTab('browse')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Browse Pokémon
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {houseResidents.map((pokemon) => (
                      <div key={pokemon.number} className="relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                        <button
                          onClick={() => removeFromHouse(pokemon.number)}
                          className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-colors z-10 backdrop-blur-sm"
                          title="Remove resident"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className={`h-1.5 w-full ${habitatColors[pokemon.idealHabitat] || habitatColors.default}`} />

                        <div className="p-4 flex gap-4 items-start border-b border-slate-100 bg-slate-50/50">
                          <Image width={64} height={64}
                            src={getSpriteUrl(pokemon.number)}
                            alt={pokemon.name}
                            className="w-16 h-16 object-contain pixelated bg-white rounded-lg border border-slate-200"
                          />
                          <div>
                            <div className="text-xs text-slate-400 font-mono">{pokemon.number}</div>
                            <div className="font-bold text-lg text-slate-800 leading-tight">{pokemon.name}</div>
                            <div className="inline-flex mt-1 items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-200 text-slate-700">
                              <span className="block">{pokemon.idealHabitat} &bull; {pokemon.primaryLocation}</span> Habitat
                            </div>
                          </div>
                        </div>

                        <div className="p-4 flex-grow">
                          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Favorites</h4>
                          <ul className="space-y-1.5">
                            {pokemon.favorites.map((fav, i) => {
                              const isShared = favoriteCounts[fav] > 1;
                              return (
                                <li key={i} className="flex items-center text-sm">
                                  <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isShared ? 'bg-green-500' : 'bg-slate-300'}`} />
                                  <span className={`${isShared ? 'text-green-700 font-medium' : 'text-slate-600'}`}>
                                    {fav}
                                    {isShared && <span className="ml-2 text-[10px] uppercase bg-green-100 text-green-700 px-1.5 py-0.5 rounded-sm">Shared</span>}
                                  </span>
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Furniture Optimization */}
              {houseResidents.length > 0 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800 mb-1">Furniture Optimization</h2>
                    <p className="text-sm text-slate-500 mb-4">Ranked by favorite coverage</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-200 bg-white">
                      <h3 className="text-sm font-semibold text-slate-800">Suggested Items</h3>
                    </div>

                    <div className="divide-y divide-slate-200 max-h-[500px] overflow-y-auto">
                      {getFurnitureSuggestions(houseResidents).length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-500">
                          No furniture suggestions available for these favorites.
                        </div>
                      ) : (
                        getFurnitureSuggestions(houseResidents).map((item, idx) => (
                          <div key={idx} className="p-4 bg-white hover:bg-slate-50 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-slate-800">{item.name}</h4>
                              <span className="inline-flex items-center px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                Score: {item.score}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 mb-2">Satisfies:</div>
                            <div className="flex flex-wrap gap-1.5">
                              {item.satisfiedFavorites.map((fav, i) => {
                                const isShared = favoriteCounts[fav] > 1;
                                return (
                                  <span
                                    key={i}
                                    className={`px-2 py-1 rounded text-xs border ${
                                      isShared
                                        ? 'bg-green-50 border-green-200 text-green-800 font-medium'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {fav}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Rules Reminder */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-20">
              <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-4 md:gap-8 justify-center items-center text-sm text-slate-600 font-medium">
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-400" /> Max 4 Pokémon</span>
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-400" /> All Habitats Must Match</span>
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-400" /> 10×10 Block Limit</span>
                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-400" /> Min 3 Unique Furniture Items</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* DETAIL MODAL */}
      {selectedPokemon && activeTab === 'browse' && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className={`h-3 w-full ${habitatColors[selectedPokemon.idealHabitat] || habitatColors.default}`} />
            <div className="flex justify-between items-start p-6 pb-4">
              <div className="flex gap-5 items-start">
                <Image width={64} height={64}
                  src={getSpriteUrl(selectedPokemon.number)}
                  alt={selectedPokemon.name}
                  className="w-24 h-24 object-contain pixelated bg-slate-50 rounded-xl border border-slate-100"
                />
                <div>
                  <div className="text-sm text-slate-400 font-mono mb-1">{selectedPokemon.number}</div>
                  <h2 className="text-3xl font-bold text-slate-900 leading-none mb-2">{selectedPokemon.name}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-700">
                      {selectedPokemon.idealHabitat}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {selectedPokemon.primaryLocation}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedPokemon(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 pt-2 space-y-6">

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Specialties</h3>
                  <div className="flex gap-2 flex-wrap">
                    {selectedPokemon.specialties.length > 0 ? (
                      selectedPokemon.specialties.map((spec, i) => (
                        <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-sm font-medium">
                          {spec}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500 italic">None</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Favorites</h3>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {selectedPokemon.favorites.map((fav, i) => (
                      <div key={i} className="flex items-center text-sm text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mr-2" />
                        {fav}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Habitats List */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Habitats to Attract</h3>
                <div className="space-y-3">
                  {selectedPokemon.habitats.map((hab, i) => (
                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-slate-800">{hab.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded font-medium border ${
                          hab.rarity === 'Rare' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          hab.rarity === 'Super Rare' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                          'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {hab.rarity || 'Common'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-xs text-slate-600">
                        <div><span className="font-semibold text-slate-500">Time:</span> {hab.time || 'Any'}</div>
                        <div><span className="font-semibold text-slate-500">Weather:</span> {hab.weather || 'Any'}</div>
                        <div className="col-span-full mt-1">
                          <span className="font-semibold text-slate-500">Areas:</span>{' '}
                          {Object.entries(hab.areas)
                            .filter(([_, present]) => present)
                            .map(([area, _]) => area)
                            .join(', ') || 'Unknown'}
                        </div>
                      </div>
                    </div>
                  ))}
                  {selectedPokemon.habitats.length === 0 && (
                    <div className="text-sm text-slate-500 italic px-2">No habitat data available.</div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => addToHouse(selectedPokemon)}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="w-4 h-4" /> Add to House Planner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
