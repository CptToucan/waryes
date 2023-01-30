type StringMap = {
  [key: string]: string;
};

export const categoryNames: StringMap = {
  'EDefaultFactories/Helis': 'HEL',
  'EDefaultFactories/Logistic': 'LOG',
  'EDefaultFactories/Planes': 'AIR',
  'EDefaultFactories/Support': 'ART',
  'EDefaultFactories/AT': 'AA',
  'EDefaultFactories/Infantry': 'INF',
  'EDefaultFactories/Recons': 'REC',
  'EDefaultFactories/Tanks': 'TNK',
  'EDefaultFactories/air': 'AIR',
  'EDefaultFactories/support': 'ART',
  'EDefaultFactories/at': 'AA',
  'EDefaultFactories/infanterie': 'INF',
  'EDefaultFactories/reco': 'REC',
  'EDefaultFactories/tank': 'TNK'
};

export function getCodeForFactoryDescriptor(descriptor: string): string | undefined {
  return categoryNames[descriptor];
}