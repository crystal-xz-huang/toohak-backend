import { clear } from '../other';

import {
  adminAuthRegister,
  adminAuthLogin,
  adminUserDetails,
  adminUserDetailsUpdate,
  adminUserPasswordUpdate,
} from '../auth';

import {
  adminQuizCreate,
  adminQuizList,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
} from '../quiz';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
  clear();
});

afterEach(() => {
  clear();
});

const user = {
  email: 'janedoe@gmail.com',
  password: 'hashed_passedword1',
  nameFirst: 'Jane',
  nameLast: 'Doe',
};

const quiz = {
  name: 'Quiz 1',
  description: 'This is a quiz',
};

describe('testing clear', () => {
  test('returns an empty object', () => {
    expect(clear()).toStrictEqual({});
  });

  describe('resets the state of the application back to the start', () => {
    let quizID, userID;
    beforeEach(() => {
      userID = adminAuthRegister(user.email, user.password, user.nameFirst, user.nameLast).authUserId;
      quizID = adminQuizCreate(userID, quiz.name, quiz.description).quizId;
    });

    describe('clear should remove all registered users', () => {
      test('adminAuthLogin should return an error after clear is called', () => {
        clear();
        expect(adminAuthLogin(user.email, user.password)).toStrictEqual(ERROR);
      });

      test('adminUserDetails should return an error after clear is called', () => {
        clear();
        expect(adminUserDetails(userID)).toStrictEqual(ERROR);
      });

      test('adminUserDetailsUpdate should return an error after clear is called', () => {
        clear();
        expect(adminUserDetailsUpdate(userID, user.email, user.nameFirst, user.nameLast)).toStrictEqual(ERROR);
      });

      test('adminUserPasswordUpdate should return an error after clear is called', () => {
        clear();
        expect(adminUserPasswordUpdate(userID, user.password, 'password123')).toStrictEqual(ERROR);
      });
    });

    describe('clear should remove all registered quizzes', () => {
      test('adminQuizList should return an error after clear is called', () => {
        clear();
        expect(adminQuizList(userID)).toStrictEqual(ERROR);
      });

      test('adminQuizInfo should return an error after clear is called', () => {
        clear();
        expect(adminQuizInfo(userID, quizID)).toStrictEqual(ERROR);
      });

      test('adminQuizNameUpdate should return an error after clear is called', () => {
        clear();
        expect(adminQuizNameUpdate(userID, quizID, quiz.name)).toStrictEqual(ERROR);
      });

      test('adminQuizDescriptionUpdate should return an error after clear is called', () => {
        clear();
        expect(adminQuizDescriptionUpdate(userID, quizID, quiz.description)).toStrictEqual(ERROR);
      });
    });
  });
});
