// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { GraphorPrd } from '../client';

export abstract class APIResource {
  protected _client: GraphorPrd;

  constructor(client: GraphorPrd) {
    this._client = client;
  }
}
