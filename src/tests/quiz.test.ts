// Tests for the quiz routes
import {
  clearV1,
  authRegisterV1,
  // authLogoutV1,
  quizListV1,
  quizCreateV1,
  quizRemoveV1,
  quizInfoV1,
  quizNameUpdateV1,
  quizDescriptionUpdateV1,
  quizTrashViewV1,
  authLogoutV1,
  quizRestoreV1,
  // quizTrashEmptyV1,
  // quizTransferV1,
  // quizQuestionCreateV1,
  // quizQuestionUpdateV1,
  // quizQuestionRemoveV1,
  // quizQuestionMoveV1,
  // quizQuestionDuplicateV1,
} from '../testHelpers';

import {
  BAD_REQUEST_ERROR,
  UNAUTHORISED_ERROR,
  FORBIDDEN_ERROR,
  // CLEAR_SUCCESS,
  user1,
  user2,
  quiz1,
  quiz2,
  quiz3,
  badRequestErrorQuizNames,
  shortQuizNames,
} from '../testTypes';

import {
  AdminQuizListReturn,
  AdminQuizInfoReturn,
} from '../dataTypes';

// ========================================================================================================================================//
beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

describe('Testing GET /v1/admin/quiz/list', () => {
  let token: string;
  beforeEach(() => {
    const ret = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody;
    token = ret.token;
  });

  test('Correct status code and return value on success', () => {
    const response = quizListV1(token);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({ quizzes: expect.any(Array) });
  });

  test('Unauthorised error with an invalid or empty token', () => {
    expect(quizListV1(token + 'random')).toStrictEqual(UNAUTHORISED_ERROR);
    expect(quizListV1('')).toStrictEqual(UNAUTHORISED_ERROR);
  });

  test('Successful retrieval when user has no quizzes', () => {
    const response = quizListV1(token).jsonBody;
    const expected: AdminQuizListReturn = { quizzes: [] };
    expect(response).toStrictEqual(expected);
  });

  test('Successful retrieval when user has one quiz', () => {
    const response = quizCreateV1(token, quiz1.name, quiz1.description).jsonBody;
    const quizId = response.quizId as number;
    const expected: AdminQuizListReturn = { quizzes: [{ quizId: quizId, name: quiz1.name }] };
    expect(quizListV1(token).jsonBody).toStrictEqual(expected);
    expect(quizListV1(token).statusCode).toStrictEqual(200);
  });

  test('Successful retrieval when user has two quizzes', () => {
    const response1 = quizCreateV1(token, quiz1.name, quiz1.description).jsonBody;
    const quizId1 = response1.quizId as number;
    const response2 = quizCreateV1(token, quiz2.name, quiz2.description).jsonBody;
    const quizId2 = response2.quizId as number;
    const expected: AdminQuizListReturn = { quizzes: [{ quizId: quizId1, name: quiz1.name }, { quizId: quizId2, name: quiz2.name }] };
    expect(quizListV1(token).jsonBody).toStrictEqual(expected);
    expect(quizListV1(token).statusCode).toStrictEqual(200);
  });

  test('Successful retrieval when user has three quizzes', () => {
    const response1 = quizCreateV1(token, quiz1.name, quiz1.description).jsonBody;
    const quizId1 = response1.quizId as number;
    const response2 = quizCreateV1(token, quiz2.name, quiz2.description).jsonBody;
    const quizId2 = response2.quizId as number;
    const response3 = quizCreateV1(token, quiz3.name, quiz3.description).jsonBody;
    const quizId3 = response3.quizId as number;
    const expected: AdminQuizListReturn = { quizzes: [{ quizId: quizId1, name: quiz1.name }, { quizId: quizId2, name: quiz2.name }, { quizId: quizId3, name: quiz3.name }] };
    expect(quizListV1(token).jsonBody).toStrictEqual(expected);
    expect(quizListV1(token).statusCode).toStrictEqual(200);
  });
});

describe('Testing POST /v1/admin/quiz', () => {
  let token: string;
  beforeEach(() => {
    const ret = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody;
    token = ret.token;
  });

  test('Correct status code and return value on success', () => {
    const response = quizCreateV1(token, quiz1.name, quiz1.description);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({ quizId: expect.any(Number) });
  });

  test('QuizId is unique for two different quizzes', () => {
    const response1 = quizCreateV1(token, quiz1.name, quiz1.description).jsonBody;
    const quizId1 = response1.quizId as number;
    const response2 = quizCreateV1(token, quiz2.name, quiz2.description).jsonBody;
    const quizId2 = response2.quizId as number;
    expect(quizId1).not.toStrictEqual(quizId2);
  });

  test('Unauthorised error with an invalid or empty token', () => {
    expect(quizCreateV1(token + 'random', quiz1.name, quiz1.description)).toStrictEqual(UNAUTHORISED_ERROR);
    expect(quizCreateV1('', quiz1.name, quiz1.description)).toStrictEqual(UNAUTHORISED_ERROR);
  });

  describe('Bad request error with invalid input', () => {
    test('Empty name', () => {
      const response = quizCreateV1(token, '', quiz1.description);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Name less than 3 characters', () => {
      const response = quizCreateV1(token, 'Q', quiz1.description);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Name more than 30 characters', () => {
      const longName = 'Q'.repeat(31);
      const response = quizCreateV1(token, longName, quiz1.description);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Name already used for another quiz', () => {
      quizCreateV1(token, quiz1.name, quiz1.description);
      const response = quizCreateV1(token, quiz1.name, quiz1.description);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Description more than 100 characters', () => {
      const longDescription = 'Q'.repeat(101);
      const response = quizCreateV1(token, quiz1.name, longDescription);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const emptyToken = '';
    const alreadyUsedName = quiz1.name;
    const longName = 'Q'.repeat(31);
    const shortName = 'Q';
    const longDescription = 'Q'.repeat(101);

    test('Unauthorised status code 401 first', () => {
      const response1 = quizCreateV1(invalidToken, alreadyUsedName, longDescription);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
      const response2 = quizCreateV1(emptyToken, alreadyUsedName, longDescription);
      expect(response2).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Bad request status code 403 last', () => {
      const response1 = quizCreateV1(token, alreadyUsedName, longDescription);
      expect(response1).toStrictEqual(BAD_REQUEST_ERROR);
      const response2 = quizCreateV1(token, longName, quiz1.description);
      expect(response2).toStrictEqual(BAD_REQUEST_ERROR);
      const response3 = quizCreateV1(token, shortName, quiz1.description);
      expect(response3).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing DELETE /v1/admin/quiz/{quizid}', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const user = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody;
    token = user.token;
    const quiz = quizCreateV1(token, quiz1.name, quiz1.description).jsonBody;
    quizId = quiz.quizId as number;
  });

  test('Unauthorised error with an invalid token', () => {
    const response = quizRemoveV1(token + 'random', quizId);
    expect(response).toStrictEqual(UNAUTHORISED_ERROR);
  });

  test('Unauthorised error with an empty token', () => {
    const response = quizRemoveV1('', quizId);
    expect(response).toStrictEqual(UNAUTHORISED_ERROR);
  });

  test('Forbidden error with valid token but invalid quizId', () => {
    const response = quizRemoveV1(token, quizId + 1);
    expect(response).toStrictEqual(FORBIDDEN_ERROR);
  });

  test('Forbidden error with valid token but quizId not owned by user', () => {
    const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
    const token2 = invalidUser.token as string;
    const response = quizRemoveV1(token2, quizId);
    expect(response).toStrictEqual(FORBIDDEN_ERROR);
  });

  test('Successful removal of one quiz', () => {
    const response = quizRemoveV1(token, quizId);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });
});

describe('Testing GET /v1/admin/quiz/{quizid}', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const user = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody;
    token = user.token;
    const quiz = quizCreateV1(token, quiz1.name, quiz1.description).jsonBody;
    quizId = quiz.quizId as number;
  });

  test('Correct status code and return value on success', () => {
    const response = quizInfoV1(token, quizId);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({
      quizId: quizId,
      name: quiz1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: quiz1.description,
      numQuestions: expect.any(Number),
      questions: expect.any(Array),
      duration: expect.any(Number),
    });
  });

  test('Unauthorised error with an invalid or empty token', () => {
    expect(quizInfoV1(token + 'random', quizId)).toStrictEqual(UNAUTHORISED_ERROR);
    expect(quizInfoV1('', quizId)).toStrictEqual(UNAUTHORISED_ERROR);
  });

  describe('Forbidden error with invalid input', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizInfoV1(token, quizId + 1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but quizId not owned by user', () => {
      const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizInfoV1(token2, quizId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  test('Successful retrieval of one quiz', () => {
    const expected: AdminQuizInfoReturn = {
      quizId: quizId,
      name: quiz1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: quiz1.description,
      numQuestions: 0,
      questions: [],
      duration: 0,
    };
    const response = quizInfoV1(token, quizId).jsonBody;
    expect(response).toStrictEqual(expected);
  });

  test('Timestamps are within a 1 second range of the current time', () => {
    // Capture the current time
    const expectedTime = Math.floor(Date.now() / 1000);
    // Send a request to create a new quiz and get the timeCreated and timeLastEdited of the quiz with quizInfo
    const response = quizInfoV1(token, quizId).jsonBody;
    const timeCreated = response.timeCreated as number;
    const timeLastEdited = response.timeLastEdited as number;

    // Check if the timeCreated and timeLastEdited are within a 1 second range of the current time
    expect(timeCreated).toBeGreaterThanOrEqual(expectedTime);
    expect(timeCreated).toBeLessThanOrEqual(expectedTime + 1);
    expect(timeLastEdited).toBeGreaterThanOrEqual(expectedTime);
    expect(timeLastEdited).toBeLessThanOrEqual(expectedTime + 1);
  });
});

describe('Testing PUT /v1/admin/quiz/{quizid}/name', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const user = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody;
    token = user.token;
    const quiz = quizCreateV1(token, quiz1.name, quiz1.description).jsonBody;
    quizId = quiz.quizId as number;
  });

  test('Correct status code and return value on success', () => {
    const update = quizNameUpdateV1(token, quizId, quiz2.name);
    const response = quizInfoV1(token, quizId).jsonBody;
    expect(update.statusCode).toStrictEqual(200);
    expect(response.name).toStrictEqual(quiz2.name);
  });

  test('Unauthorised error with an invalid or empty token', () => {
    expect(quizNameUpdateV1(token + 'random', quizId, quiz2.name)).toStrictEqual(UNAUTHORISED_ERROR);
    expect(quizNameUpdateV1('', quizId, quiz2.name)).toStrictEqual(UNAUTHORISED_ERROR);
  });

  test('Forbidden error with valid token but invalid quizId', () => {
    const response = quizNameUpdateV1(token, quizId + 1, quiz2.name);
    expect(response).toStrictEqual(FORBIDDEN_ERROR);
  });

  test('Forbidden error with valid token but quizId not owned by user', () => {
    const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
    const token2 = invalidUser.token as string;
    const response = quizNameUpdateV1(token2, quizId, quiz2.name);
    expect(response).toStrictEqual(FORBIDDEN_ERROR);
  });

  describe('Bad request error with invalid input', () => {
    test('Name contains invalid characters', () => {
      const response = quizNameUpdateV1(token, quizId, 'Quiz 1&!');
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(shortQuizNames)('Name less than 3 characters="$name"', ({ name }) => {
      const response = quizNameUpdateV1(token, quizId, name);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Name more than 30 characters', () => {
      const longName = 'Q'.repeat(31);
      const response = quizNameUpdateV1(token, quizId, longName);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Name already used for another quiz', () => {
      quizCreateV1(token, quiz2.name, quiz2.description);
      const response = quizNameUpdateV1(token, quizId, quiz2.name);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const emptyToken = '';
    const invalidQuizId = quizId + 1;
    const invalidQuizName = 'Quiz 1&!';
    let notOwnerToken: string;
    beforeEach(() => {
      const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
      notOwnerToken = invalidUser.token as string;
    });

    test('Unauthorised status code 401 first', () => {
      const response1 = quizNameUpdateV1(invalidToken, invalidQuizId, invalidQuizName);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);

      const response2 = quizNameUpdateV1(emptyToken, invalidQuizId, invalidQuizName);
      expect(response2).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizNameUpdateV1(notOwnerToken, invalidQuizId, invalidQuizName);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test.each(badRequestErrorQuizNames)('Bad request status code 400 last', ({ name }) => {
      const response = quizNameUpdateV1(token, quizId, name);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  test('Successful update of one quiz name', () => {
    quizNameUpdateV1(token, quizId, quiz2.name);
    const response = quizInfoV1(token, quizId).jsonBody;
    expect(response.name).toStrictEqual(quiz2.name);
  });

  test('Successful update of one quiz name, and creation of a new quiz with the old name', () => {
    quizNameUpdateV1(token, quizId, quiz2.name);
    quizCreateV1(token, quiz1.name, quiz1.description);
    const response = quizListV1(token).jsonBody;
    expect(response).toStrictEqual({ quizzes: [{ quizId: quizId, name: quiz2.name }, { quizId: expect.any(Number), name: quiz1.name }] });
  });
});

describe('Testing PUT /v1/admin/quiz/{quizid}/description', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    const user = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody;
    token = user.token;
    const quiz = quizCreateV1(token, quiz1.name, quiz1.description).jsonBody;
    quizId = quiz.quizId as number;
  });

  test('Correct status code and return value on success', () => {
    const update = quizDescriptionUpdateV1(token, quizId, quiz2.description);
    const response = quizInfoV1(token, quizId).jsonBody;
    expect(update.statusCode).toStrictEqual(200);
    expect(response.description).toStrictEqual(quiz2.description);
  });

  test('Unauthorised error with an invalid or empty token', () => {
    expect(quizDescriptionUpdateV1(token + 'random', quizId, quiz2.description)).toStrictEqual(UNAUTHORISED_ERROR);
    expect(quizDescriptionUpdateV1('', quizId, quiz2.description)).toStrictEqual(UNAUTHORISED_ERROR);
  });

  test('Forbidden error with valid token but invalid quizId', () => {
    const response = quizDescriptionUpdateV1(token, quizId + 1, quiz2.description);
    expect(response).toStrictEqual(FORBIDDEN_ERROR);
  });

  test('Forbidden error with valid token but quizId not owned by user', () => {
    const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
    const token2 = invalidUser.token as string;
    const response = quizDescriptionUpdateV1(token2, quizId, quiz2.description);
    expect(response).toStrictEqual(FORBIDDEN_ERROR);
  });

  test('Bad request error with description more than 100 characters', () => {
    const longDescription = 'Q'.repeat(101);
    const response = quizDescriptionUpdateV1(token, quizId, longDescription);
    expect(response).toStrictEqual(BAD_REQUEST_ERROR);
  });

  test('Successful update of one quiz description', () => {
    quizDescriptionUpdateV1(token, quizId, quiz2.description);
    const response = quizInfoV1(token, quizId).jsonBody;
    expect(response.description).toStrictEqual(quiz2.description);
  });

  test('Successful update of one quiz description, and creation of a new quiz with the old description', () => {
    quizDescriptionUpdateV1(token, quizId, quiz2.description);
    const response1 = quizInfoV1(token, quizId).jsonBody;
    expect(response1.description).toStrictEqual(quiz2.description);

    const quizId2 = quizCreateV1(token, quiz2.name, quiz1.description).jsonBody.quizId as number;
    const response2 = quizInfoV1(token, quizId2).jsonBody.description as string;
    expect(response2).toStrictEqual(quiz1.description);
  });
});

describe('Testing GET /v1/admin/quiz/trash', () => {
  let token: string;
  let quizId1: number;
  let quizId2: number;
  let quizId3: number;
  beforeEach(() => {
    const user = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody;
    token = user.token as string;
    const q1 = quizCreateV1(token, quiz1.name, quiz1.description).jsonBody;
    quizId1 = q1.quizId as number;
    const q2 = quizCreateV1(token, quiz2.name, quiz2.description).jsonBody;
    quizId2 = q2.quizId as number;
    const q3 = quizCreateV1(token, quiz3.name, quiz3.description).jsonBody;
    quizId3 = q3.quizId as number;
  });

  test('Correct status code and return value on success', () => {
    const response = quizTrashViewV1(token);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({ quizzes: expect.any(Array) });
  });

  test('Unauthorised error with an empty token', () => {
    expect(quizTrashViewV1('')).toStrictEqual(UNAUTHORISED_ERROR);
  });

  test('Unauthorised error with an invalid token', () => {
    expect(quizTrashViewV1(token + 'random')).toStrictEqual(UNAUTHORISED_ERROR);
    authLogoutV1(token);
    expect(quizTrashViewV1(token)).toStrictEqual(UNAUTHORISED_ERROR);
  });

  test('Successful retrieval when user has three quizzes, none in the trash', () => {
    const response = quizTrashViewV1(token).jsonBody;
    const expected = { quizzes: [] } as { quizzes: { quizId: number, name: string }[] };
    expect(response).toStrictEqual(expected);
  });

  test('Successful retrieval when user has three quizzes, one in the trash', () => {
    quizRemoveV1(token, quizId1);
    quizRemoveV1(token, quizId2);
    const response = quizTrashViewV1(token).jsonBody as { quizzes: { quizId: number, name: string }[] };
    const expected = { quizzes: [{ quizId: quizId1, name: quiz1.name }, { quizId: quizId2, name: quiz2.name }] };
    expect(response).toStrictEqual(expected);
  });

  test('Successful retrieval when user has three quizzes, two in the trash', () => {
    quizRemoveV1(token, quizId1);
    const response = quizTrashViewV1(token).jsonBody;
    const expected = { quizzes: [{ quizId: quizId1, name: quiz1.name }] };
    expect(response).toStrictEqual(expected);
  });

  test('Successful retrieval when user has three quizzes, all in the trash', () => {
    quizRemoveV1(token, quizId1);
    quizRemoveV1(token, quizId2);
    quizRemoveV1(token, quizId3);
    const response = quizTrashViewV1(token).jsonBody;
    const expected = { quizzes: [{ quizId: quizId1, name: quiz1.name }, { quizId: quizId2, name: quiz2.name }, { quizId: quizId3, name: quiz3.name }] };
    expect(response).toStrictEqual(expected);
  });
});

describe('Testing POST /v1/admin/quiz/{quizid}/restore', () => {
  let tokenUser1: string;
  let tokenUser2: string;
  let quizId1: number;

  const user1Details = { email: 'user1@example.com', password: 'password1', nameFirst: 'User', nameLast: 'One' };
  const user2Details = { email: 'user2@example.com', password: 'password2', nameFirst: 'User', nameLast: 'Two' };

  beforeEach(() => {
    clearV1();

    const user1 = authRegisterV1(user1Details.email, user1Details.password, user1Details.nameFirst, user1Details.nameLast).jsonBody;
    tokenUser1 = user1.token as string;

    const quiz1 = quizCreateV1(tokenUser1, 'Quiz 1', 'Description for Quiz 1').jsonBody;
    quizId1 = quiz1.quizId as number;
    quizRemoveV1(tokenUser1, quizId1);

    const user2 = authRegisterV1(user2Details.email, user2Details.password, user2Details.nameFirst, user2Details.nameLast).jsonBody;
    tokenUser2 = user2.token as string;
  });

  test('Successful quiz restoration', () => {
    const response = quizRestoreV1(tokenUser1, quizId1).jsonBody;
    expect(response).toStrictEqual({});
  });

  test('Timestamps are within a 1 second range of the current time', () => {
    const response1 = quizRestoreV1(tokenUser1, quizId1).jsonBody;
    expect(response1).toStrictEqual({});

    const expectedTime = Math.floor(Date.now() / 1000);
    const response2 = quizInfoV1(tokenUser1, quizId1).jsonBody;
    const timeLastEdited = response2.timeLastEdited as number;
    // Check if the timeLastEdited are within a 1 second range of the current time
    expect(timeLastEdited).toBeGreaterThanOrEqual(expectedTime);
    expect(timeLastEdited).toBeLessThanOrEqual(expectedTime + 1);
  });

  test('Error when the quiz is not in the trash', () => {
    quizRestoreV1(tokenUser1, quizId1);
    const response = quizRestoreV1(tokenUser1, quizId1);
    expect(response).toStrictEqual(BAD_REQUEST_ERROR);
  });

  test('Error when attempting to restore a quiz with a name that already exists', () => {
    quizCreateV1(tokenUser2, 'Quiz 1', 'Description for Quiz 2');
    const response = quizRestoreV1(tokenUser1, quizId1);
    expect(response).toStrictEqual(BAD_REQUEST_ERROR);
  });

  test('Error with an empty token', () => {
    const response = quizRestoreV1('', quizId1);
    expect(response).toStrictEqual(UNAUTHORISED_ERROR);
  });

  test('Error with an invalid token', () => {
    const response = quizRestoreV1(tokenUser1 + 'random', quizId1);
    expect(response).toStrictEqual(UNAUTHORISED_ERROR);
  });

  test('Error when the user does not own the quiz', () => {
    const response = quizRestoreV1(tokenUser2, quizId1);
    expect(response).toStrictEqual(FORBIDDEN_ERROR);
  });

  test('Error when the quiz ID is invalid', () => {
    const invalidQuizId = -1;
    const response = quizRestoreV1(tokenUser1, invalidQuizId);
    expect(response).toStrictEqual(FORBIDDEN_ERROR);
  });
});
