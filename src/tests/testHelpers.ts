import request, { HttpVerb } from 'sync-request-curl';
import { port, url } from '../config.json';
import { EmptyObject } from '../types';

const SERVER_URL = `${url}:${port}`;

// ========================================================================= //

interface RequestResponse {
  statusCode: number;
  jsonBody?: EmptyObject;
  error?: string;
}

/**
 * Sends a HTTP request to the server and returns the response from the server
 *
 * @param { string } method - the HTTP verb to use (GET, POST, PUT, DELETE)
 * @param { string } path - the path to send the HTTP request to
 * @param { object } payload - the data to send with the request (qs for GET/DELETE, json for POST/PUT)
 * @returns { RequestResponse } - the response from the server
 *
 * On success, the response will contain a statusCode and a jsonBody:
 *  { statusCode: 200, jsonBody: { ... } }
 *
 * On failure, the response will contain a statusCode and an error message:
 * { statusCode: number, error: string }
 */
export function requestHelper(method: HttpVerb, path: string, payload: object): RequestResponse {
  let qs = {};
  let json = {};
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }

  const res = request(method, SERVER_URL + path, { qs, json, timeout: 20000 });
  if (res.statusCode !== 200) {
    return { statusCode: res.statusCode, error: res.body.toString() };
  }

  return { statusCode: res.statusCode, jsonBody: JSON.parse(res.body.toString()) };
}

// ========================================================================= //

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

export function quizRemoveV1(quizId: number, token: string): RequestResponse {
  return requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token });
}

export function quizInfoV1(quizId: number, token: string): RequestResponse {
  return requestHelper('GET', `/v1/admin/quiz/${quizId}`, { token });
}

export function quizNameUpdateV1(quizId: number, token: string, name: string): RequestResponse {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}`, { token, name });
}

export function quizDescriptionUpdateV1(quizId: number, token: string, description: string): RequestResponse {
  return requestHelper('PUT', `/v1/admin/quiz/${quizId}/description`, { token, description });
}

export function clearV1(): RequestResponse {
  return requestHelper('DELETE', '/clear', {});
}
