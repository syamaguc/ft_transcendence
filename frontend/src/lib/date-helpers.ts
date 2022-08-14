export function weeksBetween(startDate: Date, endDate: Date) {
  const msInWeek = 1000 * 60 * 60 * 24 * 7

  return Math.round(
    Math.abs(endDate.getTime() - startDate.getTime()) / msInWeek
  )
}
