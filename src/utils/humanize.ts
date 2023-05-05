export function humanize(str: string): string {
  return str
    .replace(/^[\s_]+|[\s_]+$/g, '') // remove leading/trailing spaces and underscores
    .replace(/[\s_]+/g, ' ') // replace multiple spaces/underscores with a single space
    .replace(/([a-z])([A-Z])/g, '$1 $2') // add space between camel-cased words
    .replace(/^[a-z]/, m => m.toUpperCase()); // capitalize the first letter
}
