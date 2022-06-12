import {AbstractFieldMetadata} from '../metadata/AbstractFieldMetadata';

export function convertMetadataArrayToMap(
  metadataArray: AbstractFieldMetadata<unknown>[]
) {
  const mappedMetadata: {
    [key: string]: AbstractFieldMetadata<unknown>;
  } = {};
  for (const metadata of metadataArray) {
    mappedMetadata[metadata.id] = metadata;
  }

  return mappedMetadata;
}
