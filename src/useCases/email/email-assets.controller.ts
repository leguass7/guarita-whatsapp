import { NextFunction, Response } from 'express';
import { resolve } from 'path';

import { Catch } from '#/app/exceptions/catch-controller.decorator';
import { pathVolume } from '#/config';
import { fileExists } from '#/helpers/files';
import { logWarn } from '#/services/logger';

import { RequestEmailAssetsDto } from './email-assets.dto';
import { EmailSentService } from './email-sent/email-sent.service';

@Catch()
export class EmailAssetsController {
  constructor(private emailSentService: EmailSentService) {}
  async sendFile(req: RequestEmailAssetsDto, res: Response, _next: NextFunction) {
    const { imageName } = req.params;

    const [image, ext] = imageName.split('.');
    if (!image || !ext) return res.status(404).end();
    const [name, imageId] = image.split('_');

    const imgPath = resolve(pathVolume, 'assets', `${name}.${ext}`);

    if (!fileExists(imgPath)) return res.status(404).end();

    if (imageId) {
      this.emailSentService
        .increment(imageId)
        .then(updated => {
          if (!updated) logWarn(`not found email sent ${imageId}`);
        })
        .catch(() => null);
    }

    return res.sendFile(imgPath);
  }
}
