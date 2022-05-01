import type { Credentials } from 'google-auth-library';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import { people } from 'googleapis/build/src/apis/people';
import { resolve } from 'path';
import qrcode from 'qrcode-terminal';

import { isDevMode } from '#/config';
import { loadFileJSON, saveFileJSON } from '#/helpers/files';

import { logError, logging } from '../logger';
import { LogClass } from '../logger/log-decorator';

type TokenContent = Credentials;
interface CredentialContent {
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

interface GoogleServiceOptions {
  credentialsPath: string;
}

interface ResultAuthorisedByCode {
  status: number;
  tokens?: TokenContent;
}

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/contacts',
  //
];
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
    const tokenFilePath = resolve(this.options?.credentialsPath, 'token.json');
    saveFileJSON(tokenFilePath, tokens);
  }

  private loadCredentials() {
    const googlePath = this.options?.credentialsPath;
    const credentialFilePath = resolve(googlePath, 'credentials.json');
    const credentials = loadFileJSON(credentialFilePath);
    if (!credentials) {
      logError(`Credential file error ${credentialFilePath}`);
      return this;
    }
    this.credentials = credentials;

    const tokenFilePath = resolve(googlePath, 'token.json');
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
      logging('Para autorizar o google visite a URL:', authUrl);
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
        logging('Tokens guardados.');
      });

      if (this.tokens) {
        this.oAuth2Client.setCredentials(this.tokens);

        logging('Google autorizado');
      } else {
        this.requestAuthUrl();
      }
    }
  }

  async getContacts() {
    const peopleApi = people({ version: 'v1', auth: this.oAuth2Client });
    const { status, data } = await peopleApi.people.connections.list({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names,phoneNumbers,coverPhotos',
      pageSize: 2000,
    });

    // console.log('data?.nextPageToken', data?.nextPageToken);
    // console.log('data?.totalItems', data?.totalItems, data?.connections.length);
    // console.log('data?.totalPeople', data?.totalPeople);

    return status === 200 ? data?.connections || [] : [];
  }
}
