import { OAuth2Client, Credentials } from 'google-auth-library';
import { google } from 'googleapis';
import { resolve } from 'path';
import qrcode from 'qrcode-terminal';

import { isDevMode } from '#/config';
import { loadFileJSON, saveFileJSON } from '#/helpers/files';

import { logging } from '../logger';
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

  private loadCredentials() {
    const googlePath = this.options?.credentialsPath;
    const credentialFilePath = resolve(googlePath, 'credentials.json');
    const credentials = loadFileJSON(credentialFilePath);
    if (!credentials) throw new Error(`Credential file error ${credentialFilePath}`);
    this.credentials = credentials;

    const tokenFilePath = resolve(googlePath, 'token.json');
    const tokens = loadFileJSON(tokenFilePath);
    this.tokens = tokens;
    return this;
  }

  public async authorizeByCode(code: string): Promise<ResultAuthorisedByCode> {
    const { res, tokens } = await this.oAuth2Client.getToken(code);
    const result = { status: 500, tokens: null };
    if (tokens) {
      const tokenFilePath = resolve(this.options?.credentialsPath, 'token.json');
      this.tokens = tokens;
      this.oAuth2Client.setCredentials(tokens);
      this.authUrl = '';
      saveFileJSON(tokenFilePath, tokens);
      result.tokens = tokens;
    }
    result.status = res?.status || 500;
    return result;
  }

  public getAuthUrl() {
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
    const { client_secret, client_id, redirect_uris } = this.credentials.installed;
    const redirectUris = isDevMode ? redirect_uris[0] : redirect_uris[1];
    this.oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUris);
    //
    if (this.tokens) {
      this.oAuth2Client.setCredentials(this.tokens);
      logging('Google autorizado');
    } else {
      this.getAuthUrl();
    }
  }

  async getContacts() {
    const peopleApi = google.people({ version: 'v1', auth: this.oAuth2Client });
    const { status, data } = await peopleApi.people.connections.list({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names,phoneNumbers',
      pageSize: 2000,
    });

    // console.log('data?.nextPageToken', data?.nextPageToken);
    // console.log('data?.totalItems', data?.totalItems, data?.connections.length);
    // console.log('data?.totalPeople', data?.totalPeople);

    return status === 200 ? data?.connections || [] : [];
  }
}
