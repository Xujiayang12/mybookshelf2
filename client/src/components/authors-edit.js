import {LogManager, inject, computedFrom, bindable, bindingMode} from 'aurelia-framework';
import {ApiClient} from 'lib/api-client';
import $ from 'jquery';

let logger = LogManager.getLogger('authors-edit');

@inject(ApiClient)
export class AuthorsEdit {
  @bindable authors;
  _author;
  _authorSelected;

  constructor(client) {
    this.client=client;
  }

  get loaderAuthors() {
    return start => this.client.getIndex('authors', start);
  }

  getFullName(item) {
    return item.first_name ? item.last_name + ', ' + item.first_name : item.last_name
  }

  //@computedFrom('authors')
  get authorsVisible() {
    if (this.authors && this.authors.length) {
      return this.authors.map(this.getFullName)
    }
  }

  addAuthor() {
    let addIfNotExists = (author) => {
      for (var item of this.authors) {
        if (item.last_name === author.last_name && item.first_name === author.first_name) return;
      }
      this.authors.push(author);
      this._author = '';
    };

    if (! this.authors) this.authors = [];
    if (this._authorSelected) {
      addIfNotExists(this._authorSelected);
    } else if (this._author) {
      addIfNotExists(this.splitFullName(this._author));
    }
  }

  removeAuthor(selected) {
    if (selected !== undefined) this.authors.splice(selected,1);

  }

  splitFullName(name) {
    let parts = name.split(',').map(x => x.trim());
    let splittedName = {last_name: parts[0]}
    if (parts.length > 1) splittedName.first_name = parts.slice(1).join(' ');
    return splittedName;
  }
}