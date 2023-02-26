const commandSpecialties = ["hq", "hq_veh", "hq_inf", "hq_tank"];

export function isSpecialtyCommand(specialty: string) {
  return commandSpecialties.includes(specialty);
}