interface AllianceMap {
  [key: string]: string
}

const map: AllianceMap = {
  "ENationalite/Allied": "NATO",
  "ENationalite/Axis": "PACT"
}

export function getAllianceNameFromDescriptor(descriptor: string) {
  return map[descriptor];
}