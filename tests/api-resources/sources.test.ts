// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import Graphor from 'graphor';

const client = new Graphor({
  apiKey: 'My API Key',
  baseURL: process.env['TEST_API_BASE_URL'] ?? 'http://127.0.0.1:4010',
});

describe('resource sources', () => {
  // Mock server tests are disabled
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

  // Mock server tests are disabled
  test.skip('list: request options and params are passed correctly', async () => {
    // ensure the request options are being passed correctly by passing an invalid HTTP method in order to cause an error
    await expect(
      client.sources.list({ file_ids: ['string'] }, { path: '/_stainless_unknown_path' }),
    ).rejects.toThrow(Graphor.NotFoundError);
  });

  // Mock server tests are disabled
  test.skip('delete', async () => {
    const responsePromise = client.sources.delete({});
    const rawResponse = await responsePromise.asResponse();
    expect(rawResponse).toBeInstanceOf(Response);
    const response = await responsePromise;
    expect(response).not.toBeInstanceOf(Response);
    const dataAndResponse = await responsePromise.withResponse();
    expect(dataAndResponse.data).toBe(response);
    expect(dataAndResponse.response).toBe(rawResponse);
  });

  // Mock server tests are disabled
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

  // Mock server tests are disabled
  test.skip('ask: required and optional params', async () => {
    const response = await client.sources.ask({
      question: 'question',
      conversation_id: 'conversation_id',
      file_ids: ['string'],
      file_names: ['string'],
      output_schema: { foo: 'bar' },
      reset: true,
      thinking_level: 'fast',
    });
  });

  // Mock server tests are disabled
  test.skip('extract: only required params', async () => {
    const responsePromise = client.sources.extract({
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

  // Mock server tests are disabled
  test.skip('extract: required and optional params', async () => {
    const response = await client.sources.extract({
      output_schema: { foo: 'bar' },
      user_instruction: 'user_instruction',
      file_ids: ['string'],
      file_names: ['string'],
      thinking_level: 'fast',
    });
  });

  // Mock server tests are disabled
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

  // Mock server tests are disabled
  test.skip('retrieveChunks: required and optional params', async () => {
    const response = await client.sources.retrieveChunks({
      query: 'query',
      file_ids: ['string'],
      file_names: ['string'],
    });
  });
});
