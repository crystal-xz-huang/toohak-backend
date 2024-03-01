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
    // TODO
});

describe('testing adminQuizCreate', () => {
    // TODO
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