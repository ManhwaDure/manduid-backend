import ejs from 'ejs';
import { promises as fs } from 'fs';
import { join } from 'path';

const templateRoot = join(
  __dirname,
  '..',
  '..',
  '..',
  'emailTemplates'
);
const textTemplatePath = join(templateRoot, 'text');
const htmlTemplatePath = join(templateRoot, 'html');

export class EmailTemplateRenderer {
  #textTemplates: {
    [key: string]: ejs.TemplateFunction;
  } = {};
  #htmlTemplates: {
    [key: string]: ejs.TemplateFunction;
  } = {};

  public async renderText(
    name: string,
    data: any
  ): Promise<string> {
    if (typeof this.#textTemplates[name] === 'undefined') {
      this.#textTemplates[name] = ejs.compile(
        await fs.readFile(
          join(textTemplatePath, name + '.ejs'),
          { encoding: 'utf8' }
        )
      );
    }

    return this.#textTemplates[name](data);
  }
  public async renderHtml(
    name: string,
    data: any
  ): Promise<string> {
    if (typeof this.#htmlTemplates[name] === 'undefined') {
      this.#htmlTemplates[name] = ejs.compile(
        await fs.readFile(
          join(htmlTemplatePath, name + '.ejs'),
          { encoding: 'utf8' }
        )
      );
    }

    return this.#htmlTemplates[name](data);
  }

  public async renderTextAndHtml(
    name: string,
    data: any
  ): Promise<{ text: string; html: string }> {
    return {
      text: await this.renderText(name, data),
      html: await this.renderHtml(name, data),
    };
  }
}
