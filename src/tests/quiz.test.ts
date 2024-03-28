import {
  clearV1,
  authRegisterV1,
  authLogoutV1,
  quizListV1,
  quizCreateV1,
  quizRemoveV1,
  quizInfoV1,
  quizNameUpdateV1,
  quizDescriptionUpdateV1,
  quizTrashViewV1,
  quizRestoreV1,
  quizTrashEmptyV1,
  quizTransferV1,
  quizQuestionCreateV1,
  // quizQuestionUpdateV1,
  // quizQuestionRemoveV1,
  // quizQuestionMoveV1,
  // quizQuestionDuplicateV1,
} from '../testHelpers';

import { BAD_REQUEST_ERROR, UNAUTHORISED_ERROR, FORBIDDEN_ERROR } from '../testTypes';
import { user1, user2, user3, quiz1, quiz2, quiz3 } from '../testTypes';
import {
  shortQuizNames,
  invalidQuizNames,
  validQuestion1,
  validQuestion2,
  shortQuestionString,
  longQuestionString,
  moreQuestionAnswers,
  lessQuestionAnswers,
  negativeQuestionDuration,
  moreQuestionDurationSum,
  lessQuestionPoints,
  moreQuestionPoints,
  shortQuestionAnswers,
  longQuestionAnswers,
  duplicateQuestionAnswers,
  falseQuestionAnswers,
} from '../testTypes';
import { AdminQuizListReturn, AdminQuizInfoReturn } from '../dataTypes';

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

  test('Correct status code and return value', () => {
    const response = quizListV1(token);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({ quizzes: expect.any(Array) });
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

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizListV1('')).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizListV1(token + 'random')).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizListV1(token)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });
});

describe('Testing POST /v1/admin/quiz', () => {
  let token: string;
  beforeEach(() => {
    const ret = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody;
    token = ret.token;
  });

  test('Correct status code and return value', () => {
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

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizCreateV1('', quiz1.name, quiz1.description)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizCreateV1(token + 'random', quiz1.name, quiz1.description)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizCreateV1(token, quiz1.name, quiz1.description)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Bad request errors', () => {
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

  test('Correct status code and return value', () => {
    const response = quizRemoveV1(token, quizId);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  test('Successful removal of one quiz', () => {
    const response = quizRemoveV1(token, quizId);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizRemoveV1('', quizId)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizRemoveV1(token + 'random', quizId)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizRemoveV1(token, quizId)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizRemoveV1(token, quizId + 1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizRemoveV1(token2, quizId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const emptyToken = '';
    let notOwnerToken: string;
    beforeEach(() => {
      const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
      notOwnerToken = invalidUser.token as string;
    });

    test('Unauthorised status code 401 first', () => {
      const response1 = quizRemoveV1(invalidToken, quizId);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
      const response2 = quizRemoveV1(emptyToken, quizId);
      expect(response2).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizRemoveV1(notOwnerToken, quizId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
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

  test('Correct status code and return value', () => {
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

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizInfoV1('', quizId)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizInfoV1(token + 'random', quizId)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizInfoV1(token, quizId)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizInfoV1(token, quizId + 1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizInfoV1(token2, quizId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const emptyToken = '';
    let notOwnerToken: string;
    beforeEach(() => {
      const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
      notOwnerToken = invalidUser.token as string;
    });

    test('Unauthorised status code 401 first', () => {
      const response1 = quizInfoV1(invalidToken, quizId);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
      const response2 = quizInfoV1(emptyToken, quizId);
      expect(response2).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizInfoV1(notOwnerToken, quizId);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
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

  test('Correct status code and return value', () => {
    const update = quizNameUpdateV1(token, quizId, quiz2.name);
    const response = quizInfoV1(token, quizId).jsonBody;
    expect(update.statusCode).toStrictEqual(200);
    expect(response.name).toStrictEqual(quiz2.name);
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

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizNameUpdateV1('', quizId, quiz2.name)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizNameUpdateV1(token + 'random', quizId, quiz2.name)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizNameUpdateV1(token, quizId, quiz2.name)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizNameUpdateV1(token, quizId + 1, quiz2.name);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizNameUpdateV1(token2, quizId, quiz2.name);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
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

    test.each(invalidQuizNames)('Bad request status code 400 last', ({ name }) => {
      const response = quizNameUpdateV1(token, quizId, name);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
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

  test('Correct status code and return value', () => {
    const update = quizDescriptionUpdateV1(token, quizId, quiz2.description);
    const response = quizInfoV1(token, quizId).jsonBody;
    expect(update.statusCode).toStrictEqual(200);
    expect(response.description).toStrictEqual(quiz2.description);
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

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizDescriptionUpdateV1('', quizId, quiz2.description)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizDescriptionUpdateV1(token + 'random', quizId, quiz2.description)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizDescriptionUpdateV1(token, quizId, quiz2.description)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizDescriptionUpdateV1(token, quizId + 1, quiz2.description);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizDescriptionUpdateV1(token2, quizId, quiz2.description);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  test('Bad request error with description more than 100 characters', () => {
    const longDescription = 'Q'.repeat(101);
    const response = quizDescriptionUpdateV1(token, quizId, longDescription);
    expect(response).toStrictEqual(BAD_REQUEST_ERROR);
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const emptyToken = '';
    const invalidQuizId = quizId + 1;
    const longDescription = 'Q'.repeat(101);
    let notOwnerToken: string;
    beforeEach(() => {
      const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
      notOwnerToken = invalidUser.token as string;
    });

    test('Unauthorised status code 401 first', () => {
      const response1 = quizDescriptionUpdateV1(invalidToken, invalidQuizId, longDescription);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);

      const response2 = quizDescriptionUpdateV1(emptyToken, invalidQuizId, longDescription);
      expect(response2).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizDescriptionUpdateV1(notOwnerToken, invalidQuizId, longDescription);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      const response = quizDescriptionUpdateV1(token, quizId, longDescription);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
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

  test('Correct status code and return value', () => {
    const response = quizTrashViewV1(token);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({ quizzes: expect.any(Array) });
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
    const ret1 = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody;
    tokenUser1 = ret1.token as string;

    const ret2 = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
    tokenUser2 = ret2.token as string;

    const q1 = quizCreateV1(tokenUser1, quiz1.name, quiz1.description).jsonBody;
    quizId1 = q1.quizId as number;

    const q2 = quizCreateV1(tokenUser1, quiz2.name, quiz2.description).jsonBody;
    quizId2 = q2.quizId as number;

    quizRemoveV1(tokenUser1, quizId1);
  });

  test('Correct status code and return value', () => {
    const response = quizRestoreV1(tokenUser1, quizId1);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
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
      quizCreateV1(tokenUser2, quiz1.name, quiz2.description);
      const response = quizTransferV1(tokenUser1, quizId1, user2.email);
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
    const ret1 = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody;
    tokenUser1 = ret1.token as string;

    const q1 = quizCreateV1(tokenUser1, quiz1.name, quiz1.description).jsonBody;
    quizId1 = q1.quizId as number;
    quizRemoveV1(tokenUser1, quizId1);

    const q2 = quizCreateV1(tokenUser1, quiz2.name, quiz2.description).jsonBody;
    quizId2 = q2.quizId as number;
    quizRemoveV1(tokenUser1, quizId2);

    const q3 = quizCreateV1(tokenUser1, quiz3.name, quiz3.description).jsonBody;
    quizId3 = q3.quizId as number;
    quizRemoveV1(tokenUser1, quizId3);
  });

  test('Correct status code and return value', () => {
    const response = quizTrashEmptyV1(tokenUser1, [quizId1]);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  describe('Permanently delete specific quizzes currently sitting in the trash', () => {
    test('Permanently delete one quiz', () => {
      quizTrashEmptyV1(tokenUser1, [quizId1]);
      expect(quizTrashViewV1(tokenUser1).jsonBody).toStrictEqual({ quizzes: [{ quizId: quizId2, name: quiz2.name }, { quizId: quizId3, name: quiz3.name }] });
    });

    test('Permanently delete two quizzes', () => {
      quizTrashEmptyV1(tokenUser1, [quizId1, quizId2]);
      expect(quizTrashViewV1(tokenUser1).jsonBody).toStrictEqual({ quizzes: [{ quizId: quizId3, name: quiz3.name }] });
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
      const ret2 = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
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

describe('Testing POST /v1/admin/quiz/{quizid}/transfer', () => {
  let tokenUser1: string;
  let tokenUser2: string;
  let quizId1: number;

  beforeEach(() => {
    const User1 = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody;
    tokenUser1 = User1.token as string;

    const q1 = quizCreateV1(tokenUser1, quiz1.name, quiz1.description).jsonBody;
    quizId1 = q1.quizId as number;

    const User2 = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
    tokenUser2 = User2.token as string;
  });

  test('Correct status code and return value', () => {
    const response = quizTransferV1(tokenUser1, quizId1, user2.email);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  test('Successful quiz transfer', () => {
    quizTransferV1(tokenUser1, quizId1, user2.email);
    // Check if the quiz has been transferred to the target user
    const response2 = quizListV1(tokenUser2).jsonBody;
    const expected = { quizzes: [{ quizId: quizId1, name: quiz1.name }] };
    expect(response2).toStrictEqual(expected);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      const response = quizTransferV1('', quizId1, user2.email);
      expect(response).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      const response = quizTransferV1(tokenUser1 + 'random', quizId1, user2.email);
      expect(response).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(tokenUser1);
      const response = quizTransferV1(tokenUser1, quizId1, user2.email);
      expect(response).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizTransferV1(tokenUser1, -1, user2.email);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const response = quizTransferV1(tokenUser2, quizId1, user2.email);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('userEmail is not a real User', () => {
      const response = quizTransferV1(tokenUser1, quizId1, user3.email);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('userEmail is the current logged in user', () => {
      const response = quizTransferV1(tokenUser1, quizId1, user1.email);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Quiz ID refers to a quiz that has a name that is already used by the target user', () => {
      quizCreateV1(tokenUser2, quiz1.name, quiz2.description);

      const response = quizTransferV1(tokenUser1, quizId1, user2.email);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    // test('Any session for this quiz is not in END state', () => {
    // });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = tokenUser1 + 'random';
    const invalidQuizId = -1;
    const invalidUserEmail = 'invalid@gmail.com';
    test('Unauthorised status code 401 first', () => {
      const response = quizTransferV1(invalidToken, invalidQuizId, invalidUserEmail);
      expect(response).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizTransferV1(tokenUser1, invalidQuizId, invalidUserEmail);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      const response = quizTransferV1(tokenUser1, quizId1, invalidUserEmail);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing POST /v1/admin/quiz/{quizid}/question', () => {
  let token: string;
  let quizId: number;
  beforeEach(() => {
    token = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody.token as string;
    quizId = quizCreateV1(token, quiz1.name, quiz1.description).jsonBody.quizId as number;
  });

  test('Correct status code and return value', () => {
    const response = quizQuestionCreateV1(token, quizId, validQuestion1);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({ questionId: expect.any(Number) });
  });

  test('Creates a new stub question for the quiz', () => {
    quizQuestionCreateV1(token, quizId, validQuestion1);
    const response = quizInfoV1(token, quizId).jsonBody as AdminQuizInfoReturn;
    const expectedQuestion = {
      questionId: expect.any(Number),
      question: validQuestion1.question,
      duration: validQuestion1.duration,
      points: validQuestion1.points,
      answers: [
        {
          answerId: expect.any(Number),
          answer: validQuestion1.answers[0].answer,
          colour: expect.any(String),
          correct: validQuestion1.answers[0].correct
        },
        {
          answerId: expect.any(Number),
          answer: validQuestion1.answers[1].answer,
          colour: expect.any(String),
          correct: validQuestion1.answers[1].correct
        }
      ]
    };
    expect(response.questions).toStrictEqual([expectedQuestion]);
    expect(response.duration).toStrictEqual(validQuestion1.duration);
    expect(response.numQuestions).toStrictEqual(1);
  });

  test('Successfully creates 2 new stub questions for the quiz', () => {
    quizQuestionCreateV1(token, quizId, validQuestion1);
    quizQuestionCreateV1(token, quizId, validQuestion2);
    const response = quizInfoV1(token, quizId).jsonBody;
    const expected = {
      quizId: expect.any(Number),
      name: quiz1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: quiz1.description,
      numQuestions: 2,
      questions: [
        {
          questionId: expect.any(Number),
          question: validQuestion1.question,
          duration: validQuestion1.duration,
          points: validQuestion1.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion1.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion1.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion1.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion1.answers[1].correct
            }
          ]
        },
        {
          questionId: expect.any(Number),
          question: validQuestion2.question,
          duration: validQuestion2.duration,
          points: validQuestion2.points,
          answers: [
            {
              answerId: expect.any(Number),
              answer: validQuestion2.answers[0].answer,
              colour: expect.any(String),
              correct: validQuestion2.answers[0].correct
            },
            {
              answerId: expect.any(Number),
              answer: validQuestion2.answers[1].answer,
              colour: expect.any(String),
              correct: validQuestion2.answers[1].correct
            }
          ]
        }
      ],
      duration: validQuestion1.duration + validQuestion2.duration
    };
    expect(response).toStrictEqual(expected);
  });

  test('timeLastEdited is set to the created time', () => {
    const expectedTime = Math.floor(Date.now() / 1000);
    quizQuestionCreateV1(token, quizId, validQuestion1);
    const response2 = quizInfoV1(token, quizId).jsonBody;
    const timeLastEdited = response2.timeLastEdited as number;
    // Check if the timeLastEdited are within a 1 second range of the current time
    expect(timeLastEdited).toBeGreaterThanOrEqual(expectedTime);
    expect(timeLastEdited).toBeLessThanOrEqual(expectedTime + 1);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizQuestionCreateV1('', quizId, validQuestion1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizQuestionCreateV1(token + 'random', quizId, validQuestion1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a logged in user session', () => {
      authLogoutV1(token);
      expect(quizQuestionCreateV1(token, quizId, validQuestion1)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      const response = quizQuestionCreateV1(token, quizId + 1, validQuestion1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
      const token2 = invalidUser.token as string;
      const response = quizQuestionCreateV1(token2, quizId, validQuestion1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test.each(shortQuestionString)('Question string is less than 5 characters', (question) => {
      const response = quizQuestionCreateV1(token, quizId, question);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Question string is more than 100 characters', () => {
      const response = quizQuestionCreateV1(token, quizId, longQuestionString);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Question has more than 6 answers', () => {
      const response = quizQuestionCreateV1(token, quizId, moreQuestionAnswers);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(lessQuestionAnswers)('Question has less than 2 answers', (question) => {
      const response = quizQuestionCreateV1(token, quizId, question);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(negativeQuestionDuration)('Question duration is not a positive number', (question) => {
      const response = quizQuestionCreateV1(token, quizId, question);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Sum of the question durations in the quiz exceeds 3 minutes', () => {
      const response = quizQuestionCreateV1(token, quizId, moreQuestionDurationSum);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Points awarded for the question are less than 1', () => {
      const response = quizQuestionCreateV1(token, quizId, lessQuestionPoints);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Points awarded for the question are more than 10', () => {
      const response = quizQuestionCreateV1(token, quizId, moreQuestionPoints);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(shortQuestionAnswers)('Length of any answer is shorter than 1 character', (question) => {
      const response = quizQuestionCreateV1(token, quizId, question);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each(longQuestionAnswers)('Length of any answer is longer than 30 characters', (question) => {
      const response = quizQuestionCreateV1(token, quizId, question);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Any answer strings are duplicates of one another within the same question', () => {
      const response = quizQuestionCreateV1(token, quizId, duplicateQuestionAnswers);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('No correct answers', () => {
      const response = quizQuestionCreateV1(token, quizId, falseQuestionAnswers);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Errors are returned in the correct order', () => {
    const invalidToken = token + 'random';
    const invalidQuizId = -1;
    let notOwnerToken: string;
    beforeEach(() => {
      const invalidUser = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast).jsonBody;
      notOwnerToken = invalidUser.token as string;
    });

    test('Unauthorised status code 401 first', () => {
      const response1 = quizQuestionCreateV1(invalidToken, invalidQuizId, validQuestion1);
      expect(response1).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Forbidden status code 403 second', () => {
      const response = quizQuestionCreateV1(notOwnerToken, invalidQuizId, validQuestion1);
      expect(response).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Bad request status code 400 last', () => {
      const response = quizQuestionCreateV1(token, quizId, longQuestionString);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});
