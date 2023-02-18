export function displayTime(time?: string | number | null) {
  if(time == undefined) {
    time = 0;
  }

  return `${time} s`
}