// File generated from our OpenAPI spec by Stainless. See CONTRIBUTING.md for details.

import { McpOptions } from './options';

export type SdkMethod = {
  clientCallName: string;
  fullyQualifiedName: string;
  httpMethod?: 'get' | 'post' | 'put' | 'patch' | 'delete' | 'query';
  httpPath?: string;
};

export const sdkMethods: SdkMethod[] = [
  {
    clientCallName: 'client.sources.list',
    fullyQualifiedName: 'sources.list',
    httpMethod: 'get',
    httpPath: '/sources',
  },
  {
    clientCallName: 'client.sources.delete',
    fullyQualifiedName: 'sources.delete',
    httpMethod: 'delete',
    httpPath: '/sources/delete',
  },
  {
    clientCallName: 'client.sources.ask',
    fullyQualifiedName: 'sources.ask',
    httpMethod: 'post',
    httpPath: '/sources/ask-sources',
  },
  {
    clientCallName: 'client.sources.extract',
    fullyQualifiedName: 'sources.extract',
    httpMethod: 'post',
    httpPath: '/sources/run-extraction',
  },
  {
    clientCallName: 'client.sources.loadElements',
    fullyQualifiedName: 'sources.loadElements',
    httpMethod: 'post',
    httpPath: '/sources/elements',
  },
  {
    clientCallName: 'client.sources.parse',
    fullyQualifiedName: 'sources.parse',
    httpMethod: 'post',
    httpPath: '/sources/process',
  },
  {
    clientCallName: 'client.sources.retrieveChunks',
    fullyQualifiedName: 'sources.retrieveChunks',
    httpMethod: 'post',
    httpPath: '/sources/prebuilt-rag',
  },
  {
    clientCallName: 'client.sources.upload',
    fullyQualifiedName: 'sources.upload',
    httpMethod: 'post',
    httpPath: '/sources/upload',
  },
  {
    clientCallName: 'client.sources.uploadGitHub',
    fullyQualifiedName: 'sources.uploadGitHub',
    httpMethod: 'post',
    httpPath: '/sources/upload-github-source',
  },
  {
    clientCallName: 'client.sources.uploadURL',
    fullyQualifiedName: 'sources.uploadURL',
    httpMethod: 'post',
    httpPath: '/sources/upload-url-source',
  },
  {
    clientCallName: 'client.sources.uploadYoutube',
    fullyQualifiedName: 'sources.uploadYoutube',
    httpMethod: 'post',
    httpPath: '/sources/upload-youtube-source',
  },
];

function allowedMethodsForCodeTool(options: McpOptions | undefined): SdkMethod[] | undefined {
  if (!options) {
    return undefined;
  }

  let allowedMethods: SdkMethod[];

  if (options.codeAllowHttpGets || options.codeAllowedMethods) {
    // Start with nothing allowed and then add into it from options
    let allowedMethodsSet = new Set<SdkMethod>();

    if (options.codeAllowHttpGets) {
      // Add all methods that map to an HTTP GET
      sdkMethods
        .filter((method) => method.httpMethod === 'get')
        .forEach((method) => allowedMethodsSet.add(method));
    }

    if (options.codeAllowedMethods) {
      // Add all methods that match any of the allowed regexps
      const allowedRegexps = options.codeAllowedMethods.map((pattern) => {
        try {
          return new RegExp(pattern);
        } catch (e) {
          throw new Error(
            `Invalid regex pattern for allowed method: "${pattern}": ${e instanceof Error ? e.message : e}`,
          );
        }
      });

      sdkMethods
        .filter((method) => allowedRegexps.some((regexp) => regexp.test(method.fullyQualifiedName)))
        .forEach((method) => allowedMethodsSet.add(method));
    }

    allowedMethods = Array.from(allowedMethodsSet);
  } else {
    // Start with everything allowed
    allowedMethods = [...sdkMethods];
  }

  if (options.codeBlockedMethods) {
    // Filter down based on blocked regexps
    const blockedRegexps = options.codeBlockedMethods.map((pattern) => {
      try {
        return new RegExp(pattern);
      } catch (e) {
        throw new Error(
          `Invalid regex pattern for blocked method: "${pattern}": ${e instanceof Error ? e.message : e}`,
        );
      }
    });

    allowedMethods = allowedMethods.filter(
      (method) => !blockedRegexps.some((regexp) => regexp.test(method.fullyQualifiedName)),
    );
  }

  return allowedMethods;
}

export function blockedMethodsForCodeTool(options: McpOptions | undefined): SdkMethod[] | undefined {
  const allowedMethods = allowedMethodsForCodeTool(options);
  if (!allowedMethods) {
    return undefined;
  }

  const allowedSet = new Set(allowedMethods.map((method) => method.fullyQualifiedName));

  // Return any methods that are not explicitly allowed
  return sdkMethods.filter((method) => !allowedSet.has(method.fullyQualifiedName));
}
