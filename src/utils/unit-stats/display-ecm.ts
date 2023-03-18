export function displayEcm(ecm?:number | null) {
  if(ecm == undefined) {
    return '0 %'
  }

  const newEcm = ecm * -1 * 100;

  return `${newEcm} %`
}