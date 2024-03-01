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
});

describe('testing adminQuizNameUpdate', () => {
    // TODO
});

describe('testing adminQuizDescriptionUpdate', () => {
    // TODO
});