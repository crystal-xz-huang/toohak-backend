import {
  clearV1,
  authRegisterV1,
  authLogoutV1,
  quizListV2,
  quizCreateV2,
  quizTrashV2,
  quizInfoV2,
  quizNameUpdateV2,
  quizDescriptionUpdateV2,
  quizTrashViewV2,
  quizRestoreV2,
  quizTrashEmptyV2,
} from '../httpHelpers';

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

import {
  getTimeStamp,
  checkTimeStamp,
} from '../testHelpers';

import { AdminQuizListReturn, AdminQuizInfoReturn } from '../functionTypes';

beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

//= =============================================================================
// Remove .skip from describe.skip to run the tests
// Use .only to run only that block of tests
//= =============================================================================

describe.skip('Testing DELETE /v2/admin/quiz/{quizid}', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token;
    const quiz = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId = quiz.quizId as number;
  });

  test('Correct status code and return value', () => {
    const response = quizTrashV2(token, quizId);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  test('Successful removal of one quiz', () => {
    quizTrashV2(token, quizId);
    const response = quizListV2(token).jsonBody;
    expect(response).toStrictEqual({ quizzes: [] });
  });

  test('Successful removal of one quiz and creation of same quiz', () => {
    quizTrashV2(token, quizId);
    quizCreateV2(token, QUIZ1.name, QUIZ1.description);
    const response = quizListV2(token).jsonBody;
    expect(response).toStrictEqual({ quizzes: [{ quizId: expect.any(Number), name: QUIZ1.name }] });
  });

  test('timeLastEdited is updated and is within a 1 second range of the current time', () => {
    const expectedTime = Math.floor(Date.now() / 1000);
    quizTrashV2(token, quizId);
    const timeLastEdited = quizInfoV2(token, quizId).jsonBody.timeLastEdited as number;
    expect(timeLastEdited).toBeGreaterThanOrEqual(expectedTime);
    expect(timeLastEdited).toBeLessThanOrEqual(expectedTime + 1);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizTrashV2('', quizId)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizTrashV2(token + 'random', quizId)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizTrashV2(token, quizId)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizTrashV2(token, quizId + 1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizTrashV2(token2, quizId);
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
      const response1 = quizTrashV2(invalidToken, quizId);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
      const response2 = quizTrashV2(emptyToken, quizId);
      expect(response2).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizTrashV2(notOwnerToken, quizId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });
});

describe.skip('Testing GET /v2/admin/quiz/trash', () => {
  let token: string;
  let quizId1: number;
  let quizId2: number;
  let quizId3: number;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token as string;
    const q1 = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId1 = q1.quizId as number;
    const q2 = quizCreateV2(token, QUIZ2.name, QUIZ2.description).jsonBody;
    quizId2 = q2.quizId as number;
    const q3 = quizCreateV2(token, QUIZ3.name, QUIZ3.description).jsonBody;
    quizId3 = q3.quizId as number;
  });

  test('Correct status code and return value', () => {
    const response = quizTrashViewV2(token);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({ quizzes: expect.any(Array) });
  });

  test('Successful retrieval when user has three quizzes, none in the trash', () => {
    const response = quizTrashViewV2(token).jsonBody;
    const expected = { quizzes: [] } as { quizzes: { quizId: number, name: string }[] };
    expect(response).toStrictEqual(expected);
  });

  test('Successful retrieval when user has three quizzes, one in the trash', () => {
    quizTrashV2(token, quizId1);
    quizTrashV2(token, quizId2);
    const response = quizTrashViewV2(token).jsonBody as { quizzes: { quizId: number, name: string }[] };
    const expected = { quizzes: [{ quizId: quizId1, name: QUIZ1.name }, { quizId: quizId2, name: QUIZ2.name }] };
    expect(response).toStrictEqual(expected);
  });

  test('Successful retrieval when user has three quizzes, two in the trash', () => {
    quizTrashV2(token, quizId1);
    const response = quizTrashViewV2(token).jsonBody;
    const expected = { quizzes: [{ quizId: quizId1, name: QUIZ1.name }] };
    expect(response).toStrictEqual(expected);
  });

  test('Successful retrieval when user has three quizzes, all in the trash', () => {
    quizTrashV2(token, quizId1);
    quizTrashV2(token, quizId2);
    quizTrashV2(token, quizId3);
    const response = quizTrashViewV2(token).jsonBody;
    const expected = { quizzes: [{ quizId: quizId1, name: QUIZ1.name }, { quizId: quizId2, name: QUIZ2.name }, { quizId: quizId3, name: QUIZ3.name }] };
    expect(response).toStrictEqual(expected);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizTrashViewV2('')).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizTrashViewV2(token + 'random')).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizTrashViewV2(token)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });
});

describe('Testing POST /v2/admin/quiz/{quizid}/restore', () => {
  let tokenUser1: string;
  let tokenUser2: string;
  let quizId1: number;
  let quizId2: number;

  beforeEach(() => {
    const ret1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    tokenUser1 = ret1.token as string;

    const ret2 = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
    tokenUser2 = ret2.token as string;

    const q1 = quizCreateV2(tokenUser1, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId1 = q1.quizId as number;

    const q2 = quizCreateV2(tokenUser1, QUIZ2.name, QUIZ2.description).jsonBody;
    quizId2 = q2.quizId as number;

    quizTrashV2(tokenUser1, quizId1);
  });

  test('Correct status code and return value', () => {
    const response = quizRestoreV2(tokenUser1, quizId1);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  test('Successfully restore one quiz from the trash', () => {
    quizRestoreV2(tokenUser1, quizId1);
    expect(quizTrashViewV2(tokenUser1).jsonBody).toStrictEqual({ quizzes: [] });
    expect(quizListV2(tokenUser1).jsonBody).toStrictEqual({ quizzes: [{ quizId: quizId1, name: QUIZ1.name }, { quizId: quizId2, name: QUIZ2.name }] });
  });

  test('Successfully restore all quizzes from the trash', () => {
    quizTrashV2(tokenUser1, quizId2);
    quizRestoreV2(tokenUser1, quizId1);
    quizRestoreV2(tokenUser1, quizId2);
    expect(quizTrashViewV2(tokenUser1).jsonBody).toStrictEqual({ quizzes: [] });
    expect(quizListV2(tokenUser1).jsonBody).toStrictEqual({ quizzes: [{ quizId: quizId1, name: QUIZ1.name }, { quizId: quizId2, name: QUIZ2.name }] });
  });

  test('timeLastEdited is updated', () => {
    quizRestoreV2(tokenUser1, quizId1);
    const expectedTime = getTimeStamp();
    const timeLastEdited = quizInfoV2(tokenUser1, quizId1).jsonBody.timeLastEdited as number;
    checkTimeStamp(timeLastEdited, expectedTime);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizRestoreV2('', quizId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizRestoreV2(tokenUser1 + 'random', quizId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(tokenUser1);
      expect(quizRestoreV2(tokenUser1, quizId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizRestoreV2(tokenUser1, -1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const response = quizRestoreV2(tokenUser2, quizId1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('Quiz is not in the trash', () => {
      quizRestoreV2(tokenUser1, quizId2);
      const response = quizRestoreV2(tokenUser1, quizId2);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Quiz name of the restored quiz is already used by another active quiz', () => {
      quizCreateV2(tokenUser1, QUIZ1.name, QUIZ1.description);
      const response = quizRestoreV2(tokenUser1, quizId1);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = tokenUser1 + 'random';
    const invalidQuizId = -1;

    test('Unauthorised status code 401 first', () => {
      const response1 = quizRestoreV2(invalidToken, invalidQuizId);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizRestoreV2(tokenUser2, invalidQuizId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      const response = quizRestoreV2(tokenUser1, quizId2);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe.skip('Testing POST /v2/admin/quiz/trash/empty', () => {
  let tokenUser1: string;
  let quizId1: number;
  let quizId2: number;
  let quizId3: number;

  beforeEach(() => {
    const ret1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    tokenUser1 = ret1.token as string;

    const q1 = quizCreateV2(tokenUser1, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId1 = q1.quizId as number;
    quizTrashV2(tokenUser1, quizId1);

    const q2 = quizCreateV2(tokenUser1, QUIZ2.name, QUIZ2.description).jsonBody;
    quizId2 = q2.quizId as number;
    quizTrashV2(tokenUser1, quizId2);

    const q3 = quizCreateV2(tokenUser1, QUIZ3.name, QUIZ3.description).jsonBody;
    quizId3 = q3.quizId as number;
    quizTrashV2(tokenUser1, quizId3);
  });

  test('Correct status code and return value', () => {
    const response = quizTrashEmptyV2(tokenUser1, [quizId1]);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  describe('Permanently delete specific quizzes currently sitting in the trash', () => {
    test('Permanently delete one quiz', () => {
      quizTrashEmptyV2(tokenUser1, [quizId1]);
      expect(quizTrashViewV2(tokenUser1).jsonBody).toStrictEqual({ quizzes: [{ quizId: quizId2, name: QUIZ2.name }, { quizId: quizId3, name: QUIZ3.name }] });
    });

    test('Permanently delete two quizzes', () => {
      quizTrashEmptyV2(tokenUser1, [quizId1, quizId2]);
      expect(quizTrashViewV2(tokenUser1).jsonBody).toStrictEqual({ quizzes: [{ quizId: quizId3, name: QUIZ3.name }] });
    });

    test('Permanently delete all quizzes', () => {
      quizTrashEmptyV2(tokenUser1, [quizId1, quizId2, quizId3]);
      expect(quizTrashViewV2(tokenUser1).jsonBody).toStrictEqual({ quizzes: [] });
    });
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      const response = quizTrashEmptyV2('', [quizId1]);
      expect(response).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      const response = quizTrashEmptyV2(tokenUser1 + 'random', [quizId1]);
      expect(response).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(tokenUser1);
      const response = quizTrashEmptyV2(tokenUser1, [quizId1]);
      expect(response).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizTrashEmptyV2(tokenUser1, [-1]);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const ret2 = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody;
      const tokenUser2 = ret2.token as string;
      const response = quizTrashEmptyV2(tokenUser2, [quizId1]);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('One quiz is not in the trash', () => {
      quizRestoreV2(tokenUser1, quizId1);
      const response = quizTrashEmptyV2(tokenUser1, [quizId1, quizId2, quizId3]);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Two quizzes are not in the trash', () => {
      quizRestoreV2(tokenUser1, quizId1);
      quizRestoreV2(tokenUser1, quizId2);
      const response = quizTrashEmptyV2(tokenUser1, [quizId1, quizId2, quizId3]);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('All quizzes are not in the trash', () => {
      quizRestoreV2(tokenUser1, quizId1);
      quizRestoreV2(tokenUser1, quizId2);
      quizRestoreV2(tokenUser1, quizId3);
      const response = quizTrashEmptyV2(tokenUser1, [quizId1, quizId2, quizId3]);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = tokenUser1 + 'random';
    const invalidQuizId = -1;

    test('Unauthorised status code 401 first', () => {
      const response1 = quizTrashEmptyV2(invalidToken, [invalidQuizId]);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizTrashEmptyV2(tokenUser1, [invalidQuizId]);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      quizRestoreV2(tokenUser1, quizId1);
      const response = quizTrashEmptyV2(tokenUser1, [quizId1, quizId2, quizId3]);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe.skip('Testing POST /v2/admin/quiz', () => {
  let token: string;
  let quizId1: number;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token as string;
    const q1 = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId1 = q1.quizId as number;
  });

  test('Successful quiz creation of a quiz currently in the trash', () => {
    quizTrashV2(token, quizId1);
    const response = quizCreateV2(token, QUIZ1.name, QUIZ1.description);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody.quizId).not.toStrictEqual(quizId1);
  });

  test('Successful quiz creation of a quiz that was permanently deleted from the trash', () => {
    quizTrashV2(token, quizId1);
    quizTrashEmptyV2(token, [quizId1]);
    const response = quizCreateV2(token, QUIZ1.name, QUIZ1.description);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody.quizId).not.toStrictEqual(quizId1);
  });

  test('Unsuccessful quiz creation of a quiz restored from the trash', () => {
    quizTrashV2(token, quizId1);
    quizRestoreV2(token, quizId1);
    const response = quizCreateV2(token, QUIZ1.name, QUIZ1.description);
    expect(response).toStrictEqual(BAD_REQUEST_ERROR);
  });
});

describe.skip('Testing GET /v2/admin/quiz/list', () => {
  let token: string;
  let quizId1: number;
  let quizId2: number;
  let quizId3: number;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token as string;
    const q1 = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId1 = q1.quizId as number;
    const q2 = quizCreateV2(token, QUIZ2.name, QUIZ2.description).jsonBody;
    quizId2 = q2.quizId as number;
    const q3 = quizCreateV2(token, QUIZ3.name, QUIZ3.description).jsonBody;
    quizId3 = q3.quizId as number;
  });

  test('Moving one quiz to the trash', () => {
    quizTrashV2(token, quizId1);
    const response = quizListV2(token).jsonBody;
    const expected = { quizzes: [{ quizId: quizId2, name: QUIZ2.name }, { quizId: quizId3, name: QUIZ3.name }] };
    expect(response).toStrictEqual(expected);
  });

  test('Moving all quizzes to the trash', () => {
    quizTrashV2(token, quizId1);
    quizTrashV2(token, quizId2);
    quizTrashV2(token, quizId3);
    const response = quizListV2(token).jsonBody;
    const expected = { quizzes: [] } as AdminQuizListReturn;
    expect(response).toStrictEqual(expected);
  });

  test('Moving all quizzes to the trash and restoring one quiz', () => {
    quizTrashV2(token, quizId1);
    quizTrashV2(token, quizId2);
    quizTrashV2(token, quizId3);
    quizRestoreV2(token, quizId1);
    const response = quizListV2(token).jsonBody;
    const expected = { quizzes: [{ quizId: quizId1, name: QUIZ1.name }] };
    expect(response).toStrictEqual(expected);
  });

  test('Moving all quizzes to the trash and restoring all quizzes', () => {
    const before = quizListV2(token).jsonBody;
    quizTrashV2(token, quizId1);
    quizTrashV2(token, quizId2);
    quizTrashV2(token, quizId3);
    quizRestoreV2(token, quizId1);
    quizRestoreV2(token, quizId2);
    quizRestoreV2(token, quizId3);
    const after = quizListV2(token).jsonBody;
    expect(after).toStrictEqual(before);
  });

  test('Moving all quizzes to the trash and permanently deleting one quiz', () => {
    quizTrashV2(token, quizId1);
    quizTrashV2(token, quizId2);
    quizTrashV2(token, quizId3);
    quizTrashEmptyV2(token, [quizId1]);
    const response = quizListV2(token).jsonBody;
    const expected = { quizzes: [{ quizId: quizId2, name: QUIZ2.name }, { quizId: quizId3, name: QUIZ3.name }] };
    expect(response).toStrictEqual(expected);
  });

  test('Moving all quizzes to the trash and permanently deleting all quizzes', () => {
    quizTrashV2(token, quizId1);
    quizTrashV2(token, quizId2);
    quizTrashV2(token, quizId3);
    quizTrashEmptyV2(token, [quizId1, quizId2, quizId3]);
    const response = quizListV2(token).jsonBody;
    const expected = { quizzes: [] } as AdminQuizListReturn;
    expect(response).toStrictEqual(expected);
  });

  test('Moving all quizzes to the trash and permanently deleting all quizzes and creating a new quiz', () => {
    quizTrashV2(token, quizId1);
    quizTrashV2(token, quizId2);
    quizTrashV2(token, quizId3);
    quizTrashEmptyV2(token, [quizId1, quizId2, quizId3]);
    quizCreateV2(token, QUIZ1.name, QUIZ1.description);
    const response = quizListV2(token).jsonBody;
    const expected = { quizzes: [{ quizId: expect.any(Number), name: QUIZ1.name }] };
    expect(response).toStrictEqual(expected);
  });
});

describe.skip('Testing POST /v2/admin/quiz', () => {
  let token: string;
  let quizId1: number;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token as string;
    const q1 = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId1 = q1.quizId as number;
  });

  test('Successful quiz creation of a quiz currently in the trash', () => {
    quizTrashV2(token, quizId1);
    const response = quizCreateV2(token, QUIZ1.name, QUIZ1.description);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody.quizId).not.toStrictEqual(quizId1);
  });

  test('Successful quiz creation of a quiz that was permanently deleted from the trash', () => {
    quizTrashV2(token, quizId1);
    quizTrashEmptyV2(token, [quizId1]);
    const response = quizCreateV2(token, QUIZ1.name, QUIZ1.description);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody.quizId).not.toStrictEqual(quizId1);
  });

  test('Unsuccessful quiz creation of a quiz restored from the trash', () => {
    quizTrashV2(token, quizId1);
    quizTrashV2(token, quizId1);
    const response = quizCreateV2(token, QUIZ1.name, QUIZ1.description);
    expect(response).toStrictEqual(BAD_REQUEST_ERROR);
  });
});

describe.skip('Testing GET /v2/admin/quiz/list', () => {
  let token: string;
  let quizId1: number;
  let quizId2: number;
  let quizId3: number;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token as string;
    const q1 = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId1 = q1.quizId as number;
    const q2 = quizCreateV2(token, QUIZ2.name, QUIZ2.description).jsonBody;
    quizId2 = q2.quizId as number;
    const q3 = quizCreateV2(token, QUIZ3.name, QUIZ3.description).jsonBody;
    quizId3 = q3.quizId as number;
  });

  test('Moving one quiz to the trash', () => {
    quizTrashV2(token, quizId1);
    const response = quizListV2(token).jsonBody;
    const expected: AdminQuizListReturn = { quizzes: [{ quizId: quizId2, name: QUIZ2.name }, { quizId: quizId3, name: QUIZ3.name }] };
    expect(response).toStrictEqual(expected);
  });

  test('Moving all quizzes to the trash', () => {
    quizTrashV2(token, quizId1);
    quizTrashV2(token, quizId2);
    quizTrashV2(token, quizId3);
    const response = quizListV2(token).jsonBody;
    const expected: AdminQuizListReturn = { quizzes: [] };
    expect(response).toStrictEqual(expected);
  });

  test('Moving all quizzes to the trash and restoring one quiz', () => {
    quizTrashV2(token, quizId1);
    quizTrashV2(token, quizId2);
    quizTrashV2(token, quizId3);
    quizTrashV2(token, quizId1);
    const response = quizListV2(token).jsonBody;
    const expected: AdminQuizListReturn = { quizzes: [{ quizId: quizId1, name: QUIZ1.name }] };
    expect(response).toStrictEqual(expected);
  });

  test('Moving all quizzes to the trash and restoring all quizzes', () => {
    const before = quizListV2(token).jsonBody;
    quizTrashV2(token, quizId1);
    quizTrashV2(token, quizId2);
    quizTrashV2(token, quizId3);
    quizTrashV2(token, quizId1);
    quizTrashV2(token, quizId2);
    quizTrashV2(token, quizId3);
    const after = quizListV2(token).jsonBody;
    expect(after).toStrictEqual(before);
  });

  test('Permanently deleting one quiz', () => {
    quizTrashV2(token, quizId1);
    quizTrashEmptyV2(token, [quizId1]);
    const response = quizListV2(token).jsonBody;
    const expected: AdminQuizListReturn = { quizzes: [{ quizId: quizId2, name: QUIZ2.name }, { quizId: quizId3, name: QUIZ3.name }] };
    expect(response).toStrictEqual(expected);
  });

  test('Permanently deleting all quizzes', () => {
    quizTrashV2(token, quizId1);
    quizTrashV2(token, quizId2);
    quizTrashV2(token, quizId3);
    quizTrashEmptyV2(token, [quizId1, quizId2, quizId3]);
    const response = quizListV2(token).jsonBody;
    const expected: AdminQuizListReturn = { quizzes: [] };
    expect(response).toStrictEqual(expected);
  });

  test('Permanently deleting all quizzes and creating a new quiz', () => {
    quizTrashV2(token, quizId1);
    quizTrashV2(token, quizId2);
    quizTrashV2(token, quizId3);
    quizTrashEmptyV2(token, [quizId1, quizId2, quizId3]);
    quizCreateV2(token, QUIZ1.name, QUIZ1.description);
    const response = quizListV2(token).jsonBody;
    const expected: AdminQuizListReturn = { quizzes: [{ quizId: expect.any(Number), name: QUIZ1.name }] };
    expect(response).toStrictEqual(expected);
  });
});

describe.skip('Testing GET /v2/admin/quiz/{quizid}', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const user = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody;
    token = user.token;
    const quiz = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody;
    quizId = quiz.quizId as number;
  });

  test('Successful quiz info retrieval after quiz is restored from the trash', () => {
    const before = quizInfoV2(token, quizId).jsonBody;
    quizTrashV2(token, quizId);
    quizTrashV2(token, quizId);
    const after = quizInfoV2(token, quizId).jsonBody;
    expect(after).toStrictEqual(before);
  });

  test('Successful quiz info retrieval after quiz is sent to the trash', () => {
    const before = quizInfoV2(token, quizId).jsonBody;
    quizTrashV2(token, quizId);
    const after = quizInfoV2(token, quizId).jsonBody;
    expect(after).toStrictEqual(before);
  });

  test('Successful quiz info retrieval after quiz is restored from the trash and quiz name is updated', () => {
    quizTrashV2(token, quizId);
    quizTrashV2(token, quizId);
    quizNameUpdateV2(token, quizId, QUIZ2.name);
    const response = quizInfoV2(token, quizId).jsonBody as AdminQuizInfoReturn;
    expect(response.name).toStrictEqual(QUIZ2.name);
  });

  test('Successful quiz info retrieval after quiz is restored from the trash and quiz description is updated', () => {
    quizTrashV2(token, quizId);
    quizTrashV2(token, quizId);
    quizDescriptionUpdateV2(token, quizId, QUIZ2.description);
    const response = quizInfoV2(token, quizId).jsonBody as AdminQuizInfoReturn;
    expect(response.description).toStrictEqual(QUIZ2.description);
  });

  test('Unsuccessful quiz info retrieval after quiz is permanently deleted from the trash', () => {
    quizTrashV2(token, quizId);
    quizTrashEmptyV2(token, [quizId]);
    expect(quizInfoV2(token, quizId)).toStrictEqual(FORBIDDEN_ERROR);
  });
});
