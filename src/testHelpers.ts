import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from './config.json';
const SERVER_URL = `${url}:${port}`;

// ========================================================================= //

// This is the return type of the requestHelper function
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
 * @returns { RequestResponse } - the response from the server which is an object defined by RequestResponse
 *
 * Errors will be returned in the form:
 *  { statusCode: number, error: string }
 *
 * Normal responses will be in the form
 *  { statusCode: number, jsonBody: object }
 */
function requestHelper(
  method: HttpVerb,
  path: string,
  payload: object = {}
): RequestResponse {
  let qs = {};
  let json = {};

  if (['GET', 'DELETE'].includes(method)) {
    // If the request is a GET or DELETE request, the payload is a query string
    qs = payload;
  } else {
    // If the request is a POST or PUT request, the payload is a request body
    json = payload;
  }

  // Send the request to the server
  // const res = request(method, SERVER_URL + path, { qs, json });

  const res = request(method, SERVER_URL + path, { qs, json, timeout: 20000 });

  const bodyString = res.body.toString();
  let bodyObject: RequestResponse;
  try {
    // Try to parse the server's response as JSON
    bodyObject = {
      statusCode: res.statusCode,
      jsonBody: JSON.parse(bodyString),
    };
  } catch (error) {
    // If JSON.parse fails, the server's response is not JSON so we return the response as a custom error message instead
    bodyObject = {
      statusCode: res.statusCode,
      error: `Server returned an invalid JSON response with error: ${error.message}`,
    };
  }
  return bodyObject;
}

// ========================================================================= //
// These are the wrapper functions that send HTTP requests to the server
export function authRegisterV1(email: string, password: string, nameFirst: string, nameLast: string): RequestResponse {
  return requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });
}

export function authLoginV1(email: string, password: string): RequestResponse {
  return requestHelper('POST', '/v1/admin/auth/login', { email, password });
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

export function quizListV1(token: string): RequestResponse {
  return requestHelper('GET', '/v1/admin/quiz/list', { token });
}

export function quizCreateV1(token: string, name: string, description: string): RequestResponse {
  return requestHelper('POST', '/v1/admin/quiz', { token, name, description });
}

export function quizRemoveV1(token: string, quizId: number): RequestResponse {
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

export function clearV1(): RequestResponse {
  return requestHelper('DELETE', '/v1/clear', {});
}

export function authLogoutV1(token: string): RequestResponse {
  return requestHelper('POST', '/v1/admin/auth/logout', { token });
}

export function quizTrashViewV1(token: string): RequestResponse {
  return requestHelper('GET', '/v1/admin/quiz/trash', { token });
}

export function quizRestoreV1(token: string, quizId: number): RequestResponse {
  return requestHelper('POST', `/v1/admin/quiz/${quizId}/restore`, { token });
}

export function quizTrashEmptyV1(token: string, quizIds: number[]): RequestResponse {
  return requestHelper('DELETE', '/v1/admin/quiz/trash/empty', { token, quizIds: JSON.stringify(quizIds) });
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
