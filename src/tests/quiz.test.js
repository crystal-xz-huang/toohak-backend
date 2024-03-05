/**
 * NOTE: This file is for testing the admin auth related functions.
 * We can finalise the file once everyone has finished their tests and make sure the tests are consistent
 * and do not conflict or overlap with each other and remove any unnecessary imports.
 * 
 * I imported all the functions in case they are needed for testing side effects.
 */

import {
    adminQuizList,
    adminQuizCreate,
    adminQuizRemove,
    adminQuizInfo,
    adminQuizNameUpdate,
    adminQuizDescriptionUpdate,
} from '../quiz';

import {
    adminAuthRegister,
    adminAuthLogin,
    adminUserDetails,
    adminUserDetailsUpdate,
    adminUserPasswordUpdate,
} from '../auth';

import { clear } from '../other';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clear();
});

afterEach(() => {
    clear();
});

describe('testing adminQuizList', () => {
    // TODO - 
    // check the return value on success
    // check if after adminAuthRegister and adminQuizCreate, the quiz is in the list for the user
});

describe('testing adminQuizCreate', () => {
    const quiz = {
        name: 'Quiz 1',
        description: 'This is a quiz',
    };

    let userId;
    beforeEach(() => {
        let user = adminAuthRegister('janedoe@gmail.com', 'hashed_password1', 'Jane', 'Doe');
        userId = user.authUserId;
    });

    test('returns an object with "quizId" key on success', () => {
        let result = adminQuizCreate(userId, quiz.name, quiz.description);
        expect(result).toStrictEqual({ quizId: expect.any(Number) });
    });

    test('returns error with an invalid userId', () => {
        let result = adminQuizCreate(userId + 1, quiz.name, quiz.description);
        expect(result).toStrictEqual(ERROR);
    });

    // Valid characters are alphanumeric and spaces.
    test('returns error when name contains invalid characters', () => {
        let result = adminQuizCreate(userId, 'Quiz 1&!', quiz.description);
        expect(result).toStrictEqual(ERROR);
    });

    test('returns error when name is empty', () => {
        let result = adminQuizCreate(userId, '', quiz.description);
        expect(result).toStrictEqual(ERROR);
    });

    test('returns error when name is less than 3 characters', () => {
        let result = adminQuizCreate(userId, 'Q', quiz.description);
        expect(result).toStrictEqual(ERROR);
    });

    test('returns error when name is more than 30 characters', () => {
        let longName = 'Q'.repeat(31); 
        let result = adminQuizCreate(userId, longName, quiz.description);
        expect(result).toStrictEqual(ERROR);
    });

    test('returns error when name is already used for another quiz', () => {
        adminQuizCreate(userId, quiz.name, quiz.description);
        let result = adminQuizCreate(userId, quiz.name, quiz.description);
        expect(result).toStrictEqual(ERROR);
    });

    test('returns error when description is more than 100 characters', () => {
        let longDescription = 'Q'.repeat(101);
        let result = adminQuizCreate(userId, quiz.name, longDescription);
        expect(result).toStrictEqual(ERROR);
    });
});

describe('testing adminQuizRemove', () => {
    // TODO
});

describe('testing adminQuizInfo', () => {
    // TODO
    let userId;
    let quizId;

    beforeEach(() => {
        userId = adminAuthRegister('janedoe@gmail.com', 'hashed_password1', 'Jane', 'Doe');
        quizId = adminQuizCreate(userId, 'Quiz 1', 'This is a quiz');
    })

    test('returns error with an invalid userId', () => {
        expect(adminQuizInfo(userId + 1, quizId)).toStrictEqual(ERROR);
    })

    test('returns error with an invalid quizId', () => {
        expect(adminQuizInfo(userId, quizId + 1)).toStrictEqual(ERROR);
    })

    test('returns error for requesting info about a quiz not owned by the user', () => {
        let userIdTwo = adminAuthRegister('johnsmith@gmail.com', 'hashed_password2', 'John', 'Smith');
        expect(adminQuizInfo(userIdTwo, quizId)).toStrictEqual(ERROR);
    })

    test('returning info of one quiz created by one user', () => {
        let returnObject = {
            quizId: quizId,
            name: 'Quiz 1',
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: 'This is a quiz',
        }
        expect(adminQuizInfo(userId, quizId)).toStrictEqual(returnObject);
    })

    test('returning info of second quiz created by second user', () => {
        let userIdTwo = adminAuthRegister('johnsmith@gmail.com', 'hashed_password2', 'John', 'Smith');
        let quizIdTwo = adminQuizCreate(userIdTwo, 'Quiz 2', 'This is a quizTwo');

        let returnObject = {
            quizId: quizIdTwo,
            name: 'Quiz 2',
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: 'This is a quizTwo',
        }

        expect(adminQuizInfo(userIdTwo, quizIdTwo)).toStrictEqual(returnObject);
    })
});

describe('testing adminQuizNameUpdate', () => {
    let userId;
    let quizId;
    beforeEach(() => {
        let user = adminAuthRegister('janedoe@gmail.com', 'hashed_password1', 'Jane', 'Doe');
        userId = user.authUserId;
        let quiz = adminQuizCreate(userId, 'Quiz 1', 'This is a quiz');
        quizId = quiz.quizId;
    });

    test('returns an object with the updated name on success', () => {
        adminQuizNameUpdate(userId, quizId, 'Quiz 2');
        let expected = {
            name: 'Quiz 2',
            quizId: 1,
        };
        expect(adminQuizList(userId)).toStrictEqual([expected]);
    });

    test('returns error with an invalid userId', () => {
        let result = adminQuizNameUpdate(userId + 1, quizId, 'Quiz 2');
        expect(result).toStrictEqual({'error': 'AuthUserId is not a valid user'});
    });

    test('returns error with an invalid quizId', () => {
        let result = adminQuizNameUpdate(userId, quizId + 1, 'Quiz 2');
        expect(result).toStrictEqual({'error': 'QuizId is not a valid quiz'});
    });

    test('returns error with a quizId not owned by user', () => {
        let user2 = adminAuthRegister('johncitizen@gmail.com', 'hashed_password1', 'John', 'Citizen');
        let userId2 = user2.authUserId;
        let quiz2 = adminQuizCreate(userId2, 'Quiz 2', 'This is a quiz');
        let quizId2 = quiz2.quizId;
        let result = adminQuizNameUpdate(userId, quizId2, 'Quiz 2');
        expect(result).toStrictEqual({'error': 'QuizId is not owned by user'});
    });

    test('returns error when name contains invalid characters', () => {
        let result = adminQuizNameUpdate(userId, quizId, 'Quiz 2&!');
        expect(result).toStrictEqual({'error': 'Name contains invalid characters'});
    });

    test('returns error when name is empty', () => {
        let result = adminQuizNameUpdate(userId, quizId, '');
        expect(result).toStrictEqual({'error': 'Name is empty'});
    });

    test('returns error when name is less than 3 characters', () => {
        let result = adminQuizNameUpdate(userId, quizId, 'Q');
        expect(result).toStrictEqual({'error': 'Name is less than 3 characters'});
    });

    test('returns error when name is more than 30 characters', () => {
        let longName = 'Q'.repeat(31); 
        let result = adminQuizNameUpdate(userId, quizId, longName);
        expect(result).toStrictEqual({'error': 'Name is more than 30 characters'});
    });

    test('returns error when name is already used for another quiz', () => {
        adminQuizCreate(userId, 'Quiz 2', 'This is a quiz');
        let result = adminQuizNameUpdate(userId, quizId, 'Quiz 2');
        expect(result).toStrictEqual({'error': 'Name is already used by another quiz'});
    });
});

describe('testing adminQuizDescriptionUpdate', () => {
    // TODO
});