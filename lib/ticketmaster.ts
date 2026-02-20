interface TicketmasterEvent {
  id: string
  name: string
  type: string
  url?: string
  images?: Array<{ url: string; width: number; height: number }>
  dates?: {
    start?: {
      localDate?: string
      localTime?: string
    }
  }
  _embedded?: {
    venues?: Array<{
      name: string
      address?: {
        line1?: string
        line2?: string
        city?: { name?: string }
        state?: { name?: string }
        country?: { name?: string }
      }
      location?: {
        latitude?: string
        longitude?: string
      }
    }>
  }
  distance?: number
  units?: string
  priceRanges?: Array<{
    type: string
    currency: string
    min: number
    max: number
  }>
}

interface TicketmasterResponse {
  _embedded?: {
    events?: TicketmasterEvent[]
  }
  page?: {
    size: number
    totalElements: number
    totalPages: number
    number: number
  }
}

export interface ProcessedEvent {
  id: string
  name: string
  type: string
  image: string
  distance: string
  address: string
  date: string
  time: string
  description: string
  url?: string
  latitude?: number
  longitude?: number
  priceRange?: string
}

export async function fetchNearbyEvents(
  latitude: number,
  longitude: number,
  radius: number = 50
): Promise<ProcessedEvent[]> {
  const apiKey = process.env.NEXT_PUBLIC_TICKETMASTER_API_KEY
  
  if (!apiKey) {
    throw new Error('Ticketmaster API key not found')
  }

  const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
  url.searchParams.append('apikey', apiKey)
  url.searchParams.append('latlong', `${latitude},${longitude}`)
  url.searchParams.append('radius', radius.toString())
  url.searchParams.append('unit', 'km')
  url.searchParams.append('classificationName', 'Arts & Theatre')
  url.searchParams.append('size', '20')
  url.searchParams.append('sort', 'distance,asc')
  url.searchParams.append('sort', 'distance,asc')

  try {
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status}`)
    }

    const data: TicketmasterResponse = await response.json()
    
    if (!data._embedded?.events) {
      return []
    }

    return data._embedded.events.map(event => processEvent(event)).filter(event => isArtRelated(event))
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

export async function fetchGlobalEvents(): Promise<ProcessedEvent[]> {
  const apiKey = process.env.NEXT_PUBLIC_TICKETMASTER_API_KEY
  
  if (!apiKey) {
    throw new Error('Ticketmaster API key not found')
  }

  const url = new URL('https://app.ticketmaster.com/discovery/v2/events.json')
  url.searchParams.append('apikey', apiKey)
  url.searchParams.append('classificationName', 'Arts & Theatre')
  url.searchParams.append('size', '50')
  url.searchParams.append('sort', 'date,asc')

  try {
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status}`)
    }

    const data: TicketmasterResponse = await response.json()
    
    if (!data._embedded?.events) {
      return []
    }

    return data._embedded.events.map(event => processEvent(event, true)).filter(event => isArtRelated(event))
  } catch (error) {
    console.error('Error fetching events:', error)
    return []
  }
}

function isArtRelated(event: ProcessedEvent): boolean {
  const artKeywords = [
    'art', 'gallery', 'museum', 'exhibition', 'sculpture', 'painting', 'photography',
    'design', 'creative', 'artist', 'artwork', 'visual', 'contemporary', 'modern',
    'craft', 'ceramic', 'drawing', 'print', 'installation', 'collection'
  ]
  
  const text = `${event.name} ${event.description}`.toLowerCase()
  return artKeywords.some(keyword => text.includes(keyword))
}

function processEvent(event: TicketmasterEvent, isGlobal: boolean = false): ProcessedEvent {
  const venue = event._embedded?.venues?.[0]
  const image = event.images?.find(img => img.width >= 400)?.url || 
               event.images?.[0]?.url || 
               'https://images.unsplash.com/photo-1536924430914-91f9e2041b83?w=800&h=600&fit=crop&q=90'

  const address = venue?.address ? [
    venue.address.line1,
    venue.address.line2,
    venue.address.city?.name,
    venue.address.state?.name,
    venue.address.country?.name
  ].filter(Boolean).join(', ') : 'Address not available'

  const date = event.dates?.start?.localDate || 'Date TBA'
  const time = event.dates?.start?.localTime || ''
  
  const distance = isGlobal ? 
    (venue?.address?.country?.name || 'Global') : 
    (event.distance ? `${event.distance.toFixed(1)} ${event.units || 'km'}` : 'Distance unknown')

  const priceRange = event.priceRanges?.[0] ? 
    `${event.priceRanges[0].currency} ${event.priceRanges[0].min} - ${event.priceRanges[0].max}` : 
    undefined

  return {
    id: event.id,
    name: event.name,
    type: event.type || 'Event',
    image,
    distance,
    address,
    date,
    time,
    description: `${event.name} - Experience this amazing arts and theatre event.`,
    url: event.url,
    latitude: venue?.location?.latitude ? parseFloat(venue.location.latitude) : undefined,
    longitude: venue?.location?.longitude ? parseFloat(venue.location.longitude) : undefined,
    priceRange
  }
}