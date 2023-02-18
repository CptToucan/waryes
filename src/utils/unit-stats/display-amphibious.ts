import { Unit } from "../../types/unit";

export function displayAmphibious (unit: Unit) {
  return unit.specialities.includes("_amphibie") ? "Yes" : "No";
}