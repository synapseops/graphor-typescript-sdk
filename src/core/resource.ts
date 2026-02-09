// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { Graphor } from '../client';

export abstract class APIResource {
  protected _client: Graphor;

  constructor(client: Graphor) {
    this._client = client;
  }
}
