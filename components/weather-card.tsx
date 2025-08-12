"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Droplets, Wind, Eye, Gauge, Thermometer } from "lucide-react"

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
}

interface WeatherCardProps {
  weather: WeatherData
  onClick: () => void
  isSelected: boolean
}

export function WeatherCard({ weather, onClick, isSelected }: WeatherCardProps) {
  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  }

  const getTemperatureColor = (temp: number) => {
    if (temp >= 30) return "from-red-500 to-orange-500"
    if (temp >= 20) return "from-orange-500 to-yellow-500"
    if (temp >= 10) return "from-yellow-500 to-green-500"
    if (temp >= 0) return "from-green-500 to-blue-500"
    return "from-blue-500 to-cyan-500"
  }

  const getCardGradient = (temp: number) => {
    if (temp >= 30) return "from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20"
    if (temp >= 20) return "from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20"
    if (temp >= 10) return "from-yellow-50 to-green-50 dark:from-yellow-900/20 dark:to-green-900/20"
    if (temp >= 0) return "from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
    return "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20"
  }

  const getBorderColor = (temp: number) => {
    if (temp >= 30) return "border-red-200 dark:border-red-800"
    if (temp >= 20) return "border-orange-200 dark:border-orange-800"
    if (temp >= 10) return "border-yellow-200 dark:border-yellow-800"
    if (temp >= 0) return "border-green-200 dark:border-green-800"
    return "border-blue-200 dark:border-blue-800"
  }

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.03] transform bg-gradient-to-br ${getCardGradient(weather.temp)} backdrop-blur-sm border-2 ${getBorderColor(weather.temp)} rounded-2xl ${
        isSelected ? "ring-4 ring-purple-400 shadow-2xl scale-[1.02]" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-white">{weather.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">🌍 {weather.country}</p>
          </div>
          <div className="relative">
            <img
              src={getWeatherIcon(weather.icon) || "/placeholder.svg"}
              alt={weather.description}
              className="w-20 h-20 drop-shadow-lg"
            />
          </div>
        </div>

        {/* Temperature */}
        <div className="mb-6">
          <div className="flex items-baseline gap-3 mb-2">
            <span
              className={`text-4xl font-black bg-gradient-to-r ${getTemperatureColor(weather.temp)} bg-clip-text text-transparent`}
            >
              {Math.round(weather.temp)}°
            </span>
            <div className="flex items-center gap-1">
              <Thermometer className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                Feels {Math.round(weather.feels_like)}°
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 capitalize font-medium bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-full inline-block">
            {weather.description}
          </p>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 bg-blue-100/80 dark:bg-blue-900/30 p-3 rounded-xl">
            <Droplets className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Humidity</p>
              <p className="font-bold text-gray-900 dark:text-white">{weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-green-100/80 dark:bg-green-900/30 p-3 rounded-xl">
            <Wind className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Wind</p>
              <p className="font-bold text-gray-900 dark:text-white">{Math.round(weather.wind_speed)} m/s</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-purple-100/80 dark:bg-purple-900/30 p-3 rounded-xl">
            <Gauge className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Pressure</p>
              <p className="font-bold text-gray-900 dark:text-white">{weather.pressure} hPa</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-orange-100/80 dark:bg-orange-900/30 p-3 rounded-xl">
            <Eye className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Visibility</p>
              <p className="font-bold text-gray-900 dark:text-white">{Math.round(weather.visibility / 1000)} km</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
