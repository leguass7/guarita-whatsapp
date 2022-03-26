import { create, ExpressHandlebars } from 'express-handlebars';
import { join, resolve } from 'path';

import { fileExists } from '#/helpers/files';

import { LogClass } from '../logger/log-decorator';
import { templateLayoutOptions } from './constants';

@LogClass
export class HbsService {
  private HBS: ExpressHandlebars;
  private extname: string;

  constructor(private viewPath: string) {
    this.extname = '.hbs';
    this.HBS = this.createHbs();
    if (!this.checkTemplate()) {
      throw new Error(`Template não encontrado 'default'`);
    }
  }

  checkTemplate(template = 'default') {
    const checkFile = resolve(this.viewPath, `${template}${this.extname}`);
    if (!fileExists(checkFile)) {
      // console.log('checkFile', checkFile);
      return false;
    }
    return true;
  }

  createHbs(): ExpressHandlebars {
    const viewPath = join(this.viewPath);
    const result = create({
      layoutsDir: join(viewPath, 'layouts'),
      partialsDir: join(viewPath, 'partials'),
      defaultLayout: 'default',
      extname: this.extname,
    });
    return result;
  }

  async buildHtml(data: any, template = 'default') {
    const checked = this.checkTemplate(template) ? template : 'default';
    const templatePath = resolve(this.viewPath, `${checked}${this.extname}`);
    const html = await this.HBS.renderView(templatePath, { ...data, template: templateLayoutOptions });
    return html;
  }
}
