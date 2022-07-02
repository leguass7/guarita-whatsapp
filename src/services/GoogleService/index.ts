import type { Credentials } from 'google-auth-library';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import { people } from 'googleapis/build/src/apis/people';
import { resolve } from 'path';
import qrcode from 'qrcode-terminal';

import { isDevMode } from '#/config';
import { loadFileJSON, saveFileJSON } from '#/helpers/files';
import { loggerService } from '#/useCases/logger.service';

import { LogClass } from '../LoggerService/log-class.decorator';
import { CredentialContent, IGoogleContact, IPaginationGoogleContact, ListParamsType, personDto } from './google-service.dto';

export type { IGoogleContact, CredentialContent, IPaginationGoogleContact };

export type TokenContent = Credentials;

export interface GoogleServiceOptions {
  credentialsPath: string;
}

export interface ResultAuthorisedByCode {
  status: number;
  tokens?: TokenContent;
}

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/contacts',
  //
];

const credentialFileName = 'credentials.json';
const tokenFileName = 'token.json';
@LogClass
export class GoogleService {
  private name: string;
  private authUrl: string;
  private tokens: TokenContent;
  private credentials: CredentialContent;
  private oAuth2Client: OAuth2Client;

  constructor(private options: GoogleServiceOptions) {
    this.name = options?.credentialsPath;
    this.loadCredentials().authorize();
  }

  private saveTokens(tokens: TokenContent) {
    const tokenFilePath = resolve(this.options?.credentialsPath, tokenFileName);
    saveFileJSON(tokenFilePath, tokens);
  }

  private loadCredentials() {
    const googlePath = this.options?.credentialsPath;
    const credentialFilePath = resolve(googlePath, credentialFileName);
    const credentials = loadFileJSON(credentialFilePath);
    if (!credentials) {
      loggerService.logError(`Credential file error ${credentialFilePath}`);
      return this;
    }
    this.credentials = credentials;

    const tokenFilePath = resolve(googlePath, tokenFileName);
    const tokens = loadFileJSON(tokenFilePath);
    this.tokens = tokens;
    return this;
  }

  public getAuthUrl() {
    return this.authUrl;
  }

  public async authorizeByCode(code: string): Promise<ResultAuthorisedByCode> {
    const { res, tokens } = await this.oAuth2Client.getToken(code);
    const result = { status: 500, tokens: null };
    if (tokens) {
      this.tokens = tokens;
      this.oAuth2Client.setCredentials(tokens);
      this.authUrl = '';
      result.tokens = tokens;
    }
    result.status = res?.status || 500;
    return result;
  }

  public requestAuthUrl() {
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    if (authUrl) {
      this.authUrl = authUrl;
      qrcode.generate(authUrl, { small: true });
      loggerService.logging('Para autorizar o google visite a URL:', authUrl);
    }

    return authUrl;
  }

  private authorize() {
    if (this.credentials?.installed) {
      const { client_secret, client_id, redirect_uris } = this.credentials.installed;
      const redirectUris = isDevMode ? redirect_uris[0] : redirect_uris[1];
      this.oAuth2Client = new OAuth2Client(client_id, client_secret, redirectUris);
      //
      this.oAuth2Client.on('tokens', tokens => {
        this.saveTokens(tokens);
        loggerService.logging('Tokens guardados.');
      });

      if (this.tokens) {
        this.oAuth2Client.setCredentials(this.tokens);

        loggerService.logging('Google autorizado');
      } else {
        this.requestAuthUrl();
      }
    }
  }

  async getContacts({ size = 0, nextPage }: IPaginationGoogleContact = {}) {
    const peopleApi = people({ version: 'v1', auth: this.oAuth2Client });
    const params: ListParamsType = { resourceName: 'people/me', personFields: 'emailAddresses,names,phoneNumbers,photos', pageSize: size };

    if (nextPage) params.pageToken = nextPage;
    const { status, data } = await peopleApi.people.connections.list(params);

    const success = !!(status === 200);
    return {
      success,
      data: success ? data?.connections?.map(personDto)?.filter(f => !!f) || [] : [],
      nextPageToken: data.nextPageToken,
      totalItems: data?.totalItems,
      size: data?.connections?.length,
    };
  }

  async allContacts(pageSize = 500): Promise<IGoogleContact[]> {
    const resultData: IGoogleContact[] = [];

    const next = async (resolver: (value: IGoogleContact[] | PromiseLike<IGoogleContact[]>) => void, nextPage?: string) => {
      const params: IPaginationGoogleContact = { size: pageSize };
      if (nextPage) params.nextPage = nextPage;

      const { success, nextPageToken, data } = await this.getContacts(params);
      if (success) data.forEach(d => resultData.push(d));

      if (success && nextPageToken) {
        return next(resolver, nextPageToken);
      }
      return resolver(resultData);
    };

    return new Promise(resolve => next(resolve));
  }
}
