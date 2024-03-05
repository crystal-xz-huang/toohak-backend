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

const user = {
    email: 'johnsmith@gmail.com',
    password: 'hashed_password1',
    nameFirst: 'john',
    nameLast: 'smith',
};

const invalidEmails = [
    {email: ''}, // empty email
    {email: 'example.com'},
    {email: 'example@'},
    {email: 'example@.com'},
    {email: '@gmail.com'},
    {email: 'user@gmail@gmail.com'},
    {email: 'email'},                
];

const invalidPasswords = [
    {password: '12345678'},
    {password: 'abcdefgh'},
]

describe('testing adminAuthRegister', () => {
    test('returns an object with "authUserId" key on success', () => {
        let result = adminAuthRegister(user.email, user.password, user.nameFirst, user.nameLast);
        expect(result).toStrictEqual({ authUserId: expect.any(Number) });
    });

    describe('returns error with an invalid email', () => {
        test.each(invalidEmails)("test invalid email '$#': '$email'", ({email}) => {
            expect(adminAuthRegister(email, user.password, user.nameFirst, user.nameLast)).toStrictEqual(ERROR);
        });

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
        test('test password is less than 8 characters', () => {
            expect(adminAuthRegister(user.email, 'abc4567', user.nameFirst, user.nameLast)).toStrictEqual(ERROR);
        });

        test('test password is empty', () => {
            expect(adminAuthRegister(user.email, '', user.nameFirst, user.nameLast)).toStrictEqual(ERROR);
        });

        test.each(invalidPasswords)("test password does not contain at least one number and one letter", ({passsword}) => {
            expect(adminAuthRegister(user.email, passsword, user.nameFirst, user.nameLast)).toStrictEqual(ERROR);
        });
    });
});

describe('testing adminAuthLogin', () => {
    let result;
    beforeEach(() => {
        result = adminAuthRegister(user.email, user.password, user.nameFirst, user.nameLast);
    });

    test('returns an object with "authUserId" key when email and password is matched', () => {
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
    let id;
    beforeEach(() => {
        id = adminAuthRegister(user.email, user.password, user.nameFirst, user.nameLast);
    });

    test('returns error when authUserId is invalid', () => {
        expect(adminUserDetails(id + 10)).toStrictEqual(ERROR);
    });

    describe('returns an object with correct key-values when authUserId is valid', () => {
        test('test numSuccessfulLogins is 1 when user is registered with adminAuthRegister', () => {
            expect(adminUserDetails(id.authUserId)).toStrictEqual({
                user: {
                    userId: id.authUserId,
                    name: `${user.nameFirst} ${user.nameLast}`,
                    email: user.email,
                    numSuccessfulLogins: 1,
                    numFailedPasswordsSinceLastLogin: 0,
                }
            });
        });

        test('test numSuccessfulLogins is 2 when user successfully logs in with adminAuthLogin', () => {
            adminAuthLogin(user.email, user.password);
            expect(adminUserDetails(id.authUserId)).toStrictEqual({
                user: {
                    userId: id.authUserId,
                    name: `${user.nameFirst} ${user.nameLast}`,
                    email: user.email,
                    numSuccessfulLogins: 2,
                    numFailedPasswordsSinceLastLogin: 0,
                }
            });
        });

        test('test numFailedPasswordsSinceLastLogin is 1 when user fails to log in with an invalid password', () => {
            adminAuthLogin(user.email, 'invalid_password1');
            expect(adminUserDetails(id.authUserId)).toStrictEqual({
                user: {
                    userId: id.authUserId,
                    name: `${user.nameFirst} ${user.nameLast}`,
                    email: user.email,
                    numSuccessfulLogins: 1,
                    numFailedPasswordsSinceLastLogin: 1,
                }
            });
        });

        test('test numFailedPasswordsSinceLastLogin is reset with a successful login', () => {
            adminAuthLogin(user.email, 'invalid_password1');
            adminAuthLogin(user.email, user.password);
            expect(adminUserDetails(id.authUserId)).toStrictEqual({
                user: {
                    userId: id.authUserId,
                    name: `${user.nameFirst} ${user.nameLast}`,
                    email: user.email,
                    numSuccessfulLogins: 2,
                    numFailedPasswordsSinceLastLogin: 0,
                }
            });
        });
    });    
});

describe('testing adminUserDetailsUpdate', () => {
    const email_update = 'johnsmith99@gmail.com';
    const nameFirst_update = 'joy';
    const nameLast_update = 'hell';

    let result;
    beforeEach(() => {
        result = adminAuthRegister(user.email, user.password, user.nameFirst, user.nameLast);
        adminAuthLogin(user.email, user.password);
    });

    test('returns an empty object on success', () => {
        let result2 = adminUserDetailsUpdate(result.authUserId, email_update, nameFirst_update, nameLast_update);
        expect(result2).toStrictEqual({});
    });

    test('returns error when authUserId is not a valid user.', () => {
        expect(adminUserDetailsUpdate(result.authUserId + 1, email_update, nameFirst_update, nameLast_update)).toStrictEqual(ERROR);
    });

    describe('returns error with an invalid email', () => {
        test.each(invalidEmails)("test invalid email '$#': '$email'", ({email}) => {
            expect(adminUserDetailsUpdate(result.authUserId, email, nameFirst_update, nameLast_update)).toStrictEqual(ERROR);
        });

        test('test email is currently used by another user',() => {
            adminAuthRegister(user.email, user.password, user.nameFirst, user.nameLast);
            let result = adminAuthRegister(user.email, 'password2', 'Jane', 'Smith');
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
    let result;
    beforeEach(() => {
        result = adminAuthRegister(user.email, user.password, user.nameFirst, user.nameLast);
        adminAuthLogin(user.email, user.password);
    });

    let newpassword = 'hey_mee3'

    test ('returns an empty object on success', () => {
        expect(adminUserPasswordUpdate(result.authUserId, user.password, newpassword)).toStrictEqual({});
    });

    test ('returns error when authUserId is not a valid user.', () => {
        expect(adminUserPasswordUpdate(result.authUserId + 1, user.password, newpassword)).toStrictEqual(ERROR);
    });

    test('returns error when old password is not correct', () => {
        expect(adminUserPasswordUpdate(result.authUserId, 'hashed_password3', newpassword)).toStrictEqual(ERROR);
    });
    
    test('returns error when old password and new password match exactly', () => {
        expect(adminUserPasswordUpdate(result.authUserId, user.password, user.password)).toStrictEqual(ERROR);
    });

    describe('returns error with an invalid new password', () => {
        test('test new password is less than 8 characters', () => {
            expect(adminUserPasswordUpdate(result.authUserId, user.password, 'abc4567')).toStrictEqual(ERROR);
        });

        test('test new password is empty', () => {
            expect(adminUserPasswordUpdate(result.authUserId, user.password, '')).toStrictEqual(ERROR);
        });

        test.each(invalidPasswords)("test new password does not contain at least one number and one letter", ({passsword}) => {
            expect(adminUserPasswordUpdate(result.authUserId, user.password, passsword)).toStrictEqual(ERROR);
        });
    });
});