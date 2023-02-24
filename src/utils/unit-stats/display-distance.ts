export function displayDistance(distance?:string | number | null) {
  if(distance == undefined || distance == null) {
    distance = 0;
  }

  return `${distance} m`
}