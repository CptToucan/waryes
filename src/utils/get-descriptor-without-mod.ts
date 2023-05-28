import { BucketFolder } from "../services/bundle-manager";

export function getDescriptorWithoutMod(descriptor: string) {
  let descriptorName = descriptor;
  if(descriptorName?.endsWith(`_${BucketFolder.FRAGO}`)) {
    descriptorName = descriptorName.replace(`_${BucketFolder.FRAGO}`, "");
  }

  if(descriptorName?.endsWith(`_${BucketFolder.WARNO_LET_LOOSE}`)) {
    descriptorName = descriptorName.replace(`_${BucketFolder.WARNO_LET_LOOSE}`, "");
  }

  return descriptorName;
}