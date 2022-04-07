export function getFormattedShortTime(timestamp: string | number): string {
  const timestampNumber =
    typeof timestamp === "string" ? parseInt(timestamp) : timestamp
  const timeoptions = {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  } as const
  return new Date(timestampNumber * 1000)
    .toLocaleTimeString([], timeoptions)
    .replace(",", "")
}

export function msToHMS(ms: number): [string, string, string] {
  // 1- Convert to seconds:
  let seconds = ms / 1000
  // 2- Extract hours:
  const hours = Math.floor(seconds / 3600).toFixed(0) // 3,600 seconds in 1 hour
  seconds = seconds % 3600 // seconds remaining after extracting hours
  // 3- Extract minutes:
  const minutes = (seconds / 60).toFixed(0) // 60 seconds in 1 minute
  // 4- Keep only seconds not extracted to minutes:
  const secondsRounded = (seconds % 60).toFixed()
  return [
    String(hours).padStart(2, "0"),
    String(minutes).padStart(2, "0"),
    String(secondsRounded).padStart(2, "0"),
  ]
}
