export function displayPercentage(distance?:string | number | null) {
  if(distance == undefined) {
    distance = 0;
  }

  return `${distance} %`
}