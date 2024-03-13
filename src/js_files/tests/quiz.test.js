// Tests for the quiz.js module
import {
  adminQuizList,
  adminQuizCreate,
  adminQuizRemove,
  adminQuizInfo,
  adminQuizNameUpdate,
  adminQuizDescriptionUpdate,
} from '../quiz.js';

import {
  adminAuthRegister,
} from '../auth.js';

import { clear } from '../other.js';

const ERROR = { error: expect.any(String) };

const USER1 = {
  email: 'janedoe@gmail.com',
  password: 'hashed_password1',
  nameFirst: 'Jane',
  nameLast: 'Doe',
};

const USER2 = {
  email: 'johncitizen@gmail.com',
  password: 'hashed_password1',
  nameFirst: 'John',
  nameLast: 'Citizen'
};

const QUIZNAME1 = 'Quiz 1';

const QUIZNAME2 = 'Quiz 2';

const QUIZNAME3 = 'Quiz 3';

const QUIZNAME4 = 'Quiz 4';

const INVALIDQUIZNAME1 = 'Quiz 1&!';

const QUIZDESCRIPTION1 = 'This is a quiz';

const QUIZDESCRIPTION2 = 'This is a new description';

const QUIZDESCRIPTION3 = 'This is a new description twice';

const QUIZDESCRIPTION4 = 'This is a new description thrice';

beforeEach(() => {
  clear();
});

afterEach(() => {
  clear();
});

describe('testing adminQuizList', () => {
  let userId;

  beforeEach(() => {
    userId = adminAuthRegister(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast);
  });

  test('returns error with an invalid userId', () => {
    expect(adminQuizList(userId.authUserId + 1)).toStrictEqual(ERROR);
  });

  test('returns an object with an empty array when the user has no quizzes', () => {
    expect(adminQuizList(userId.authUserId)).toStrictEqual({ quizzes: [] });
  });

  test('returns an object with an array of the user\'s one quiz', () => {
    const quizId = adminQuizCreate(userId.authUserId, QUIZNAME1, QUIZDESCRIPTION1);

    const result = {
      quizzes: [
        {
          quizId: quizId.quizId,
          name: QUIZNAME1
        }
      ]
    };

    expect(adminQuizList(userId.authUserId)).toStrictEqual(result);
  });

  test('first returns an object with an empty array when first user has no quiz, then an object with three quizzes in an array for second user', () => {
    const userId2 = adminAuthRegister(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast);

    const quizId = adminQuizCreate(userId2.authUserId, QUIZNAME1, QUIZDESCRIPTION1);
    const quizId2 = adminQuizCreate(userId2.authUserId, QUIZNAME2, QUIZDESCRIPTION2);
    const quizId3 = adminQuizCreate(userId2.authUserId, QUIZNAME3, QUIZDESCRIPTION3);

    const result = {
      quizzes: [
        {
          quizId: quizId.quizId,
          name: QUIZNAME1
        },
        {
          quizId: quizId2.quizId,
          name: QUIZNAME2
        },
        {
          quizId: quizId3.quizId,
          name: QUIZNAME3
        }
      ]
    };
    expect(adminQuizList(userId.authUserId)).toStrictEqual({ quizzes: [] });
    expect(adminQuizList(userId2.authUserId)).toStrictEqual(result);
  });

  test('returns an object with an an array of a second user\'s two quizzes', () => {
    const userId2 = adminAuthRegister(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast);

    const quizId2 = adminQuizCreate(userId2.authUserId, QUIZNAME2, QUIZDESCRIPTION2);
    const quizId3 = adminQuizCreate(userId2.authUserId, QUIZNAME3, QUIZDESCRIPTION3);

    const result = {
      quizzes: [
        {
          quizId: quizId2.quizId,
          name: QUIZNAME2
        },
        {
          quizId: quizId3.quizId,
          name: QUIZNAME3
        },
      ]
    };

    expect(adminQuizList(userId2.authUserId)).toStrictEqual(result);
  });
});

describe('testing adminQuizCreate', () => {
  const quiz = {
    name: 'Quiz 1',
    description: 'This is a quiz',
  };

  let userId;
  beforeEach(() => {
    const user = adminAuthRegister('janedoe@gmail.com', 'hashed_password1', 'Jane', 'Doe');
    userId = user.authUserId;
  });

  test('returns an object with "quizId" key on success', () => {
    const result = adminQuizCreate(userId, quiz.name, quiz.description);
    expect(result).toStrictEqual({ quizId: expect.any(Number) });
  });

  test('does not return the same quizId for two different quizzes', () => {
    const result1 = adminQuizCreate(userId, quiz.name, quiz.description);
    const result2 = adminQuizCreate(userId, 'Quiz 2', 'This is another quiz');
    expect(result1.quizId).not.toStrictEqual(result2.quizId);
  });

  test('returns error with an invalid userId', () => {
    const result = adminQuizCreate(userId + 1, quiz.name, quiz.description);
    expect(result).toStrictEqual(ERROR);
  });

  test('returns error when name contains invalid characters', () => {
    const result = adminQuizCreate(userId, 'Quiz 1&!', quiz.description);
    expect(result).toStrictEqual(ERROR);
  });

  test('returns error when name is empty', () => {
    const result = adminQuizCreate(userId, '', quiz.description);
    expect(result).toStrictEqual(ERROR);
  });

  test('returns error when name is less than 3 characters', () => {
    const result = adminQuizCreate(userId, 'Q', quiz.description);
    expect(result).toStrictEqual(ERROR);
  });

  test('returns error when name is more than 30 characters', () => {
    const longName = 'Q'.repeat(31);
    const result = adminQuizCreate(userId, longName, quiz.description);
    expect(result).toStrictEqual(ERROR);
  });

  test('returns error when name is already used for another quiz', () => {
    adminQuizCreate(userId, quiz.name, quiz.description);
    const result = adminQuizCreate(userId, quiz.name, quiz.description);
    expect(result).toStrictEqual(ERROR);
  });

  test('returns error when description is more than 100 characters', () => {
    const longDescription = 'Q'.repeat(101);
    const result = adminQuizCreate(userId, quiz.name, longDescription);
    expect(result).toStrictEqual(ERROR);
  });
});

describe('testing adminQuizRemove', () => {
  // TODO
  let userId;
  let quizId;

  beforeEach(() => {
    userId = adminAuthRegister(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast);
    quizId = adminQuizCreate(userId.authUserId, QUIZNAME1, QUIZDESCRIPTION1);
  });

  test('returns error with an invalid userId', () => {
    expect(adminQuizRemove(userId.authUserId + 1, quizId.quizId)).toStrictEqual(ERROR);
  });

  test('returns error with an invalid quizId', () => {
    expect(adminQuizRemove(userId.authUserId, quizId.quizId + 1)).toStrictEqual(ERROR);
  });

  test('returns error for requesting info about a quiz not owned by the user', () => {
    const userId2 = adminAuthRegister('johnsmith@gmail.com', 'hashed_password2', 'John', 'Smith');
    expect(adminQuizRemove(userId2.authUserId, quizId.quizId)).toStrictEqual(ERROR);
  });

  test('owner of one quiz removes their quiz, and creates their quiz again', () => {
    const emptyResult = {
      quizzes: []
    };

    const result = {
      quizzes: [
        {
          quizId: expect.any(Number),
          name: QUIZNAME1
        }
      ]
    };

    adminQuizRemove(userId.authUserId, quizId.quizId);
    expect(adminQuizList(userId.authUserId)).toStrictEqual(emptyResult);
    adminQuizCreate(userId.authUserId, QUIZNAME1, QUIZDESCRIPTION1);
    expect(adminQuizList(userId.authUserId)).toStrictEqual(result);
  });

  test('owner of one quiz removes their quiz, and second user recreates their quiz for themselves', () => {
    const userId2 = adminAuthRegister(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast);

    const emptyResult = {
      quizzes: []
    };

    const result = {
      quizzes: [
        {
          quizId: expect.any(Number),
          name: QUIZNAME1
        }
      ]
    };
    expect(adminQuizList(userId.authUserId)).toStrictEqual(result);
    adminQuizRemove(userId.authUserId, quizId.quizId);
    expect(adminQuizList(userId.authUserId)).toStrictEqual(emptyResult);
    adminQuizCreate(userId2.authUserId, QUIZNAME1, QUIZDESCRIPTION1);
    expect(adminQuizList(userId2.authUserId)).toStrictEqual(result);
  });

  test('two owners of two quizzes each remove one of each of their quizzes',
    () => {
      const userId2 = adminAuthRegister(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast);
      const quizId2 = adminQuizCreate(userId.authUserId, QUIZNAME2, QUIZDESCRIPTION2);
      const quizId3 = adminQuizCreate(userId2.authUserId, QUIZNAME3, QUIZDESCRIPTION3);
      const quizId4 = adminQuizCreate(userId2.authUserId, QUIZNAME4, QUIZDESCRIPTION4);

      const result1 = {
        quizzes: [
          {
            quizId: quizId2.quizId,
            name: QUIZNAME2
          }
        ]
      };

      const result2 = {
        quizzes: [
          {
            quizId: quizId4.quizId,
            name: QUIZNAME4
          }
        ]
      };

      adminQuizRemove(userId.authUserId, quizId.quizId);
      adminQuizRemove(userId2.authUserId, quizId3.quizId);

      expect(adminQuizList(userId.authUserId)).toStrictEqual(result1);
      expect(adminQuizList(userId2.authUserId)).toStrictEqual(result2);
    });
});

describe('testing adminQuizInfo', () => {
  // TODO
  let userId;
  let quizId;

  beforeEach(() => {
    userId = adminAuthRegister(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast);
    quizId = adminQuizCreate(userId.authUserId, QUIZNAME1, QUIZDESCRIPTION1);
  });

  test('returns error with an invalid userId', () => {
    expect(adminQuizInfo(userId.authUserId + 1, quizId.quizId)).toStrictEqual(ERROR);
  });

  test('returns error with an invalid quizId', () => {
    expect(adminQuizInfo(userId.authUserId, quizId.quizId + 1)).toStrictEqual(ERROR);
  });

  test('returns error for requesting info about a quiz not owned by the user', () => {
    const userId2 = adminAuthRegister(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast);
    expect(adminQuizInfo(userId2.authUserId, quizId.quizId)).toStrictEqual(ERROR);
  });

  test('returning info of one quiz created by one user', () => {
    const returnObject = {
      quizId: quizId.quizId,
      name: QUIZNAME1,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: QUIZDESCRIPTION1,
    };
    expect(adminQuizInfo(userId.authUserId, quizId.quizId)).toStrictEqual(returnObject);
  });

  test('returning info of second quiz created by second user', () => {
    const userId2 = adminAuthRegister(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast);
    const quizId2 = adminQuizCreate(userId2.authUserId, QUIZNAME2, QUIZDESCRIPTION2);

    const returnObject = {
      quizId: quizId2.quizId,
      name: QUIZNAME2,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: QUIZDESCRIPTION2,
    };

    expect(adminQuizInfo(userId2.authUserId, quizId2.quizId)).toStrictEqual(returnObject);
  });
});

describe('testing adminQuizNameUpdate', () => {
  let userId;
  let quizId;
  beforeEach(() => {
    const user = adminAuthRegister(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast);
    userId = user.authUserId;
    const quiz = adminQuizCreate(userId, QUIZNAME1, QUIZDESCRIPTION1);
    quizId = quiz.quizId;
  });

  test('returns an object with the updated name on success', () => {
    adminQuizNameUpdate(userId, quizId, QUIZNAME2);
    const result = adminQuizInfo(userId, quizId);
    expect(result.name).toStrictEqual(QUIZNAME2);
  });

  test('returns error with an invalid userId', () => {
    const result = adminQuizNameUpdate(userId + 1, quizId, QUIZNAME2);
    expect(result).toStrictEqual(ERROR);
  });

  test('returns error with an invalid quizId', () => {
    const result = adminQuizNameUpdate(userId, quizId + 1, QUIZNAME2);
    expect(result).toStrictEqual(ERROR);
  });

  test('returns error with a quizId not owned by user', () => {
    const user2 = adminAuthRegister(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast);
    const userId2 = user2.authUserId;
    const quiz2 = adminQuizCreate(userId2, QUIZNAME1, QUIZDESCRIPTION1);
    const quizId2 = quiz2.quizId;
    const result = adminQuizNameUpdate(userId, quizId2, QUIZNAME2);
    expect(result).toStrictEqual(ERROR);
  });

  test('returns error when name contains invalid characters', () => {
    const result = adminQuizNameUpdate(userId, quizId, INVALIDQUIZNAME1);
    expect(result).toStrictEqual(ERROR);
  });

  test('returns error when name is empty', () => {
    const result = adminQuizNameUpdate(userId, quizId, '');
    expect(result).toStrictEqual(ERROR);
  });

  test('returns error when name is less than 3 characters', () => {
    const result = adminQuizNameUpdate(userId, quizId, 'Q');
    expect(result).toStrictEqual(ERROR);
  });

  test('returns error when name is more than 30 characters', () => {
    const longName = 'Q'.repeat(31);
    const result = adminQuizNameUpdate(userId, quizId, longName);
    expect(result).toStrictEqual(ERROR);
  });

  test('returns error when name is already used for another quiz', () => {
    adminQuizCreate(userId, QUIZNAME2, QUIZDESCRIPTION1);
    const result = adminQuizNameUpdate(userId, quizId, QUIZNAME2);
    expect(result).toStrictEqual(ERROR);
  });
});

describe('testing adminQuizDescriptionUpdate', () => {
  let userId;
  let quizId;
  beforeEach(() => {
    const user = adminAuthRegister(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast);
    userId = user.authUserId;
    const quiz = adminQuizCreate(userId, QUIZNAME1, QUIZDESCRIPTION1);
    quizId = quiz.quizId;
  });

  test('returns an object with the updated description on success', () => {
    adminQuizDescriptionUpdate(userId, quizId, QUIZDESCRIPTION2);
    const result = adminQuizInfo(userId, quizId);
    expect(result.description).toStrictEqual(QUIZDESCRIPTION2);
  });

  test('returns error with an invalid userId', () => {
    const result = adminQuizDescriptionUpdate(userId + 1, quizId, QUIZDESCRIPTION2);
    expect(result).toStrictEqual(ERROR);
  });

  test('returns error with an invalid quizId', () => {
    const result = adminQuizDescriptionUpdate(userId, quizId + 1, QUIZDESCRIPTION2);
    expect(result).toStrictEqual(ERROR);
  });

  test('returns error with a quizId not owned by user', () => {
    const user2 = adminAuthRegister(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast);
    const userId2 = user2.authUserId;
    const quiz2 = adminQuizCreate(userId2, QUIZNAME1, QUIZDESCRIPTION1);
    const quizId2 = quiz2.quizId;
    const result = adminQuizDescriptionUpdate(userId, quizId2, QUIZDESCRIPTION2);
    expect(result).toStrictEqual(ERROR);
  });

  test('returns error when description is more than 100 characters', () => {
    const longDescription = 'Q'.repeat(101);
    const result = adminQuizDescriptionUpdate(userId, quizId, longDescription);
    expect(result).toStrictEqual(ERROR);
  });
});
