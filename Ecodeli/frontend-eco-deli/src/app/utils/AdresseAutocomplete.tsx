"use client"

import { useState } from "react"

export default function AdresseAutocomplete({
  label,
  query,
  onQueryChange,
  onSelect,
}: {
  label: string
  query: string
  onQueryChange: (val: string) => void
  onSelect: (data: { street: string; city: string; postalCode: string }) => void
}) {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const fetchSuggestions = async (value: string) => {
    if (value.length < 3) return setSuggestions([])
    const res = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&limit=5`
    )
    const data = await res.json()
    setSuggestions(data.features || [])
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    onQueryChange(value)

    if (debounceTimer) clearTimeout(debounceTimer)
    const timer = setTimeout(() => {
      fetchSuggestions(value)
    }, 300)
    setDebounceTimer(timer)
  }

  const handleSelect = (feature: any) => {
    const props = feature.properties
    const label = props.label

    onSelect({
      street: props.name,
      city: props.city,
      postalCode: props.postcode,
    })

    onQueryChange(label)
    setSuggestions([])
  }

  return (
    <div className="relative">
      <label className="block font-semibold mb-1">{label}</label>
      <input
        type="text"
        placeholder="Commencez à taper une adresse"
        value={query}
        onChange={handleInput}
        className="w-full border p-2 rounded"
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded mt-1 shadow max-h-52 overflow-auto">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(s)
              }}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {s.properties.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
