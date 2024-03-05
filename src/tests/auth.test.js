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

afterEach(() => {
    clear();
});

describe('testing adminAuthRegister', () => {
    const user = {
        email: 'janedoe@gmail.com',
        password: 'hashed_password1',
        nameFirst: 'Jane',
        nameLast: 'Doe',
    };

    test('returns an object with "authUserId" key on success', () => {
        let result = adminAuthRegister(user.email, user.password, user.nameFirst, user.nameLast);
        expect(result).toStrictEqual({ authUserId: expect.any(Number) });
    });

    describe('returns error with an invalid email', () => {
        let invalidEmails = [
            {email: ''}, // empty email
            {email: 'example.com'},
            {email: 'example@'},
            {email: 'example@.com'},
            {email: '@gmail.com'},
            {email: 'user@gmail@gmail.com'},
            {email: 'email'},                
        ];

        // check that error is returned when email address is invalid 
        test.each(invalidEmails)("test invalid email '$#': '$email'", ({email}) => {
            expect(adminAuthRegister(email, user.password, user.nameFirst, user.nameLast)).toStrictEqual(ERROR);
        });

        // check that error is returned when email address is used by another user
        test('test already used email', () => {
            adminAuthRegister(user.email, user.password, user.nameFirst, user.nameLast);
            let result = adminAuthRegister(user.email, 'password2', 'John', 'Smith');
            expect(result).toStrictEqual(ERROR);
        });
    });  

    describe('returns error with an invalid first name', () => {
        test('test first name contains invalid characters', () => {
            expect(adminAuthRegister(user.email, user.password, 'Jane@.#7123', user.nameLast)).toStrictEqual(ERROR);
        });

        test('test first name is less than 2 characters', () => {
            expect(adminAuthRegister(user.email, user.password, 'J', user.nameLast)).toStrictEqual(ERROR);
        });

        test('test first name is empty', () => {
            expect(adminAuthRegister(user.email, user.password, '', user.nameLast)).toStrictEqual(ERROR);
        });

        test('test first name is more than 20 characters', () => {
            expect(adminAuthRegister(user.email, user.password, 'JaneJaneJaneJaneJaneJ', user.nameLast)).toStrictEqual(ERROR); 
        });
    });

    describe('returns error with an invalid last name', () => {
        test('test last name contains invalid characters', () => {
            expect(adminAuthRegister(user.email, user.password, user.nameFirst, 'Doe12*&^')).toStrictEqual(ERROR);
        });

        test('test last name is less than 2 characters', () => {
            expect(adminAuthRegister(user.email, user.password, user.nameFirst, 'D')).toStrictEqual(ERROR);
        });

        test('test last name is empty', () => {
            expect(adminAuthRegister(user.email, user.password, user.nameFirst, '')).toStrictEqual(ERROR);
        });

        test('test last name is more than 20 characters', () => {
            expect(adminAuthRegister(user.email, user.password, user.nameFirst, 'JaneJaneJaneJaneJaneJ')).toStrictEqual(ERROR); 
        });
    });

    describe('returns error with an invalid password', () => {
        let invalidPassword = [
            {password: '12345678'},
            {password: 'abcdefgh'},
        ]

        test('test password is less than 8 characters', () => {
            expect(adminAuthRegister(user.email, 'abc4567', user.nameFirst, user.nameLast)).toStrictEqual(ERROR);
        });

        test('test password is empty', () => {
            expect(adminAuthRegister(user.email, '', user.nameFirst, user.nameLast)).toStrictEqual(ERROR);
        });

        test.each(invalidPassword)("test password does not contain at least one number and one letter", ({passsword}) => {
            expect(adminAuthRegister(user.email, passsword, user.nameFirst, user.nameLast)).toStrictEqual(ERROR);
        });
    });
});

describe('testing adminAuthLogin', () => {
    const user = {
        email: 'johnsmith@gmail.com',
        password: 'hashed_password2',
        nameFirst: 'john',
        nameLast: 'smith',
    };

    let result;
    beforeEach(() => {
        result = adminAuthRegister(user.email, user.password, user.nameFirst, user.nameLast);
    });

    test('returns an object with the "authUserId" key when email and password is matched', () => {
        expect(adminAuthLogin(user.email, user.password)).toStrictEqual({ authUserId: result.authUserId });
    });

    test('returns an error object when email is invalid', () => {
        expect(adminAuthLogin('unregistered@gmail.com', user.password)).toStrictEqual(ERROR);
    });

    test('returns an error object when password is invalid', () => {
        expect(adminAuthLogin(user.email, 'incorrect_password')).toStrictEqual(ERROR);
    });
});

describe('testing adminUserDetails', () => {
    // TODO
});

describe('testing adminUserDetailsUpdate', () => {
    // TODO
});

describe('testing adminUserPasswordUpdate', () => {
    const user = {
        email: 'johnsmith@gmail.com',
        password: 'hashed_password2',
        nameFirst: 'john',
        nameLast: 'smith',
    };

    let result;
    beforeEach(() => {
        result = adminAuthRegister(user.email, user.password, user.nameFirst, user.nameLast);
        adminAuthLogin(user.email, user.password);
    });

    let newpassword = 'hey_mee3'

    test ('returns an object with "authUserId" key on success', () => {
        expect(adminUserPasswordUpdate(result.authUserId, user.password, newpassword)).toStrictEqual({});
    });

    test ('AuthUserId is not a valid user.', () => {
        expect(adminUserPasswordUpdate(result.authUserId + 1, user.password, newpassword)).toStrictEqual(ERROR);
    });

    test('Old Password is not the correct old password', () => {
        expect(adminUserPasswordUpdate(result.authUserId, 'hashed_password3', newpassword)).toStrictEqual(ERROR);
    });

    test('Old Password and New Password match exactly', () => {
        expect(adminUserPasswordUpdate(result.authUserId, user.password, 'hashed_password2')).toStrictEqual(ERROR);
    });

    test ('New Password is less than 8 characters', () => {
        expect(adminUserPasswordUpdate(result.authUserId, user.password, 'abc2v')).toStrictEqual(ERROR);
    });

    test ('New password is empty', () => {
        expect(adminUserPasswordUpdate(result.authUserId, user.password, '')).toStrictEqual(ERROR);
    });

    test ('New Password does not contain at least one number', () => {
        expect(adminUserPasswordUpdate(result.authUserId, user.password, 'abcdefgh')).toStrictEqual(ERROR);
    });

    test ('New Password does not contain at least one letter', () => {
        expect(adminUserPasswordUpdate(result.authUserId, user.password, '12345678')).toStrictEqual(ERROR);
    });
});