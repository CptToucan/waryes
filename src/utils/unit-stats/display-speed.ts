export function displaySpeed(speed?: number | string ) {
  if(speed === undefined) {
    speed = 0;
  }

  return `${speed} km/h`
}