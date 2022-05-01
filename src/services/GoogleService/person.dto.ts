import type { people_v1 } from 'googleapis/build/src/apis/people/v1';

export type PersonType = people_v1.Schema$Person;
export type FieldMetadataType = people_v1.Schema$FieldMetadata;

export interface IGoogleContact {
  resourceName: string;
  name?: string;
  phone?: string;
  email?: string;
  type?: string;
}

function findPrimary<T extends { metadata?: FieldMetadataType }>(data: T[]): T {
  const found = data.find(d => !!d?.metadata?.primary || !!d?.metadata?.verified);
  if (found) return found;
  return data?.length ? data[0] : null;
}

export function personDto(connectionItem: PersonType): IGoogleContact {
  const { resourceName, emailAddresses = [], names = [], phoneNumbers = [] } = connectionItem;
  const result: IGoogleContact = { resourceName };

  if (names?.length) {
    const name = findPrimary(names);
    result.name = name?.displayName || name?.givenName || 'no name';
  }

  if (phoneNumbers?.length) {
    const phone = findPrimary(phoneNumbers);
    result.phone = phone?.canonicalForm || phone?.value;
    result.type = phone?.type?.toLowerCase();
  }

  if (emailAddresses?.length) {
    const email = findPrimary(emailAddresses);
    result.email = email?.value;
  }

  return result;
}
