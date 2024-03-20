// Tests for the quiz routes
import {
  clearV1,
  authRegisterV1,
  quizListV1,
  quizCreateV1,
  // quizRemoveV1,
  // quizInfoV1,
  // quizNameUpdateV1,
  // quizDescriptionUpdateV1,
} from '../testHelpers';

import {
  // BAD_REQUEST_ERROR, // 400
  UNAUTHORISED_ERROR, // 401
  // FORBIDDEN_ERROR, // 403
  QUIZLIST_SUCCESS,
  user1,
  // user2,
  quiz1,
  quiz2,
  quiz3,
  // invalidQuizNames,
  // invalidQuizDescription,
} from '../testTypes';

import {
  AdminQuizListReturn,
  // AdminAuthRegisterReturn,
  // AdminQuizCreateReturn,
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
    expect(response).toStrictEqual(QUIZLIST_SUCCESS);
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
  // let user: Token;
  // let token: string;
  // beforeEach(() => {
  //   const { jsonBody } = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody;
  //   user = jsonBody as Token;
  //   token = user.token;
  // });

  // test('Correct status code and return value on success', () => {

  // });

  // test('returns an object with "quizId" key on success', () => {
  //   const result = quizCreateV1(userId, quiz.name, quiz.description);
  //   expect(result).toStrictEqual({ quizId: expect.any(Number) });
  // });

  // test('does not return the same quizId for two different quizzes', () => {
  //   const result1 = quizCreateV1(userId, quiz.name, quiz.description);
  //   const result2 = quizCreateV1(userId, 'Quiz 2', 'This is another quiz');
  //   expect(result1.quizId).not.toStrictEqual(result2.quizId);
  // });

  // test('returns error with an invalid userId', () => {
  //   const result = quizCreateV1(userId + 1, quiz.name, quiz.description);
  //   expect(result).toStrictEqual(ERROR);
  // });

  // test('returns error when name contains invalid characters', () => {
  //   const result = quizCreateV1(userId, 'Quiz 1&!', quiz.description);
  //   expect(result).toStrictEqual(ERROR);
  // });

  // test('returns error when name is empty', () => {
  //   const result = quizCreateV1(userId, '', quiz.description);
  //   expect(result).toStrictEqual(ERROR);
  // });

  // test('returns error when name is less than 3 characters', () => {
  //   const result = quizCreateV1(userId, 'Q', quiz.description);
  //   expect(result).toStrictEqual(ERROR);
  // });

  // test('returns error when name is more than 30 characters', () => {
  //   const longName = 'Q'.repeat(31);
  //   const result = quizCreateV1(userId, longName, quiz.description);
  //   expect(result).toStrictEqual(ERROR);
  // });

  // test('returns error when name is already used for another quiz', () => {
  //   quizCreateV1(userId, quiz.name, quiz.description);
  //   const result = quizCreateV1(userId, quiz.name, quiz.description);
  //   expect(result).toStrictEqual(ERROR);
  // });

  // test('returns error when description is more than 100 characters', () => {
  //   const longDescription = 'Q'.repeat(101);
  //   const result = quizCreateV1(userId, quiz.name, longDescription);
  //   expect(result).toStrictEqual(ERROR);
  // });
});

describe('Testing DELETE /v1/admin/quiz/{quizid}', () => {
  // let userId;
  // let quizId;

  // beforeEach(() => {
  //   userId = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast);
  //   quizId = quizCreateV1(userId.authUserId, QUIZNAME1, QUIZDESCRIPTION1);
  // });

  // test('returns error with an invalid userId', () => {
  //   expect(quizRemoveV1(userId.authUserId + 1, quizId.quizId)).toStrictEqual(ERROR);
  // });

  // test('returns error with an invalid quizId', () => {
  //   expect(quizRemoveV1(userId.authUserId, quizId.quizId + 1)).toStrictEqual(ERROR);
  // });

  // test('returns error for requesting info about a quiz not owned by the user', () => {
  //   const userId2 = authRegisterV1('johnsmith@gmail.com', 'hashed_password2', 'John', 'Smith');
  //   expect(quizRemoveV1(userId2.authUserId, quizId.quizId)).toStrictEqual(ERROR);
  // });

  // test('owner of one quiz removes their quiz, and creates their quiz again', () => {
  //   const emptyResult = {
  //     quizzes: []
  //   };

  //   const result = {
  //     quizzes: [
  //       {
  //         quizId: expect.any(Number),
  //         name: QUIZNAME1
  //       }
  //     ]
  //   };

  //   quizRemoveV1(userId.authUserId, quizId.quizId);
  //   expect(quizListV1(userId.authUserId)).toStrictEqual(emptyResult);
  //   quizCreateV1(userId.authUserId, QUIZNAME1, QUIZDESCRIPTION1);
  //   expect(quizListV1(userId.authUserId)).toStrictEqual(result);
  // });

  // test('owner of one quiz removes their quiz, and second user recreates their quiz for themselves', () => {
  //   const userId2 = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast);

  //   const emptyResult = {
  //     quizzes: []
  //   };

  //   const result = {
  //     quizzes: [
  //       {
  //         quizId: expect.any(Number),
  //         name: QUIZNAME1
  //       }
  //     ]
  //   };
  //   expect(quizListV1(userId.authUserId)).toStrictEqual(result);
  //   quizRemoveV1(userId.authUserId, quizId.quizId);
  //   expect(quizListV1(userId.authUserId)).toStrictEqual(emptyResult);
  //   quizCreateV1(userId2.authUserId, QUIZNAME1, QUIZDESCRIPTION1);
  //   expect(quizListV1(userId2.authUserId)).toStrictEqual(result);
  // });

  // test('two owners of two quizzes each remove one of each of their quizzes',
  //   () => {
  //     const userId2 = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast);
  //     const quizId2 = quizCreateV1(userId.authUserId, QUIZNAME2, QUIZDESCRIPTION2);
  //     const quizId3 = quizCreateV1(userId2.authUserId, QUIZNAME3, QUIZDESCRIPTION3);
  //     const quizId4 = quizCreateV1(userId2.authUserId, QUIZNAME4, QUIZDESCRIPTION4);

  //     const result1 = {
  //       quizzes: [
  //         {
  //           quizId: quizId2.quizId,
  //           name: QUIZNAME2
  //         }
  //       ]
  //     };

  //     const result2 = {
  //       quizzes: [
  //         {
  //           quizId: quizId4.quizId,
  //           name: QUIZNAME4
  //         }
  //       ]
  //     };

  //     quizRemoveV1(userId.authUserId, quizId.quizId);
  //     quizRemoveV1(userId2.authUserId, quizId3.quizId);

  //     expect(quizListV1(userId.authUserId)).toStrictEqual(result1);
  //     expect(quizListV1(userId2.authUserId)).toStrictEqual(result2);
  //   });
});

describe('Testing GET /v1/admin/quiz/{quizid}', () => {
  // let userId;
  // let quizId;

  // beforeEach(() => {
  //   userId = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast);
  //   quizId = quizCreateV1(userId.authUserId, QUIZNAME1, QUIZDESCRIPTION1);
  // });

  // test('returns error with an invalid userId', () => {
  //   expect(quizInfoV1(userId.authUserId + 1, quizId.quizId)).toStrictEqual(ERROR);
  // });

  // test('returns error with an invalid quizId', () => {
  //   expect(quizInfoV1(userId.authUserId, quizId.quizId + 1)).toStrictEqual(ERROR);
  // });

  // test('returns error for requesting info about a quiz not owned by the user', () => {
  //   const userId2 = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast);
  //   expect(quizInfoV1(userId2.authUserId, quizId.quizId)).toStrictEqual(ERROR);
  // });

  // test('returning info of one quiz created by one user', () => {
  //   const returnObject = {
  //     quizId: quizId.quizId,
  //     name: QUIZNAME1,
  //     timeCreated: expect.any(Number),
  //     timeLastEdited: expect.any(Number),
  //     description: QUIZDESCRIPTION1,
  //   };
  //   expect(quizInfoV1(userId.authUserId, quizId.quizId)).toStrictEqual(returnObject);
  // });

  // test('returning info of second quiz created by second user', () => {
  //   const userId2 = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast);
  //   const quizId2 = quizCreateV1(userId2.authUserId, QUIZNAME2, QUIZDESCRIPTION2);

  //   const returnObject = {
  //     quizId: quizId2.quizId,
  //     name: QUIZNAME2,
  //     timeCreated: expect.any(Number),
  //     timeLastEdited: expect.any(Number),
  //     description: QUIZDESCRIPTION2,
  //   };

  //   expect(quizInfoV1(userId2.authUserId, quizId2.quizId)).toStrictEqual(returnObject);
  // });
});

describe('Testing PUT /v1/admin/quiz/{quizid}/name', () => {
  // let userId;
  // let quizId;
  // beforeEach(() => {
  //   const user = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast);
  //   userId = user.authUserId;
  //   const quiz = quizCreateV1(userId, QUIZNAME1, QUIZDESCRIPTION1);
  //   quizId = quiz.quizId;
  // });

  // test('returns an object with the updated name on success', () => {
  //   quizNameUpdateV1(userId, quizId, QUIZNAME2);
  //   const result = quizInfoV1(userId, quizId);
  //   expect(result.name).toStrictEqual(QUIZNAME2);
  // });

  // test('returns error with an invalid userId', () => {
  //   const result = quizNameUpdateV1(userId + 1, quizId, QUIZNAME2);
  //   expect(result).toStrictEqual(ERROR);
  // });

  // test('returns error with an invalid quizId', () => {
  //   const result = quizNameUpdateV1(userId, quizId + 1, QUIZNAME2);
  //   expect(result).toStrictEqual(ERROR);
  // });

  // test('returns error with a quizId not owned by user', () => {
  //   const user2 = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast);
  //   const userId2 = user2.authUserId;
  //   const quiz2 = quizCreateV1(userId2, QUIZNAME1, QUIZDESCRIPTION1);
  //   const quizId2 = quiz2.quizId;
  //   const result = quizNameUpdateV1(userId, quizId2, QUIZNAME2);
  //   expect(result).toStrictEqual(ERROR);
  // });

  // test('returns error when name contains invalid characters', () => {
  //   const result = quizNameUpdateV1(userId, quizId, INVALIDQUIZNAME1);
  //   expect(result).toStrictEqual(ERROR);
  // });

  // test('returns error when name is empty', () => {
  //   const result = quizNameUpdateV1(userId, quizId, '');
  //   expect(result).toStrictEqual(ERROR);
  // });

  // test('returns error when name is less than 3 characters', () => {
  //   const result = quizNameUpdateV1(userId, quizId, 'Q');
  //   expect(result).toStrictEqual(ERROR);
  // });

  // test('returns error when name is more than 30 characters', () => {
  //   const longName = 'Q'.repeat(31);
  //   const result = quizNameUpdateV1(userId, quizId, longName);
  //   expect(result).toStrictEqual(ERROR);
  // });

  // test('returns error when name is already used for another quiz', () => {
  //   quizCreateV1(userId, QUIZNAME2, QUIZDESCRIPTION1);
  //   const result = quizNameUpdateV1(userId, quizId, QUIZNAME2);
  //   expect(result).toStrictEqual(ERROR);
  // });
});

describe('Testing PUT /v1/admin/quiz/{quizid}/description', () => {
  // let userId;
  // let quizId;
  // beforeEach(() => {
  //   const user = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast);
  //   userId = user.authUserId;
  //   const quiz = quizCreateV1(userId, QUIZNAME1, QUIZDESCRIPTION1);
  //   quizId = quiz.quizId;
  // });

  // test('returns an object with the updated description on success', () => {
  //   quizDescriptionUpdateV1(userId, quizId, QUIZDESCRIPTION2);
  //   const result = quizInfoV1(userId, quizId);
  //   expect(result.description).toStrictEqual(QUIZDESCRIPTION2);
  // });

  // test('returns error with an invalid userId', () => {
  //   const result = quizDescriptionUpdateV1(userId + 1, quizId, QUIZDESCRIPTION2);
  //   expect(result).toStrictEqual(ERROR);
  // });

  // test('returns error with an invalid quizId', () => {
  //   const result = quizDescriptionUpdateV1(userId, quizId + 1, QUIZDESCRIPTION2);
  //   expect(result).toStrictEqual(ERROR);
  // });

  // test('returns error with a quizId not owned by user', () => {
  //   const user2 = authRegisterV1(user2.email, user2.password, user2.nameFirst, user2.nameLast);
  //   const userId2 = user2.authUserId;
  //   const quiz2 = quizCreateV1(userId2, QUIZNAME1, QUIZDESCRIPTION1);
  //   const quizId2 = quiz2.quizId;
  //   const result = quizDescriptionUpdateV1(userId, quizId2, QUIZDESCRIPTION2);
  //   expect(result).toStrictEqual(ERROR);
  // });

  // test('returns error when description is more than 100 characters', () => {
  //   const longDescription = 'Q'.repeat(101);
  //   const result = quizDescriptionUpdateV1(userId, quizId, longDescription);
  //   expect(result).toStrictEqual(ERROR);
  // });
});
