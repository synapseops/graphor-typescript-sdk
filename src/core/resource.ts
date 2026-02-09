// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import type { GraphorTypescriptProject } from '../client';

export abstract class APIResource {
  protected _client: GraphorTypescriptProject;

  constructor(client: GraphorTypescriptProject) {
    this._client = client;
  }
}
