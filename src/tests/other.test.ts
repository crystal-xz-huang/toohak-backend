import {
  clearV1,
  authRegisterV1,
  quizCreateV1,
  // authLoginV1,
  // userDetailsV1,
  // userDetailsUpdateV1,
  // userPasswordUpdateV1,
  // quizListV1,
  // quizInfoV1,
  // quizNameUpdateV1,
  // quizDescriptionUpdateV1,
} from '../testHelpers';

import { ERROR, CLEAR_SUCCESS, user1, quiz1 } from '../testTypes';

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

  // describe('Resets the state of the application back to the start', () => {
  //   let quizID: number;
  //   let token: string;
  //   beforeEach(() => {
  //     token = authRegisterV1(user1.email, user1.password, user1.nameFirst, user1.nameLast).jsonBody.token;
  //     quizID = quizCreateV1(token, quiz1.name, quiz1.description).jsonBody.quizId;
  //   });

  //   describe('All registered users are removed', () => {
  //     test('POST /v1/admin/auth/login should return an error after clear is called', () => {
  //       clearV1();
  //       expect(authLoginV1(user1.email, user1.password)).toStrictEqual(ERROR);
  //     });

  //     test('GET /v1/admin/user/details should return an error after clear is called', () => {
  //       clearV1();
  //       expect(userDetailsV1(token)).toStrictEqual(ERROR);
  //     });

  //     test('PUT /v1/admin/user/details should return an error after clear is called', () => {
  //       clearV1();
  //       expect(userDetailsUpdateV1(token, user1.email, user1.nameFirst, user1.nameLast)).toStrictEqual(ERROR);
  //     });

  //     test('PUT /v1/admin/user/password should return an error after clear is called', () => {
  //       clearV1();
  //       expect(userPasswordUpdateV1(token, user1.password, 'password123')).toStrictEqual(ERROR);
  //     });
  //   });

  //   describe('clear should remove all registered quizzes', () => {
  //     test('GET /v1/admin/quiz/list should return an error after clear is called', () => {
  //       clearV1();
  //       expect(quizListV1(token)).toStrictEqual(ERROR);
  //     });

  //     test('quizInfoV1 should return an error after clear is called', () => {
  //       clearV1();
  //       expect(quizInfoV1(token, quizID)).toStrictEqual(ERROR);
  //     });

  //     test('quizNameUpdateV1 should return an error after clear is called', () => {
  //       clearV1();
  //       expect(quizNameUpdateV1(token, quizID, quiz1.name)).toStrictEqual(ERROR);
  //     });

  //     test('quizDescriptionUpdateV1 should return an error after clear is called', () => {
  //       clearV1();
  //       expect(quizDescriptionUpdateV1(token, quizID, quiz1.description)).toStrictEqual(ERROR);
  //     });
  //   });
  // });
});
