import type { people_v1 } from 'googleapis/build/src/apis/people/v1';

export interface CredentialContent {
  installed: {
    client_id: string;
    project_id: string;
    auth_uri: string;
    token_uri: string;
    auth_provider_x509_cert_url: string;
    client_secret: string;
    redirect_uris: string[];
  };
}

// Contact People
export type PersonType = people_v1.Schema$Person;
export type FieldMetadataType = people_v1.Schema$FieldMetadata;
export type ListParamsType = people_v1.Params$Resource$People$Connections$List;

export interface IGoogleContact {
  resourceName: string;
  name?: string;
  phone?: string;
  email?: string;
  type?: string;
  photo?: string;
}

export interface IPaginationGoogleContact {
  size?: number;
  search?: string;
  nextPage?: string;
}

function findPrimary<T extends { metadata?: FieldMetadataType; default?: boolean }>(data: T[]): T {
  const found = data.find(d => !!d?.metadata?.primary || !!d?.metadata?.verified || !!d?.default);
  if (found) return found;
  return data?.length ? data[0] : null;
}

export function personDto(connectionItem: PersonType): IGoogleContact {
  const { resourceName, emailAddresses = [], names = [], phoneNumbers = [], photos = [] } = connectionItem;
  const result: IGoogleContact = { resourceName };

  if (phoneNumbers?.length) {
    const phone = findPrimary(phoneNumbers);
    result.phone = (phone?.canonicalForm || phone?.value || '').replace(/\D/g, '');
    result.type = phone?.type?.toLowerCase();
  }

  if (names?.length) {
    const name = findPrimary(names);
    result.name = name?.displayName || name?.givenName || 'no name';
  }

  if (emailAddresses?.length) {
    const email = findPrimary(emailAddresses);
    result.email = email?.value;
  }

  if (photos?.length) {
    const photo = findPrimary(photos);
    result.photo = photo?.url;
  }

  return result;
}
