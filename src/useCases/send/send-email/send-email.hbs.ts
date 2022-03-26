import { emailTemplatePath } from '#/config';
import { HbsService } from '#/services/HbsService';

export interface TemplateTrackers {
  imageLogoURL: string;
  imageVendorURL: string;
  trackImageURL: string;
}

export interface ContingencyContext extends TemplateTrackers {
  text: string;
  date: string;
}

export class SendEmailHbs {
  private hbsService: HbsService;

  constructor() {
    this.hbsService = new HbsService(emailTemplatePath);
  }

  async templateContigency(payload: ContingencyContext): Promise<string> {
    const html = await this.hbsService.buildHtml(payload, 'contingency');
    return html;
  }
}
