import {
  clearV1,
  authRegisterV1,
  quizCreateV1,
  authLoginV1,
  authLogoutV1,
  userDetailsV1,
  userDetailsUpdateV1,
  userPasswordUpdateV1,
  quizListV1,
  quizInfoV1,
  quizRemoveV1,
  quizNameUpdateV1,
  quizDescriptionUpdateV1,
  quizTrashViewV1,
  quizRestoreV1,
  quizTrashEmptyV1,
  quizTransferV1,
  quizQuestionCreateV1,
  quizQuestionUpdateV1,
  quizQuestionRemoveV1,
  quizQuestionMoveV1,
  quizQuestionDuplicateV1,
} from '../testHelpers';

import {
  CLEAR_SUCCESS,
  BAD_REQUEST_ERROR,
  UNAUTHORISED_ERROR,
  user1,
  quiz1,
  validQuestion1,
} from '../testTypes';

beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

describe('Testing DELETE /v1/clear', () => {
  test('Correct status code and return value', () => {
    expect(clearV1()).toStrictEqual(CLEAR_SUCCESS);
  });

  describe('Resets the state of the application back to the start', () => {
    let quizID: number;
    let token: string;
    let questionID: number;
    beforeEach(() => {
      token = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody.token;
      quizID = quizCreateV1(token, quiz1.name, quiz1.description).jsonBody.quizId;
      questionID = quizQuestionCreateV1(token, quizID, validQuestion1).jsonBody.questionId;
    });

    describe('All registered users are removed', () => {
      test('POST /v1/admin/auth/login should return an error after clear is called', () => {
        clearV1();
        expect(authLoginV1(user1.email, user1.password)).toStrictEqual(BAD_REQUEST_ERROR);
      });

      test('POST /v1/admin/auth/logout should return an error after clear is called', () => {
        clearV1();
        expect(authLogoutV1(token)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('GET /v1/admin/user/details should return an error after clear is called', () => {
        clearV1();
        expect(userDetailsV1(token)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('PUT /v1/admin/user/details should return an error after clear is called', () => {
        clearV1();
        expect(userDetailsUpdateV1(token, user1.email, user1.nameFirst, user1.nameLast)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('PUT /v1/admin/user/password should return an error after clear is called', () => {
        clearV1();
        expect(userPasswordUpdateV1(token, user1.password, 'password123')).toStrictEqual(UNAUTHORISED_ERROR);
      });
    });

    describe('All registered quizzes are removed', () => {
      test('GET /v1/admin/quiz/list should return an error after clear is called', () => {
        clearV1();
        expect(quizListV1(token)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('GET /v1/admin/quiz/{quizid} should return an error after clear is called', () => {
        clearV1();
        expect(quizInfoV1(token, quizID)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('DELETE /v1/admin/quiz/{quidid} should return an error after clear is called', () => {
        clearV1();
        expect(quizRemoveV1(token, quizID)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('PUT /v1/admin/quiz/{quizid}/name should return an error after clear is called', () => {
        clearV1();
        expect(quizNameUpdateV1(token, quizID, quiz1.name)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('PUT /v1/admin/quiz/{quizid}/description should return an error after clear is called', () => {
        clearV1();
        expect(quizDescriptionUpdateV1(token, quizID, quiz1.description)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('GET /v1/admin/quiz/trash should return an error after clear is called', () => {
        clearV1();
        expect(quizTrashViewV1(token)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('POST /v1/admin/quiz/{quizid}/restore should return an error after clear is called', () => {
        clearV1();
        expect(quizRestoreV1(token, quizID)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('DELETE /v1/admin/quiz/trash/empty should return an error after clear is called', () => {
        clearV1();
        expect(quizTrashEmptyV1(token, [quizID])).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('POST /v1/admin/quiz/{quizid}/transfer should return an error after clear is called', () => {
        clearV1();
        expect(quizTransferV1(token, quizID, user1.email)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('POST /v1/admin/quiz/{quizid}/question should return an error after clear is called', () => {
        clearV1();
        expect(quizQuestionCreateV1(token, quizID, validQuestion1)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('PUT /v1/admin/quiz/{quizid}/question/{questionid} should return an error after clear is called', () => {
        clearV1();
        expect(quizQuestionUpdateV1(token, quizID, 1, validQuestion1)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('DELETE /v1/admin/quiz/{quizid}/question/{questionid} should return an error after clear is called', () => {
        clearV1();
        expect(quizQuestionRemoveV1(token, quizID, questionID)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('PUT /v1/admin/quiz/{quizid}/question/{questionid}/move should return an error after clear is called', () => {
        clearV1();
        expect(quizQuestionMoveV1(token, quizID, questionID, 1)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('POST /v1/admin/quiz/{quizid}/question/{questionid}/duplicate should return an error after clear is called', () => {
        clearV1();
        expect(quizQuestionDuplicateV1(token, quizID, questionID)).toStrictEqual(UNAUTHORISED_ERROR);
      });
    });
  });
});
