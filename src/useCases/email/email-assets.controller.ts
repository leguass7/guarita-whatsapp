import { NextFunction, Response } from 'express';
import { resolve } from 'path';

import { Catch } from '#/app/exceptions/catch-controller.decorator';
import { pathVolume } from '#/config';
import { fileExists } from '#/helpers/files';
import { logWarn } from '#/services/logger';

import { RequestEmailAssetsDto } from './email-assets.dto';
import { parseImageNameDto } from './email-assets.util';
import { EmailSentService } from './email-sent/email-sent.service';

@Catch()
export class EmailAssetsController {
  constructor(private emailSentService: EmailSentService) {}

  async sendFile(req: RequestEmailAssetsDto, res: Response, _next: NextFunction) {
    const { imageName } = req.params;

    const parse = parseImageNameDto(imageName);
    if (!parse) return res.status(404).end();

    const imgPath = resolve(pathVolume, 'assets', `${parse.name}.${parse.ext}`);

    if (!fileExists(imgPath)) return res.status(404).end();

    if (parse.imageId) {
      this.emailSentService
        .increment(parse.imageId)
        .then(updated => {
          if (!updated) logWarn(`not found email sent ${parse.imageId}`);
        })
        .catch(() => null);
    }

    return res.sendFile(imgPath);
  }
}
