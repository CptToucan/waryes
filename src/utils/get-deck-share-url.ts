export function getDeckShareUrl(deckCode: string) {
  return `${location.origin}/deck-builder?code=${encodeURIComponent(deckCode)}`
}