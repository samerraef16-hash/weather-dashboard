"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, Loader2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WeatherCard } from "@/components/weather-card"
import { ForecastCard } from "@/components/forecast-card"
import { SearchSuggestions } from "@/components/search-suggestions"
import { useToast } from "@/hooks/use-toast"

interface WeatherData {
  id: number
  name: string
  country: string
  temp: number
  feels_like: number
  description: string
  icon: string
  humidity: number
  wind_speed: number
  pressure: number
  visibility: number
  uv_index?: number
}

interface ForecastData {
  date: string
  temp_max: number
  temp_min: number
  description: string
  icon: string
  humidity: number
}

interface CitySuggestion {
  name: string
  country: string
  state?: string
  lat: number
  lon: number
}

export default function WeatherDashboard() {
  const [cities, setCities] = useState<WeatherData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isLocationLoading, setIsLocationLoading] = useState(false)
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState(false)
  const [selectedCity, setSelectedCity] = useState<WeatherData | null>(null)
  const [forecast, setForecast] = useState<ForecastData[]>([])
  const [isForecastLoading, setIsForecastLoading] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const { toast } = useToast()

  const searchRef = useRef<HTMLDivElement>(null)
  const suggestionsTimeoutRef = useRef<NodeJS.Timeout>()

  // Auto-fetch user's current location on mount
  useEffect(() => {
    getCurrentLocationWeather()
  }, [])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getCurrentLocationWeather = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      })
      return
    }

    setIsLocationLoading(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(`/api/weather/coordinates?lat=${latitude}&lon=${longitude}`)

          if (!response.ok) throw new Error("Failed to fetch weather data")

          const data = await response.json()

          // Check if city already exists
          const existingCity = cities.find((city) => city.id === data.id)
          if (!existingCity) {
            setCities((prev) => [data, ...prev])
            setSelectedCity(data)
            await fetchForecast(data.name)
          }

          toast({
            title: "🌍 Location found!",
            description: `Weather data loaded for ${data.name}, ${data.country}`,
          })
        } catch (error) {
          toast({
            title: "❌ Error",
            description: "Failed to fetch weather for your location.",
            variant: "destructive",
          })
        } finally {
          setIsLocationLoading(false)
        }
      },
      (error) => {
        setIsLocationLoading(false)
        toast({
          title: "📍 Location access denied",
          description: "Please allow location access or search for a city manually.",
          variant: "destructive",
        })
      },
    )
  }

  const fetchSuggestions = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsSuggestionsLoading(true)

    try {
      const response = await fetch(`/api/weather/suggestions?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.slice(0, 5)) // Limit to 5 suggestions
        setShowSuggestions(true)
        setSelectedSuggestionIndex(-1)
      }
    } catch (error) {
      console.error("Failed to fetch suggestions:", error)
    } finally {
      setIsSuggestionsLoading(false)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    // Clear existing timeout
    if (suggestionsTimeoutRef.current) {
      clearTimeout(suggestionsTimeoutRef.current)
    }

    // Debounce suggestions fetch
    suggestionsTimeoutRef.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 300)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(suggestions[selectedSuggestionIndex])
        } else {
          searchCity(e)
        }
        break
      case "Escape":
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        break
    }
  }

  const selectSuggestion = async (suggestion: CitySuggestion) => {
    setSearchQuery(`${suggestion.name}, ${suggestion.country}`)
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)

    // Fetch weather for selected suggestion
    await addCityByCoordinates(suggestion.lat, suggestion.lon, `${suggestion.name}, ${suggestion.country}`)
  }

  const addCityByCoordinates = async (lat: number, lon: number, displayName: string) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/weather/coordinates?lat=${lat}&lon=${lon}`)

      if (!response.ok) {
        throw new Error("Failed to fetch weather data")
      }

      const data = await response.json()

      // Check if city already exists
      const existingCity = cities.find((city) => city.id === data.id)
      if (existingCity) {
        toast({
          title: "🏙️ City already added",
          description: `${data.name} is already in your dashboard.`,
        })
        setSearchQuery("")
        setIsLoading(false)
        return
      }

      setCities((prev) => [...prev, data])
      setSearchQuery("")

      toast({
        title: "✅ City added!",
        description: `Weather data loaded for ${data.name}, ${data.country}`,
      })
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to fetch weather data for this location.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const searchCity = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setShowSuggestions(false)

    try {
      const response = await fetch(`/api/weather/search?city=${encodeURIComponent(searchQuery)}`)

      if (!response.ok) {
        throw new Error("City not found")
      }

      const data = await response.json()

      // Check if city already exists
      const existingCity = cities.find((city) => city.id === data.id)
      if (existingCity) {
        toast({
          title: "🏙️ City already added",
          description: `${data.name} is already in your dashboard.`,
        })
        setSearchQuery("")
        setIsLoading(false)
        return
      }

      setCities((prev) => [...prev, data])
      setSearchQuery("")

      toast({
        title: "✅ City added!",
        description: `Weather data loaded for ${data.name}, ${data.country}`,
      })
    } catch (error) {
      toast({
        title: "❌ City not found",
        description: "Please check the spelling and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const removeCity = (cityId: number) => {
    setCities((prev) => prev.filter((city) => city.id !== cityId))
    if (selectedCity?.id === cityId) {
      setSelectedCity(null)
      setForecast([])
    }
  }

  const fetchForecast = async (cityName: string) => {
    setIsForecastLoading(true)
    try {
      const response = await fetch(`/api/weather/forecast?city=${encodeURIComponent(cityName)}`)
      if (!response.ok) throw new Error("Failed to fetch forecast")

      const data = await response.json()
      setForecast(data)
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to fetch forecast data.",
        variant: "destructive",
      })
    } finally {
      setIsForecastLoading(false)
    }
  }

  const handleCitySelect = async (city: WeatherData) => {
    setSelectedCity(city)
    await fetchForecast(city.name)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 via-blue-50 to-cyan-100 dark:from-purple-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3">
            🌈 Weather Dashboard
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">Real-time weather data for cities around the world</p>
        </div>

        {/* Search and Location */}
        <div className="max-w-2xl mx-auto mb-8" ref={searchRef}>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <form onSubmit={searchCity} className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder="Search for a city... 🔍"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-white/80 backdrop-blur-sm border-2 border-purple-200 focus:border-purple-400 rounded-xl shadow-lg"
                  />
                  {isSuggestionsLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !searchQuery.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                </Button>
              </form>

              {/* Search Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <SearchSuggestions
                  suggestions={suggestions}
                  onSelect={selectSuggestion}
                  selectedIndex={selectedSuggestionIndex}
                />
              )}
            </div>

            <Button
              variant="outline"
              onClick={getCurrentLocationWeather}
              disabled={isLocationLoading}
              className="shrink-0 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-0 rounded-xl shadow-lg"
            >
              {isLocationLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {cities.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-8xl mb-6">🌤️</div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              No cities added yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
              Search for a city or use your current location to get started
            </p>
            <div className="flex justify-center gap-4 text-4xl">
              <span>🌍</span>
              <span>🌡️</span>
              <span>⛅</span>
              <span>🌈</span>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Cities Grid */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  🏙️ Your Cities
                </h2>
                <Badge
                  variant="secondary"
                  className="bg-gradient-to-r from-pink-500 to-violet-500 text-white text-sm px-4 py-2 rounded-full shadow-lg"
                >
                  {cities.length} {cities.length === 1 ? "city" : "cities"}
                </Badge>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {cities.map((city) => (
                  <div key={city.id} className="relative group">
                    <WeatherCard
                      weather={city}
                      onClick={() => handleCitySelect(city)}
                      isSelected={selectedCity?.id === city.id}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 h-8 w-8 p-0 bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600 rounded-full shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeCity(city.id)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Forecast Panel */}
            <div className="lg:col-span-1">
              {selectedCity ? (
                <Card className="sticky top-4 bg-gradient-to-br from-white/90 to-blue-50/90 backdrop-blur-sm border-2 border-blue-200 shadow-xl rounded-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        📊 3-Day Forecast
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 rounded-full"
                      >
                        {selectedCity.name}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isForecastLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-3" />
                          <p className="text-gray-600">Loading forecast...</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {forecast.map((day, index) => (
                          <ForecastCard key={index} forecast={day} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="sticky top-4 bg-gradient-to-br from-white/90 to-purple-50/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl rounded-2xl">
                  <CardContent className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📊</div>
                      <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                        Select a city
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Click on any city card to view its 3-day forecast
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
