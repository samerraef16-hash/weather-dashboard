import { type NextRequest, NextResponse } from "next/server"

const API_KEY = "1b3d55dbc56705ee98854b6ab0d8974c"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get("q")

  if (!query || query.length < 2) {
    return NextResponse.json([])
  }

  try {
    // Use OpenWeatherMap Geocoding API to get city suggestions
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`,
    )

    if (!response.ok) {
      return NextResponse.json([])
    }

    const data = await response.json()

    // Format the suggestions
    const suggestions = data.map((item: any) => ({
      name: item.name,
      country: item.country,
      state: item.state,
      lat: item.lat,
      lon: item.lon,
    }))

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error("Suggestions API error:", error)
    return NextResponse.json([])
  }
}
