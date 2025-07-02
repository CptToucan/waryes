
enum UnitCategory {
  LOG = 'EFactory/Logistic',
  REC = 'EFactory/Recons',
  INF = 'EFactory/Infantry',
  ART = 'EFactory/Art',
  TNK = 'EFactory/Tanks',
  AA = 'EFactory/DCA',
  HEL = 'EFactory/Helis',
  AIR = 'EFactory/Planes',
  DEFENSE = 'EFactory/Defense',
}

enum Country {
  BEL = "BEL",
  FR = "FR",
  UK = "UK",
  RFA = "RFA",
  US = "US",
  SOV = "SOV",
  DDR = "DDR",
  POL = "POL",
  NL = "NL",
  LUX = "LUX",
  CAN = "CAN",
  ESP = "ESP",
  TCH = "TCH",
}

interface CostMatrix {
  name: string
  matrix: MatrixRow[]
}

interface MatrixRow {
  name: UnitCategory
  activationCosts: number[]
}

interface Pack {
  packDescriptor: string
  unitDescriptor: string
  availableWithoutTransport: boolean
  availableTransportList?: string[]
  numberOfUnitsInPack: number
  numberOfUnitInPackXPMultiplier: number[]
  numberOfCards: number
}

interface Division {
  id: number,
  name: string,
  descriptor: string
  alliance: string
  availableForPlay: boolean
  country: Country
  tags: string[]
  maxActivationPoints: number
  costMatrix: CostMatrix
  packs: Pack[]
}
interface DivisionsMap {
  [key: string]: Division
}

export { Division, DivisionsMap, Pack, MatrixRow, CostMatrix, UnitCategory, Country}
