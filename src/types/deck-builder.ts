
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
  descriptor: string
  alliance: string
  availableForPlay: boolean
  country: string
  tags: string[]
  maxActivationPoints: number
  costMatrix: CostMatrix
  packs: Pack[]
}

export { Division, Pack, MatrixRow, CostMatrix, UnitCategory}