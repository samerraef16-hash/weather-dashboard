"use client"

import { Card, CardContent } from "@/components/ui/card"
import { MapPin } from "lucide-react"

interface CitySuggestion {
  name: string
  country: string
  state?: string
  lat: number
  lon: number
}

interface SearchSuggestionsProps {
  suggestions: CitySuggestion[]
  onSelect: (suggestion: CitySuggestion) => void
  selectedIndex: number
}

export function SearchSuggestions({ suggestions, onSelect, selectedIndex }: SearchSuggestionsProps) {
  const getCountryFlag = (countryCode: string) => {
    // Simple country code to flag emoji mapping
    const flags: { [key: string]: string } = {
      US: "🇺🇸",
      GB: "🇬🇧",
      CA: "🇨🇦",
      AU: "🇦🇺",
      DE: "🇩🇪",
      FR: "🇫🇷",
      IT: "🇮🇹",
      ES: "🇪🇸",
      JP: "🇯🇵",
      CN: "🇨🇳",
      IN: "🇮🇳",
      BR: "🇧🇷",
      RU: "🇷🇺",
      MX: "🇲🇽",
      AR: "🇦🇷",
      ZA: "🇿🇦",
      EG: "🇪🇬",
      NG: "🇳🇬",
      KE: "🇰🇪",
      MA: "🇲🇦",
      TH: "🇹🇭",
      VN: "🇻🇳",
      PH: "🇵🇭",
      ID: "🇮🇩",
      MY: "🇲🇾",
      SG: "🇸🇬",
      KR: "🇰🇷",
      TR: "🇹🇷",
      SA: "🇸🇦",
      AE: "🇦🇪",
      IL: "🇮🇱",
      PK: "🇵🇰",
      BD: "🇧🇩",
      LK: "🇱🇰",
      NP: "🇳🇵",
      MM: "🇲🇲",
      NL: "🇳🇱",
      BE: "🇧🇪",
      CH: "🇨🇭",
      AT: "🇦🇹",
      SE: "🇸🇪",
      NO: "🇳🇴",
      DK: "🇩🇰",
      FI: "🇫🇮",
      PL: "🇵🇱",
      CZ: "🇨🇿",
      HU: "🇭🇺",
      RO: "🇷🇴",
      BG: "🇧🇬",
      HR: "🇭🇷",
      RS: "🇷🇸",
      BA: "🇧🇦",
      SI: "🇸🇮",
      SK: "🇸🇰",
      UA: "🇺🇦",
      BY: "🇧🇾",
      LT: "🇱🇹",
      LV: "🇱🇻",
      EE: "🇪🇪",
      IE: "🇮🇪",
      PT: "🇵🇹",
      GR: "🇬🇷",
      CY: "🇨🇾",
      MT: "🇲🇹",
      IS: "🇮🇸",
      LU: "🇱🇺",
    }
    return flags[countryCode] || "🌍"
  }

  return (
    <Card className="absolute top-full left-0 right-0 mt-2 z-50 bg-white/95 backdrop-blur-md border-2 border-purple-200 shadow-2xl rounded-xl overflow-hidden">
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.name}-${suggestion.country}-${suggestion.lat}-${suggestion.lon}`}
              className={`flex items-center gap-3 p-4 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? "bg-gradient-to-r from-purple-100 to-pink-100" : ""
              }`}
              onClick={() => onSelect(suggestion)}
            >
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-500" />
                <span className="text-2xl">{getCountryFlag(suggestion.country)}</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  {suggestion.name}
                  {suggestion.state && <span className="text-gray-500 font-normal">, {suggestion.state}</span>}
                </p>
                <p className="text-sm text-gray-600">{suggestion.country}</p>
              </div>
              <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                {suggestion.lat.toFixed(2)}, {suggestion.lon.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
