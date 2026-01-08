// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Graphor, { toFile } from 'graphor';

const client = new Graphor({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource sources', () => {
  // Prism tests are disabled
  test.skip('list', async () => {
    const responsePromise = client.sources.list();
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('delete: only required params', async () => {
    const responsePromise = client.sources.delete({ file_name: 'file_name' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('delete: required and optional params', async () => {
    const response = await client.sources.delete({ file_name: 'file_name' });
  });

  // Prism tests are disabled
  test.skip('ask: only required params', async () => {
    const responsePromise = client.sources.ask({ question: 'question' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('ask: required and optional params', async () => {
    const response = await client.sources.ask({
      question: 'question',
      conversation_id: 'conversation_id',
      file_names: ['string'],
      output_schema: { foo: 'bar' },
      reset: true,
    });
  });

  // Prism tests are disabled
  test.skip('extract: only required params', async () => {
    const responsePromise = client.sources.extract({
      file_names: ['string'],
      output_schema: { foo: 'bar' },
      user_instruction: 'user_instruction',
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('extract: required and optional params', async () => {
    const response = await client.sources.extract({
      file_names: ['string'],
      output_schema: { foo: 'bar' },
      user_instruction: 'user_instruction',
    });
  });

  // Prism tests are disabled
  test.skip('loadElements: only required params', async () => {
    const responsePromise = client.sources.loadElements({ file_name: 'file_name' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('loadElements: required and optional params', async () => {
    const response = await client.sources.loadElements({
      file_name: 'file_name',
      filter: {
        elementsToRemove: ['string'],
        page_numbers: [0],
        type: 'type',
      },
      page: 0,
      page_size: 0,
    });
  });

  // Prism tests are disabled
  test.skip('parse: only required params', async () => {
    const responsePromise = client.sources.parse({ file_name: 'file_name' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('parse: required and optional params', async () => {
    const response = await client.sources.parse({ file_name: 'file_name', partition_method: 'basic' });
  });

  // Prism tests are disabled
  test.skip('retrieveChunks: only required params', async () => {
    const responsePromise = client.sources.retrieveChunks({ query: 'query' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('retrieveChunks: required and optional params', async () => {
    const response = await client.sources.retrieveChunks({ query: 'query', file_names: ['string'] });
  });

  // Prism tests are disabled
  test.skip('upload: only required params', async () => {
    const responsePromise = client.sources.upload({
      file: await toFile(Buffer.from('# my file contents'), 'README.md'),
    });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('upload: required and optional params', async () => {
    const response = await client.sources.upload({
      file: await toFile(Buffer.from('# my file contents'), 'README.md'),
    });
  });

  // Prism tests are disabled
  test.skip('uploadGitHub: only required params', async () => {
    const responsePromise = client.sources.uploadGitHub({ url: 'url' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('uploadGitHub: required and optional params', async () => {
    const response = await client.sources.uploadGitHub({ url: 'url' });
  });

  // Prism tests are disabled
  test.skip('uploadURL: only required params', async () => {
    const responsePromise = client.sources.uploadURL({ url: 'url' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('uploadURL: required and optional params', async () => {
    const response = await client.sources.uploadURL({ url: 'url', crawlUrls: true });
  });

  // Prism tests are disabled
  test.skip('uploadYoutube: only required params', async () => {
    const responsePromise = client.sources.uploadYoutube({ url: 'url' });
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Prism tests are disabled
  test.skip('uploadYoutube: required and optional params', async () => {
    const response = await client.sources.uploadYoutube({ url: 'url' });
  });
});
