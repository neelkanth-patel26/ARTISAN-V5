export function getImageUrl(imageUrl: string | null | undefined): string {
  if (!imageUrl) return '/placeholder.jpg'
  
  // If it's already a full URL (http/https), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // If it starts with /uploads, it's a local file
  if (imageUrl.startsWith('/uploads/')) {
    return imageUrl
  }
  
  // If it's a Supabase storage path, construct the full URL
  if (imageUrl.includes('supabase.co/storage')) {
    return imageUrl
  }
  
  // Assume it's a Supabase storage path without domain
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  return `${supabaseUrl}/storage/v1/object/public/${imageUrl}`
}
