import { FolderScopeNotAppliedError } from 'graphor';
import { asErrorResult, ToolCallResult } from './types';

/**
 * Whether a folder value names the top level: only spaces (U+0020) and `/`,
 * the empty string included. Other blanks (a tab, a no-break space) are sent as
 * given, and the API decides.
 */
export function isTopLevelFolder(folder: string): boolean {
  return /^[ /]*$/.test(folder);
}

/** Shared wording for the tools' descriptions. */
export const FOLDER_DESCRIPTION =
  'A folder is a "/"-separated path such as "Contracts/2026"; "" is the top level. ' +
  'A folder that does not exist is created. Names stay unique in the project whatever the folder.';

export const FOLDERS_SCOPE_DESCRIPTION =
  'Restrict the scope to every source at or below each of these folders ("/"-separated paths), ' +
  'together with any file_ids. An empty list is no folder scope (the whole project when file_ids is empty too). ' +
  'A folder that holds no source refuses the call, and so does the top level ("" or "/"). ' +
  'Not together with file_names. Use list_folders to see the folders.';

/**
 * An error result when `folders` was sent but is not an array of strings (a
 * model may send one folder as a plain string); otherwise `undefined`.
 */
export function foldersInputError(args: Record<string, unknown>): ToolCallResult | undefined {
  const folders = args['folders'];
  if (folders == null) return undefined;
  if (Array.isArray(folders) && folders.every((folder) => typeof folder === 'string')) return undefined;
  return asErrorResult('folders must be an array of folder paths, such as ["Contracts"].');
}

/**
 * Runs a call that sent a folder parameter and returns the SDK's refusal to the
 * model as an error result, so a result the API did not scope is never shown.
 */
export async function withFolderCheck(call: () => Promise<ToolCallResult>): Promise<ToolCallResult> {
  try {
    return await call();
  } catch (error) {
    if (error instanceof FolderScopeNotAppliedError) {
      const repeat =
        error.conversationId ?
          ` The question was recorded in conversation ${error.conversationId}: ask again with reset: true or without conversation_id.`
        : '';
      return asErrorResult(`${error.message}${repeat}`);
    }
    throw error;
  }
}
