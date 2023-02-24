export function displayProjectileAcceleration(distance?:string | number | null) {
  if(distance == undefined) {
    distance = 0;
  }

  return `${distance} m/s²`
}