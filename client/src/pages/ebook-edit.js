import {LogManager, inject} from 'aurelia-framework';
import {ApiClient} from 'lib/api-client';

let logger = LogManager.getLogger('ebook-edit')

@inject(ApiClient)
export class EditEbook {
  ebook;

  _languages;
  _genres;
  constructor(client) {
    this.client = client;
  }
  activate(params) {
    logger.debug(`Activated with ${JSON.stringify(params)}`)
    let promises = [];
    if (params.id !== undefined) {

    promises.push(
    this.client.getOne('ebooks', params.id)
      .then(b => {
        this.ebook=b;
        logger.debug(`Ebook data ${JSON.stringify(b)}`);
      })
      .catch(err => logger.error(`Failed to load ${err}`))
    );
    } else {
      this.ebook = {};
    }

    promises.push(
    this.client.getManyUnpagedCached('languages')
      .then( data => {
      this._languages = data;
      logger.debug(`Got languages ${JSON.stringify(this._languages)}`)
      }
      ),
    this.client.getManyUnpagedCached('genres')
      .then(data => this._genres = data)
    );




    return Promise.all(promises);
  }
}
