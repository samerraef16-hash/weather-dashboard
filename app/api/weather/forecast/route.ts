import { type NextRequest, NextResponse } from "next/server"

const API_KEY = "1b3d55dbc56705ee98854b6ab0d8974c"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const city = searchParams.get("city")

  if (!city) {
    return NextResponse.json({ error: "City parameter is required" }, { status: 400 })
  }

  try {
    // Fetch 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`,
    )

    if (!forecastResponse.ok) {
      return NextResponse.json({ error: "Forecast data not found" }, { status: 404 })
    }

    const forecastData = await forecastResponse.json()

    // Process forecast data to get daily forecasts (next 3 days)
    const dailyForecasts = []
    const processedDates = new Set()

    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000)
      const dateString = date.toDateString()

      // Skip today and only get next 3 days
      const today = new Date().toDateString()
      if (dateString === today || processedDates.has(dateString)) {
        continue
      }

      if (dailyForecasts.length >= 3) {
        break
      }

      // Get the forecast for noon (12:00) or closest available time
      const dayForecasts = forecastData.list.filter((forecast: any) => {
        const forecastDate = new Date(forecast.dt * 1000)
        return forecastDate.toDateString() === dateString
      })

      // Find the forecast closest to noon
      const noonForecast = dayForecasts.reduce((closest: any, current: any) => {
        const currentHour = new Date(current.dt * 1000).getHours()
        const closestHour = new Date(closest.dt * 1000).getHours()

        return Math.abs(currentHour - 12) < Math.abs(closestHour - 12) ? current : closest
      })

      // Get min/max temperatures for the day
      const temps = dayForecasts.map((f: any) => f.main.temp)
      const tempMax = Math.max(...temps)
      const tempMin = Math.min(...temps)

      dailyForecasts.push({
        date: date.toISOString(),
        temp_max: tempMax,
        temp_min: tempMin,
        description: noonForecast.weather[0].description,
        icon: noonForecast.weather[0].icon,
        humidity: noonForecast.main.humidity,
      })

      processedDates.add(dateString)
    }

    return NextResponse.json(dailyForecasts)
  } catch (error) {
    console.error("Forecast API error:", error)
    return NextResponse.json({ error: "Failed to fetch forecast data" }, { status: 500 })
  }
}
