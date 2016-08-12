import {LogManager, inject, bindable} from 'aurelia-framework';
import {Router, activationStrategy} from 'aurelia-router';
import $ from 'jquery';
import {ApiClient} from 'lib/api-client';
import {Access} from 'lib/access';
import {Ebook} from 'models/ebook';

let logger = LogManager.getLogger('ebook-edit')

@inject(ApiClient, Router, Access)
export class EditEbook {
  ebook;
  originalEbook;
  _languages;
  _genres;
  @bindable _series;
  _seriesSelected;

  constructor(client, router, access) {
    this.client = client;
    this.router = router;
    this.access = access;
  }

/*
 * It does not help with pagination back problem

  determineActivationStrategy(){
    return activationStrategy.replace;
    //return activationStrategy.invokeLifecycle;
  }
*/

  canActivate(params) {
    if (params.id !== undefined) {
    return this.client.getOne('ebooks', params.id)
      .then(b => {
        this.ebook=new Ebook(b);
        this._series = b.series ? b.series.title : undefined;
        logger.debug(`Ebook data ${JSON.stringify(b)}`);
        return this.access.canEdit(b.id);
      })
      .catch(err => { logger.error(`Failed to load ${err}`);
                      return false;})

    } else {
      this.ebook = new Ebook();
      this._series = undefined;
      return true;
    }

  }
  activate(params) {
    logger.debug(`Activated with ${JSON.stringify(params)}`)
    let promises = [];

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

  _seriesChanged() {
    logger.debug(`Series is ${this._series} selected ${JSON.stringify(this._seriesSelected)}`);
    if (this._seriesSelected) this.ebook.series = this._seriesSelected
    else this.ebook.series = {title: this._series};
  }

  save() {
    //logger.debug(`Saving ${JSON.stringify(this.ebook)}`);
    if (this.validate()) {
      let data = this.ebook.prepareData();
    } else {
      logger.debug(`Validation fails`)
    }
  }

  validate() {
    $('.has-error').removeClass('has-error');
    $('.help-block').remove();
    let errors = [];

    let addError = function (what,err) {
      errors.push(err);
      let grp=$(`#${what}-input-group`);
      grp.addClass('has-error');
      $('<span>').addClass('help-block').text(err).appendTo(grp);

    }
    this.ebook.validate(addError);
    return errors.length === 0
  }

  cancel() {
    if (this.ebook.id) {
      this.router.navigateToRoute('ebook', {id:this.ebook.id});
    } else {
      this.router.navigate('welcome')
    }
  }

  get seriesLoader() {
    return start => this.client.getIndex('series', start);
  }
}
