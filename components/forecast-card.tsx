import { Card, CardContent } from "@/components/ui/card"
import { Droplets, Calendar } from "lucide-react"

interface ForecastData {
  date: string
  temp_max: number
  temp_min: number
  description: string
  icon: string
  humidity: number
}

interface ForecastCardProps {
  forecast: ForecastData
}

export function ForecastCard({ forecast }: ForecastCardProps) {
  const getWeatherIcon = (iconCode: string) => {
    return `https://openweathermap.org/img/wn/${iconCode}.png`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow"
    } else {
      return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    }
  }

  const getTemperatureGradient = (temp: number) => {
    if (temp >= 25) return "from-red-500 to-orange-500"
    if (temp >= 15) return "from-orange-500 to-yellow-500"
    if (temp >= 5) return "from-yellow-500 to-green-500"
    return "from-green-500 to-blue-500"
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-white/90 to-blue-50/90 dark:from-gray-800/90 dark:to-blue-900/90 backdrop-blur-sm border-2 border-blue-200/50 rounded-xl hover:scale-[1.02]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-purple-500" />
              <p className="font-bold text-sm text-gray-900 dark:text-white">{formatDate(forecast.date)}</p>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 capitalize mb-2 bg-white/60 dark:bg-gray-700/60 px-2 py-1 rounded-full inline-block">
              {forecast.description}
            </p>
            <div className="flex items-center gap-1">
              <Droplets className="h-3 w-3 text-blue-500" />
              <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">{forecast.humidity}%</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={getWeatherIcon(forecast.icon) || "/placeholder.svg"}
              alt={forecast.description}
              className="w-12 h-12 drop-shadow-md"
            />
            <div className="text-right">
              <p
                className={`font-black text-lg bg-gradient-to-r ${getTemperatureGradient(forecast.temp_max)} bg-clip-text text-transparent`}
              >
                {Math.round(forecast.temp_max)}°
              </p>
              <p className="text-sm text-gray-500 font-medium">{Math.round(forecast.temp_min)}°</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
