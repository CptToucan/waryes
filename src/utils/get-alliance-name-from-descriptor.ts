interface AllianceMap {
  [key: string]: string
}

const map: AllianceMap = {
  "ECoalition/Allied": "NATO",
  "ECoalition/Axis": "PACT"
}

export function getAllianceNameFromDescriptor(descriptor: string) {
  return map[descriptor];
}