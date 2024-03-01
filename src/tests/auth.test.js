/**
 * NOTE: This file is for testing the admin auth related functions.
 * We can finalise the file once everyone has finished their tests and make sure the tests are consistent
 * and do not conflict or overlap with each other.
 * I imported all the functions in case they are needed for testing side effects.
 */

import {
    adminAuthRegister,
    adminAuthLogin,
    adminUserDetails,
    adminUserDetailsUpdate,
    adminUserPasswordUpdate,
} from '../auth';

import {
    adminQuizList,
    adminQuizCreate,
    adminQuizRemove,
    adminQuizInfo,
    adminQuizNameUpdate,
    adminQuizDescriptionUpdate,
} from '../quiz';

import { clear } from '../other';

const ERROR = { error: expect.any(String) };

beforeEach(() => {
    clear();
});

describe('testing adminAuthRegister', () => {
    // TODO
});

describe('testing adminAuthLogin', () => {
    // TODO
});

describe('testing adminUserDetails', () => {
    // TODO
});

describe('testing adminUserDetailsUpdate', () => {
    // TODO
});

describe('testing adminUserPasswordUpdate', () => {
    // TODO
});