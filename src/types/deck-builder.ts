interface CostMatrix {
  name: string
  matrix: MatrixRow[]
}

interface MatrixRow {
  name: string
  activationCosts: number[]
}

interface Pack {
  packDescriptor: string
  unitDescriptor: string
  availableWithoutTransport: boolean
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

export { Division, Pack, MatrixRow, CostMatrix}