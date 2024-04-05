import {
  clearV1,
  authRegisterV1,
  authLogoutV1,
  quizListV1,
  quizCreateV1,
  quizInfoV1,
  quizNameUpdateV1,
  quizDescriptionUpdateV1,
  quizTrashV1,
  quizTrashViewV1,
  quizRestoreV1,
  quizTrashEmptyV1,
} from '../testHelpers';

import {
  BAD_REQUEST_ERROR,
  UNAUTHORISED_ERROR,
  FORBIDDEN_ERROR,
  USER1,
  USER2,
  QUIZ1,
  QUIZ2,
  QUIZ3,
} from '../testTypes';

import { AdminQuizListReturn, AdminQuizInfoReturn } from '../functionTypes';

beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

describe('Testing DELETE /v1/admin/quiz/{quizid}', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token;
    const quiz = quizCreateV1(token, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId = quiz.quizId as number;
  });

  test('Correct status code and return value', () => {
    const response = quizTrashV1(token, quizId);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  test('Successful removal of one quiz', () => {
    quizTrashV1(token, quizId);
    const response = quizListV1(token).jsonBody;
    expect(response).toStrictEqual({ quizzes: [] });
  });

  test('Successful removal of one quiz and creation of same quiz', () => {
    quizTrashV1(token, quizId);
    quizCreateV1(token, QUIZ1.name, QUIZ1.description);
    const response = quizListV1(token).jsonBody;
    expect(response).toStrictEqual({ quizzes: [{ quizId: expect.any(Number), name: QUIZ1.name }] });
  });

  test('timeLastEdited is updated and is within a 1 second range of the current time', () => {
    const expectedTime = Math.floor(Date.now() / 1000);
    quizTrashV1(token, quizId);
    const timeLastEdited = quizInfoV1(token, quizId).jsonBody.timeLastEdited as number;
    expect(timeLastEdited).toBeGreaterThanOrEqual(expectedTime);
    expect(timeLastEdited).toBeLessThanOrEqual(expectedTime + 1);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizTrashV1('', quizId)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizTrashV1(token + 'random', quizId)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizTrashV1(token, quizId)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizTrashV1(token, quizId + 1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizTrashV1(token2, quizId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const emptyToken = '';
    let notOwnerToken: string;
    beforeEach(() => {
      const invalidUser = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      notOwnerToken = invalidUser.token as string;
    });

    test('Unauthorised status code 401 first', () => {
      const response1 = quizTrashV1(invalidToken, quizId);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
      const response2 = quizTrashV1(emptyToken, quizId);
      expect(response2).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizTrashV1(notOwnerToken, quizId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });
});

describe('Testing GET /v1/admin/quiz/trash', () => {
  let token: string;
  let quizId1: number;
  let quizId2: number;
  let quizId3: number;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token as string;
    const q1 = quizCreateV1(token, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId1 = q1.quizId as number;
    const q2 = quizCreateV1(token, QUIZ2.name, QUIZ2.description).jsonBody;
    quizId2 = q2.quizId as number;
    const q3 = quizCreateV1(token, QUIZ3.name, QUIZ3.description).jsonBody;
    quizId3 = q3.quizId as number;
  });

  test('Correct status code and return value', () => {
    const response = quizTrashViewV1(token);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({ quizzes: expect.any(Array) });
  });

  test('Successful retrieval when user has no quizzes', () => {
    const response = quizTrashViewV1(token).jsonBody;
    const expected = { quizzes: [] } as { quizzes: { quizId: number, name: string }[] };
    expect(response).toStrictEqual(expected);
  });

  test('Successful retrieval when user has three quizzes, one in the trash', () => {
    quizTrashV1(token, quizId1);
    quizTrashV1(token, quizId2);
    const response = quizTrashViewV1(token).jsonBody as { quizzes: { quizId: number, name: string }[] };
    const expected = { quizzes: [{ quizId: quizId1, name: QUIZ1.name }, { quizId: quizId2, name: QUIZ2.name }] };
    expect(response).toStrictEqual(expected);
  });

  test('Successful retrieval when user has three quizzes, two in the trash', () => {
    quizTrashV1(token, quizId1);
    const response = quizTrashViewV1(token).jsonBody;
    const expected = { quizzes: [{ quizId: quizId1, name: QUIZ1.name }] };
    expect(response).toStrictEqual(expected);
  });

  test('Successful retrieval when user has three quizzes, all in the trash', () => {
    quizTrashV1(token, quizId1);
    quizTrashV1(token, quizId2);
    quizTrashV1(token, quizId3);
    const response = quizTrashViewV1(token).jsonBody;
    const expected = { quizzes: [{ quizId: quizId1, name: QUIZ1.name }, { quizId: quizId2, name: QUIZ2.name }, { quizId: quizId3, name: QUIZ3.name }] };
    expect(response).toStrictEqual(expected);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizTrashViewV1('')).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizTrashViewV1(token + 'random')).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizTrashViewV1(token)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });
});

describe('Testing POST /v1/admin/quiz/{quizid}/restore', () => {
  let tokenUser1: string;
  let tokenUser2: string;
  let quizId1: number;
  let quizId2: number;

  beforeEach(() => {
    const ret1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    tokenUser1 = ret1.token as string;

    const ret2 = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
    tokenUser2 = ret2.token as string;

    const q1 = quizCreateV1(tokenUser1, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId1 = q1.quizId as number;

    const q2 = quizCreateV1(tokenUser1, QUIZ2.name, QUIZ2.description).jsonBody;
    quizId2 = q2.quizId as number;

    quizTrashV1(tokenUser1, quizId1);
  });

  test('Correct status code and return value', () => {
    const response = quizRestoreV1(tokenUser1, quizId1);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  test('Successfully restore one quiz from the trash', () => {
    quizRestoreV1(tokenUser1, quizId1);
    expect(quizTrashViewV1(tokenUser1).jsonBody).toStrictEqual({ quizzes: [] });
    expect(quizListV1(tokenUser1).jsonBody).toStrictEqual({ quizzes: [{ quizId: quizId1, name: QUIZ1.name }, { quizId: quizId2, name: QUIZ2.name }] });
  });

  test('Successfully restore all quizzes from the trash', () => {
    quizTrashV1(tokenUser1, quizId2);
    quizRestoreV1(tokenUser1, quizId1);
    quizRestoreV1(tokenUser1, quizId2);
    expect(quizTrashViewV1(tokenUser1).jsonBody).toStrictEqual({ quizzes: [] });
    expect(quizListV1(tokenUser1).jsonBody).toStrictEqual({ quizzes: [{ quizId: quizId1, name: QUIZ1.name }, { quizId: quizId2, name: QUIZ2.name }] });
  });

  test('timeLastEdited is updated and is within a 1 second range of the current time', () => {
    const response1 = quizRestoreV1(tokenUser1, quizId1).jsonBody;
    expect(response1).toStrictEqual({});
    const expectedTime = Math.floor(Date.now() / 1000);
    const response2 = quizInfoV1(tokenUser1, quizId1).jsonBody;
    const timeLastEdited = response2.timeLastEdited as number;
    expect(timeLastEdited).toBeGreaterThanOrEqual(expectedTime);
    expect(timeLastEdited).toBeLessThanOrEqual(expectedTime + 1);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizRestoreV1('', quizId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizRestoreV1(tokenUser1 + 'random', quizId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(tokenUser1);
      expect(quizRestoreV1(tokenUser1, quizId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizRestoreV1(tokenUser1, -1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const response = quizRestoreV1(tokenUser2, quizId1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('Quiz is not in the trash', () => {
      quizRestoreV1(tokenUser1, quizId2);
      const response = quizRestoreV1(tokenUser1, quizId2);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Quiz name of the restored quiz is already used by another active quiz', () => {
      quizCreateV1(tokenUser1, QUIZ1.name, QUIZ1.description);
      const response = quizRestoreV1(tokenUser1, quizId1);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = tokenUser1 + 'random';
    const invalidQuizId = -1;

    test('Unauthorised status code 401 first', () => {
      const response1 = quizRestoreV1(invalidToken, invalidQuizId);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizRestoreV1(tokenUser2, invalidQuizId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      const response = quizRestoreV1(tokenUser1, quizId2);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing POST /v1/admin/quiz/trash/empty', () => {
  let tokenUser1: string;
  let quizId1: number;
  let quizId2: number;
  let quizId3: number;

  beforeEach(() => {
    const ret1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    tokenUser1 = ret1.token as string;

    const q1 = quizCreateV1(tokenUser1, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId1 = q1.quizId as number;
    quizTrashV1(tokenUser1, quizId1);

    const q2 = quizCreateV1(tokenUser1, QUIZ2.name, QUIZ2.description).jsonBody;
    quizId2 = q2.quizId as number;
    quizTrashV1(tokenUser1, quizId2);

    const q3 = quizCreateV1(tokenUser1, QUIZ3.name, QUIZ3.description).jsonBody;
    quizId3 = q3.quizId as number;
    quizTrashV1(tokenUser1, quizId3);
  });

  test('Correct status code and return value', () => {
    const response = quizTrashEmptyV1(tokenUser1, [quizId1]);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  describe('Permanently delete specific quizzes currently sitting in the trash', () => {
    test('Permanently delete one quiz', () => {
      quizTrashEmptyV1(tokenUser1, [quizId1]);
      expect(quizTrashViewV1(tokenUser1).jsonBody).toStrictEqual({ quizzes: [{ quizId: quizId2, name: QUIZ2.name }, { quizId: quizId3, name: QUIZ3.name }] });
    });

    test('Permanently delete two quizzes', () => {
      quizTrashEmptyV1(tokenUser1, [quizId1, quizId2]);
      expect(quizTrashViewV1(tokenUser1).jsonBody).toStrictEqual({ quizzes: [{ quizId: quizId3, name: QUIZ3.name }] });
    });

    test('Permanently delete all quizzes', () => {
      quizTrashEmptyV1(tokenUser1, [quizId1, quizId2, quizId3]);
      expect(quizTrashViewV1(tokenUser1).jsonBody).toStrictEqual({ quizzes: [] });
    });
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      const response = quizTrashEmptyV1('', [quizId1]);
      expect(response).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      const response = quizTrashEmptyV1(tokenUser1 + 'random', [quizId1]);
      expect(response).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(tokenUser1);
      const response = quizTrashEmptyV1(tokenUser1, [quizId1]);
      expect(response).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizTrashEmptyV1(tokenUser1, [-1]);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const ret2 = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      const tokenUser2 = ret2.token as string;
      const response = quizTrashEmptyV1(tokenUser2, [quizId1]);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('One quiz is not in the trash', () => {
      quizRestoreV1(tokenUser1, quizId1);
      const response = quizTrashEmptyV1(tokenUser1, [quizId1, quizId2, quizId3]);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Two quizzes are not in the trash', () => {
      quizRestoreV1(tokenUser1, quizId1);
      quizRestoreV1(tokenUser1, quizId2);
      const response = quizTrashEmptyV1(tokenUser1, [quizId1, quizId2, quizId3]);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('All quizzes are not in the trash', () => {
      quizRestoreV1(tokenUser1, quizId1);
      quizRestoreV1(tokenUser1, quizId2);
      quizRestoreV1(tokenUser1, quizId3);
      const response = quizTrashEmptyV1(tokenUser1, [quizId1, quizId2, quizId3]);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = tokenUser1 + 'random';
    const invalidQuizId = -1;

    test('Unauthorised status code 401 first', () => {
      const response1 = quizTrashEmptyV1(invalidToken, [invalidQuizId]);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizTrashEmptyV1(tokenUser1, [invalidQuizId]);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      quizRestoreV1(tokenUser1, quizId1);
      const response = quizTrashEmptyV1(tokenUser1, [quizId1, quizId2, quizId3]);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing POST /v1/admin/quiz', () => {
  let token: string;
  let quizId1: number;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token as string;
    const q1 = quizCreateV1(token, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId1 = q1.quizId as number;
  });

  test('Successful quiz creation of a quiz currently in the trash', () => {
    quizTrashV1(token, quizId1);
    const response = quizCreateV1(token, QUIZ1.name, QUIZ1.description);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody.quizId).not.toStrictEqual(quizId1);
  });

  test('Successful quiz creation of a quiz that was permanently deleted from the trash', () => {
    quizTrashV1(token, quizId1);
    quizTrashEmptyV1(token, [quizId1]);
    const response = quizCreateV1(token, QUIZ1.name, QUIZ1.description);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody.quizId).not.toStrictEqual(quizId1);
  });

  test('Unsuccessful quiz creation of a quiz restored from the trash', () => {
    quizTrashV1(token, quizId1);
    quizRestoreV1(token, quizId1);
    const response = quizCreateV1(token, QUIZ1.name, QUIZ1.description);
    expect(response).toStrictEqual(BAD_REQUEST_ERROR);
  });
});

describe('Testing GET /v1/admin/quiz/list', () => {
  let token: string;
  let quizId1: number;
  let quizId2: number;
  let quizId3: number;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token as string;
    const q1 = quizCreateV1(token, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId1 = q1.quizId as number;
    const q2 = quizCreateV1(token, QUIZ2.name, QUIZ2.description).jsonBody;
    quizId2 = q2.quizId as number;
    const q3 = quizCreateV1(token, QUIZ3.name, QUIZ3.description).jsonBody;
    quizId3 = q3.quizId as number;
  });

  test('Moving one quiz to the trash', () => {
    quizTrashV1(token, quizId1);
    const response = quizListV1(token).jsonBody;
    const expected: AdminQuizListReturn = { quizzes: [{ quizId: quizId2, name: QUIZ2.name }, { quizId: quizId3, name: QUIZ3.name }] };
    expect(response).toStrictEqual(expected);
  });

  test('Moving all quizzes to the trash', () => {
    quizTrashV1(token, quizId1);
    quizTrashV1(token, quizId2);
    quizTrashV1(token, quizId3);
    const response = quizListV1(token).jsonBody;
    const expected: AdminQuizListReturn = { quizzes: [] };
    expect(response).toStrictEqual(expected);
  });

  test('Moving all quizzes to the trash and restoring one quiz', () => {
    quizTrashV1(token, quizId1);
    quizTrashV1(token, quizId2);
    quizTrashV1(token, quizId3);
    quizRestoreV1(token, quizId1);
    const response = quizListV1(token).jsonBody;
    const expected: AdminQuizListReturn = { quizzes: [{ quizId: quizId1, name: QUIZ1.name }] };
    expect(response).toStrictEqual(expected);
  });

  test('Moving all quizzes to the trash and restoring all quizzes', () => {
    const before = quizListV1(token).jsonBody;
    quizTrashV1(token, quizId1);
    quizTrashV1(token, quizId2);
    quizTrashV1(token, quizId3);
    quizRestoreV1(token, quizId1);
    quizRestoreV1(token, quizId2);
    quizRestoreV1(token, quizId3);
    const after = quizListV1(token).jsonBody;
    expect(after).toStrictEqual(before);
  });

  test('Permanently deleting one quiz', () => {
    quizTrashV1(token, quizId1);
    quizTrashEmptyV1(token, [quizId1]);
    const response = quizListV1(token).jsonBody;
    const expected: AdminQuizListReturn = { quizzes: [{ quizId: quizId2, name: QUIZ2.name }, { quizId: quizId3, name: QUIZ3.name }] };
    expect(response).toStrictEqual(expected);
  });

  test('Permanently deleting all quizzes', () => {
    quizTrashV1(token, quizId1);
    quizTrashV1(token, quizId2);
    quizTrashV1(token, quizId3);
    quizTrashEmptyV1(token, [quizId1, quizId2, quizId3]);
    const response = quizListV1(token).jsonBody;
    const expected: AdminQuizListReturn = { quizzes: [] };
    expect(response).toStrictEqual(expected);
  });

  test('Permanently deleting all quizzes and creating a new quiz', () => {
    quizTrashV1(token, quizId1);
    quizTrashV1(token, quizId2);
    quizTrashV1(token, quizId3);
    quizTrashEmptyV1(token, [quizId1, quizId2, quizId3]);
    quizCreateV1(token, QUIZ1.name, QUIZ1.description);
    const response = quizListV1(token).jsonBody;
    const expected: AdminQuizListReturn = { quizzes: [{ quizId: expect.any(Number), name: QUIZ1.name }] };
    expect(response).toStrictEqual(expected);
  });
});

describe('Testing GET /v1/admin/quiz/{quizid}', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token;
    const quiz = quizCreateV1(token, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId = quiz.quizId as number;
  });

  test('Successful quiz info retrieval after quiz is restored from the trash', () => {
    const before = quizInfoV1(token, quizId).jsonBody;
    quizTrashV1(token, quizId);
    quizRestoreV1(token, quizId);
    const after = quizInfoV1(token, quizId).jsonBody;
    expect(after).toStrictEqual(before);
  });

  test('Successful quiz info retrieval after quiz is sent to the trash', () => {
    const before = quizInfoV1(token, quizId).jsonBody;
    quizTrashV1(token, quizId);
    const after = quizInfoV1(token, quizId).jsonBody;
    expect(after).toStrictEqual(before);
  });

  test('Successful quiz info retrieval after quiz is restored from the trash and quiz name is updated', () => {
    quizTrashV1(token, quizId);
    quizRestoreV1(token, quizId);
    quizNameUpdateV1(token, quizId, QUIZ2.name);
    const response = quizInfoV1(token, quizId).jsonBody as AdminQuizInfoReturn;
    expect(response.name).toStrictEqual(QUIZ2.name);
  });

  test('Successful quiz info retrieval after quiz is restored from the trash and quiz description is updated', () => {
    quizTrashV1(token, quizId);
    quizRestoreV1(token, quizId);
    quizDescriptionUpdateV1(token, quizId, QUIZ2.description);
    const response = quizInfoV1(token, quizId).jsonBody as AdminQuizInfoReturn;
    expect(response.description).toStrictEqual(QUIZ2.description);
  });

  test('Unsuccessful quiz info retrieval after quiz is permanently deleted from the trash', () => {
    quizTrashV1(token, quizId);
    quizTrashEmptyV1(token, [quizId]);
    expect(quizInfoV1(token, quizId)).toStrictEqual(FORBIDDEN_ERROR);
  });
});
