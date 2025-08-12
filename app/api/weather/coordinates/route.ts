import { type NextRequest, NextResponse } from "next/server"

const API_KEY = "1b3d55dbc56705ee98854b6ab0d8974c"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lon = searchParams.get("lon")

  if (!lat || !lon) {
    return NextResponse.json({ error: "Latitude and longitude parameters are required" }, { status: 400 })
  }

  try {
    // Fetch current weather by coordinates
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
    )

    if (!weatherResponse.ok) {
      return NextResponse.json({ error: "Weather data not found" }, { status: 404 })
    }

    const weatherData = await weatherResponse.json()

    // Format the response
    const formattedData = {
      id: weatherData.id,
      name: weatherData.name,
      country: weatherData.sys.country,
      temp: weatherData.main.temp,
      feels_like: weatherData.main.feels_like,
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      humidity: weatherData.main.humidity,
      wind_speed: weatherData.wind.speed,
      pressure: weatherData.main.pressure,
      visibility: weatherData.visibility,
    }

    return NextResponse.json(formattedData)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 })
  }
}
