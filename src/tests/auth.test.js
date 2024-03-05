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
    const user = {
        email: 'johnsmith@gmail.com',
        password: 'hashed_password2',
        nameFirst: 'john',
        nameLast: 'smith',
    };

    let id;
    beforeEach(() => {
        id = adminAuthRegister(user.email, user.password, user.nameFirst, user.nameLast);
        adminAuthLogin(user.email, 'hashed_password2');
    });

    test('return an error object when authUserId is invalid', () => {
        expect(adminUserDetails(id + 10)).toStrictEqual(ERROR);
    });

    test('returns an object with "users" detail when authUserId is valid', () => {
        expect(adminUserDetails(id.authUserId)).toStrictEqual({
            user: {
                userId: id.authUserId,
                name: user.nameFirst + ' ' +user.nameLast,
                email: user.email,
                numSuccessfulLogins: 1,
                numFailedPasswordsSinceLastLogin: 0,
            }
     });
    });

    test('returns an object with "users" detail when authUserId is valid when password is entered invalid', () => {
        adminAuthLogin(user.email, 'hashed_password33');
        expect(adminUserDetails(id.authUserId)).toStrictEqual({
            user: {
                userId: id.authUserId,
                name: user.nameFirst + ' ' + user.nameLast,
                email: user.email,
                numSuccessfulLogins: 1,
                numFailedPasswordsSinceLastLogin: 1,
            }
        });
    });

});

describe('testing adminUserDetailsUpdate', () => {
    const user = {
        email: 'johnsmith@gmail.com',
        password: 'hashed_password2',
        nameFirst: 'john',
        nameLast: 'smith',
    };
    
    const email_update = 'johnsmith99@gmail.com';
    const nameFirst_update = 'joy';
    const nameLast_update = 'hell';

    let result;
    beforeEach(() => {
        result = adminAuthRegister(user.email, user.password, user.nameFirst, user.nameLast);
        adminAuthLogin(user.email, user.password);
    });

    test('returns an "{}" key on success', () => {
        let result2 = adminUserDetailsUpdate(result.authUserId, email_update, nameFirst_update, nameLast_update);
        expect(result2).toStrictEqual({});
    });

    test('AuthUserId is not a valid user.', () => {
        expect(adminUserDetailsUpdate(result.authUserId + 1, email_update, nameFirst_update, nameLast_update)).toStrictEqual(ERROR);
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
            expect(adminUserDetailsUpdate(result.authUserId, email, nameFirst_update, nameLast_update)).toStrictEqual(ERROR);
        });

        //check that error is returned when email address already exist
        test('Email is currently used by another user',() => {
            adminAuthRegister(user.email, user.password, user.nameFirst, user.nameLast);
            let result = adminAuthRegister(user.email, 'password2', 'John', 'Smith');
            expect(adminUserDetailsUpdate(result.authUserId, user.email, nameFirst_update, nameLast_update)).toStrictEqual(ERROR);
        });
    });

    describe('returns error with an invalid first name', () => {
        test('test first name contains invalid characters', () => {
            expect(adminUserDetailsUpdate(result.authUserId, email_update, 'Jane@.#7123', nameLast_update)).toStrictEqual(ERROR);
        });

        test('test first name is less than 2 characters', () => {
            expect(adminUserDetailsUpdate(result.authUserId, email_update, 'J',nameLast_update)).toStrictEqual(ERROR);
        });

        test('test first name is empty', () => {
            expect(adminUserDetailsUpdate(result.authUserId, email_update, '', nameLast_update)).toStrictEqual(ERROR);
        });

        test('test first name is more than 20 characters', () => {
            expect(adminUserDetailsUpdate(result.authUserId, email_update, 'JaneJaneJaneJaneJaneJ', nameLast_update)).toStrictEqual(ERROR); 
        });
    });

    describe('returns error with an invalid last name', () => {
        test('test last name contains invalid characters', () => {
            expect(adminUserDetailsUpdate(result.authUserId, email_update, nameFirst_update, 'Doe12*&^')).toStrictEqual(ERROR);
        });

        test('test last name is less than 2 characters', () => {
            expect(adminUserDetailsUpdate(result.authUserId, email_update, nameFirst_update, 'D')).toStrictEqual(ERROR);
        });

        test('test last name is empty', () => {
            expect(adminUserDetailsUpdate(result.authUserId, email_update, nameFirst_update, '')).toStrictEqual(ERROR);
        });

        test('test last name is more than 20 characters', () => {
            expect(adminUserDetailsUpdate(result.authUserId, email_update, nameFirst_update, 'JaneJaneJaneJaneJaneJ')).toStrictEqual(ERROR); 
        });
    });


});

describe('testing adminUserPasswordUpdate', () => {
    // TODO
});