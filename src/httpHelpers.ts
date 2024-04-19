import request, { HttpVerb } from 'sync-request';
const DEPLOYED_URL = 'https://1531-24t1-h17a-dream.vercel.app';
const TIMEOUT_MS = 2000;

interface RequestResponse {
  statusCode: number;
  jsonBody?: Record<string, any>;
  error?: string;
}

/**
 * Sends a given request to the given route and return its results as a RequestResponse object
 *
 * @param { string } method     - the type of HTTP request (GET, DELETE, POST, PUT)
 * @param { string } path       - the route of the request on the server
 * @param { object } payload    - the data to send with the request (either a query string or a request body)
 * @param { object } headers    - the headers to send with the request (only used for requests that require authentication)
 * @returns { RequestResponse } - the response from the server which is an object defined by RequestResponse
 *
 * Errors will be returned in the form:
 *  { statusCode: number, error: string }
 *
 * Normal responses will be in the form
 *  { statusCode: number, jsonBody: object }
 */
export function requestHelper(method: HttpVerb, path: string, payload: object, headers?: { token: string }): RequestResponse {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }

  const res = request(method, DEPLOYED_URL + path, { qs, json, timeout: TIMEOUT_MS, headers: headers });
  const bodyString = res.body as string;

  let responseBody;
  let error: string | undefined;
  try {
    responseBody = JSON.parse(bodyString);
  } catch (e) {
    error = `Server returned an invalid JSON response with error: ${e.message}`;
  }

  if ([400, 401, 403, 404, 500].includes(res.statusCode)) {
    error = responseBody.error;
  } else if (res.statusCode !== 200) {
    error = `Server returned an unexpected status code: ${res.statusCode}`;
  }

  if (error) {
    return { statusCode: res.statusCode, error: error };
  } else {
    return { statusCode: res.statusCode, jsonBody: responseBody };
  }
}
/***********************************************************************
* Iteration 2 (Using Iteration 1)
***********************************************************************/
export function clearV1(): RequestResponse {
  return requestHelper('DELETE', '/v1/clear', {});
}

export function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string): RequestResponse {
  return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
}

export function authLoginV1(email: string, password: string): RequestResponse {
  return requestHelper('POST', '/v1/admin/auth/login', { email, password });
}

export function authLogoutV1(token: string): RequestResponse {
  return requestHelper('POST', '/v1/admin/auth/logout', { token });
}

export function userDetailsV1(token: string): RequestResponse {
  return requestHelper('GET', '/v1/admin/user/details', { token });
}

export function userDetailsUpdateV1(token: string, email: string, nameFirst: string, nameLast: string): RequestResponse {
  return requestHelper('PUT', '/v1/admin/user/details', { token, email, nameFirst, nameLast });
}

export function userPasswordUpdateV1(token: string, oldPassword: string, newPassword: string): RequestResponse {
  return requestHelper('PUT', '/v1/admin/user/password', { token, oldPassword, newPassword });
}

export function quizCreateV1(token: string, name: string, description: string): RequestResponse {
  return requestHelper('POST', '/v1/admin/quiz', { token, name, description });
}

export function quizListV1(token: string): RequestResponse {
  return requestHelper('GET', '/v1/admin/quiz/list', { token });
}

export function quizTrashViewV1(token: string): RequestResponse {
  return requestHelper('GET', '/v1/admin/quiz/trash', { token });
}

export function quizTrashEmptyV1(token: string, quizIds: number[]): RequestResponse {
  return requestHelper('DELETE', '/v1/admin/quiz/trash/empty', { token, quizIds: JSON.stringify(quizIds) });
}

export function quizTrashV1(token: string, quizId: number): RequestResponse {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token });
}

export function quizInfoV1(token: string, quizId: number): RequestResponse {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}`, { token });
}

export function quizNameUpdateV1(token: string, quizId: number, name: string): RequestResponse {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/name`, { token, name });
}

export function quizDescriptionUpdateV1(token: string, quizId: number, description: string): RequestResponse {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/description`, { token, description });
}

export function quizRestoreV1(token: string, quizId: number): RequestResponse {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/restore`, { token });
}

export function quizTransferV1(token: string, quizId: number, userEmail: string): RequestResponse {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/transfer`, { token, userEmail });
}

export function quizQuestionCreateV1(token: string, quizId: number, questionBody: object): RequestResponse {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/question`, { token, questionBody });
}

export function quizQuestionUpdateV1(token: string, quizId: number, questionId: number, questionBody: object): RequestResponse {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token, questionBody });
}

export function quizQuestionRemoveV1(token: string, quizId: number, questionId: number): RequestResponse {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token });
}

export function quizQuestionMoveV1(token: string, quizId: number, questionId: number, newPosition: number): RequestResponse {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}/move`, { token, newPosition });
}

export function quizQuestionDuplicateV1(token: string, quizId: number, questionId: number): RequestResponse {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, { token });
}

/***********************************************************************
* Iteration 3 (MODIFIED)
***********************************************************************/

export function authLogoutV2(token: string): RequestResponse {
  return requestHelper('POST', '/v2/admin/auth/logout', {}, { token });
}

export function userDetailsV2(token: string): RequestResponse {
  return requestHelper('GET', '/v2/admin/user/details', {}, { token });
}

export function userDetailsUpdateV2(token: string, email: string, nameFirst: string, nameLast: string): RequestResponse {
  return requestHelper('PUT', '/v2/admin/user/details', { email, nameFirst, nameLast }, { token });
}

export function userPasswordUpdateV2(token: string, oldPassword: string, newPassword: string): RequestResponse {
  return requestHelper('PUT', '/v2/admin/user/password', { oldPassword, newPassword }, { token });
}

export function quizCreateV2(token: string, name: string, description: string): RequestResponse {
  return requestHelper('POST', '/v2/admin/quiz', { name, description }, { token });
}

export function quizListV2(token: string): RequestResponse {
  return requestHelper('GET', '/v2/admin/quiz/list', {}, { token });
}

export function quizTrashViewV2(token: string): RequestResponse {
  return requestHelper('GET', '/v2/admin/quiz/trash', {}, { token });
}

export function quizTrashEmptyV2(token: string, quizIds: number[]): RequestResponse {
  return requestHelper('DELETE', '/v2/admin/quiz/trash/empty', { quizIds: JSON.stringify(quizIds) }, { token });
}

export function quizTrashV2(token: string, quizId: number): RequestResponse {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizId}`, {}, { token });
}

export function quizInfoV2(token: string, quizId: number): RequestResponse {
  return requestHelper('GET', `/v2/admin/quiz/${quizId}`, {}, { token });
}

export function quizNameUpdateV2(token: string, quizId: number, name: string): RequestResponse {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/name`, { name }, { token });
}

export function quizDescriptionUpdateV2(token: string, quizId: number, description: string): RequestResponse {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/description`, { description }, { token });
}

export function quizRestoreV2(token: string, quizId: number): RequestResponse {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/restore`, {}, { token });
}

export function quizTransferV2(token: string, quizId: number, userEmail: string): RequestResponse {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/transfer`, { userEmail }, { token });
}

export function quizQuestionCreateV2(token: string, quizId: number, questionBody: object): RequestResponse {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question`, { questionBody }, { token });
}

export function quizQuestionUpdateV2(token: string, quizId: number, questionId: number, questionBody: object): RequestResponse {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/question/${questionId}`, { questionBody }, { token });
}

export function quizQuestionRemoveV2(token: string, quizId: number, questionId: number): RequestResponse {
  return requestHelper('DELETE', `/v2/admin/quiz/${quizId}/question/${questionId}`, {}, { token });
}

export function quizQuestionMoveV2(token: string, quizId: number, questionId: number, newPosition: number): RequestResponse {
  return requestHelper('PUT', `/v2/admin/quiz/${quizId}/question/${questionId}/move`, { newPosition }, { token });
}

export function quizQuestionDuplicateV2(token: string, quizId: number, questionId: number): RequestResponse {
  return requestHelper('POST', `/v2/admin/quiz/${quizId}/question/${questionId}/duplicate`, {}, { token });
}
/***********************************************************************
* Iteration 3 (NEW)
***********************************************************************/
export function quizThumbnailUpdateV1(token: string, quizId: number, imgUrl: string): RequestResponse {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/thumbnail`, { imgUrl }, { token });
}

export function quizSessionListV1(token: string, quizId: number): RequestResponse {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/sessions`, {}, { token });
}

export function quizSessionStartV1(token: string, quizId: number, autoStartNum: number): RequestResponse {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/session/start`, { autoStartNum }, { token });
}

export function quizSessionUpdateV1(token: string, quizId: number, sessionId: number, action: string): RequestResponse {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/session/${sessionId}`, { action }, { token });
}

export function quizSessionStatusV1(token: string, quizId: number, sessionId: number): RequestResponse {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/session/${sessionId}`, {}, { token });
}

export function quizSessionResultsV1(token: string, quizId: number, sessionId: number): RequestResponse {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/session/${sessionId}/results`, {}, { token });
}

export function quizSessionCSVResultsV1(token: string, quizId: number, sessionId: number): RequestResponse {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}/session/${sessionId}/results/csv`, {}, { token });
}

export function playerJoinV1(sessionId: number, name: string): RequestResponse {
  return requestHelper('POST', '/v1/player/join', { sessionId, name });
}

export function playerStatusV1(playerId: number): RequestResponse {
  return requestHelper('GET', `/v1/player/${playerId}`, {});
}

export function playerQuestionInfoV1(playerId: number, questionPosition: number): RequestResponse {
  return requestHelper('GET', `/v1/player/${playerId}/question/${questionPosition}`, {});
}

export function playerQuestionAnswerV1(playerId: number, questionPosition: number, answerIds: number[]): RequestResponse {
  return requestHelper('PUT', `/v1/player/${playerId}/question/${questionPosition}/answer`, { answerIds });
}

export function playerQuestionResultsV1(playerId: number, questionPosition: number): RequestResponse {
  return requestHelper('GET', `/v1/player/${playerId}/question/${questionPosition}/results`, {});
}

export function playerFinalResultsV1(playerId: number): RequestResponse {
  return requestHelper('GET', `/v1/player/${playerId}/results`, {});
}

export function playerChatListV1(playerId: number): RequestResponse {
  return requestHelper('GET', `/v1/player/${playerId}/chat`, {});
}

export function playerChatSendV1(playerId: number, message: object): RequestResponse {
  return requestHelper('POST', `/v1/player/${playerId}/chat`, { message });
}
