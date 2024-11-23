export default function extractDamageFamilyProperties(familyIndexString: string) {
  return {
    family: familyIndexString.split('-')[0],
    index: Number(familyIndexString.split('-')[1]) - 1,
  };
}