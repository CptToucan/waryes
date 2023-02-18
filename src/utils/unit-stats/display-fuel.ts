export function displayFuel(fuel?:number | string | null) {
  if(fuel == undefined) {
    fuel = 0;
  }

  return `${fuel} L`
}