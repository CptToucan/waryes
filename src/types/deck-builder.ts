
enum UnitCategory {
  LOG = 'EDefaultFactories/Logistic',
  REC = 'EDefaultFactories/reco',
  INF = 'EDefaultFactories/infanterie',
  ART = 'EDefaultFactories/support',
  TNK = 'EDefaultFactories/tank',
  AA = 'EDefaultFactories/at',
  HEL = 'EDefaultFactories/Helis',
  AIR = 'EDefaultFactories/air',
}

enum Country {
  FR = "FR",
  UK = "UK",
  RFA = "RFA",
  US = "US",
  SOV = "SOV",
  DDR = "DDR"
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
