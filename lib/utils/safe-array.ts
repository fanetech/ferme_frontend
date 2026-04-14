/**
 * Safely extracts an array from API response data.
 * Handles both direct array and paginated { content: [...] } formats.
 */
export function safeArray<T = any>(data: any): T[] {
  if (Array.isArray(data)) return data;
  if (data?.content && Array.isArray(data.content)) return data.content;
  return [];
}
