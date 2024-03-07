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
} from '../auth';

import { clear } from '../other';

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

const QUIZDESCRIPTION1 = 'This is a quiz';

const QUIZDECRIPTION2 = 'This is a new description';

beforeEach(() => {
    clear();
});

afterEach(() => {
    clear();
});

describe('testing adminQuizList', () => {
//     const quiz1 = {
//         name: 'Quiz 1',
//         description: 'This is a quiz',
//     };

//    const quiz2 = {
//         name: 'Quiz 2',
//         description: 'This is another quiz',
//     }; 

//     const user = adminAuthRegister('janedoe@gmail.com', 'hashed_password1', 'Jane', 'Doe');

//     test('returns an object with an empty array when the user has no quizzes', () => {
//         let result = adminQuizList(user.authUserId);
//         expect(result).toStrictEqual({ quizzes: [] });
//     });
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

    test('does not return the same quizId for two different quizzes', () => {
        let result1 = adminQuizCreate(userId, quiz.name, quiz.description);
        let result2 = adminQuizCreate(userId, 'Quiz 2', 'This is another quiz');
        expect(result1.quizId).not.toStrictEqual(result2.quizId);
    });

    test('returns error with an invalid userId', () => {
        let result = adminQuizCreate(userId + 1, quiz.name, quiz.description);
        expect(result).toStrictEqual(ERROR);
    });

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
    let userId;
    let quizId;

    beforeEach(() => {
        userId = adminAuthRegister('janedoe@gmail.com', 'hashed_password1', 'Jane', 'Doe');
        quizId = adminQuizCreate(userId.authUserId, 'Quiz 1', 'This is a quiz');
    })

    test('returns error with an invalid userId', () => {
        expect(adminQuizRemove(userId.authUserId + 1, quizId.quizId)).toStrictEqual(ERROR);
    })

    test('returns error with an invalid quizId', () => {
        expect(adminQuizRemove(userId.authUserId, quizId.quizId + 1)).toStrictEqual(ERROR);
    })

    test('returns error for requesting info about a quiz not owned by the user', () => {
        let userId2 = adminAuthRegister('johnsmith@gmail.com', 'hashed_password2', 'John', 'Smith');
        expect(adminQuizRemove(userId2.authUserId, quizId.quizId)).toStrictEqual(ERROR);
    })
    
    test('owner of one quiz removes their quiz', () => {
        /*
        const emptyResult = {
            quizzes: []
        }
        */

        const emptyResult = [];

        adminQuizRemove(userId.authUserId, quizId.quizId);
        expect(adminQuizList(userId.authUserId)).toStrictEqual(emptyResult);
    })

    test('two owners of two quizzes each remove one of each of their quizzes',
    () => {
        let userId2 = adminAuthRegister('johnsmith@gmail.com', 'hashed_password2', 'John', 'Smith');
        let quizId2 = adminQuizCreate(userId.authUserId, 'Quiz 2', 'This is a quiz2');
        let quizId3 = adminQuizCreate(userId2.authUserId, 'Quiz 3', 'This is a quiz3');
        let quizId4 = adminQuizCreate(userId2.authUserId, 'Quiz 4', 'This is a quiz4');

        /* const result1 = {
            quizzes: [
                {
                    quizId: quizId2.quizId,
                    name: 'Quiz 2'
                }
            ]
        }

        const result2 = {
            quizzee: [
                {
                    quizId: quizId4.quizId,
                    name: 'Quiz 4'
                }
            ]
        } */

        const result1 = [
            {
                quizId: quizId2.quizId,
                name: 'Quiz 2',
            }
        ];
        const result2 = [
            {
                quizId: quizId4.quizId,
                name: 'Quiz 4'
            }
        ]

        adminQuizRemove(userId.authUserId, quizId.quizId);
        adminQuizRemove(userId2.authUserId, quizId3.quizId);

        expect(adminQuizList(userId.authUserId)).toStrictEqual(result1);
        expect(adminQuizList(userId2.authUserId)).toStrictEqual(result2);
    })
});

describe('testing adminQuizInfo', () => {
    // TODO
    let userId;
    let quizId;

    beforeEach(() => {
        userId = adminAuthRegister('janedoe@gmail.com', 'hashed_password1', 'Jane', 'Doe');
        quizId = adminQuizCreate(userId.authUserId, 'Quiz 1', 'This is a quiz');
    })

    test('returns error with an invalid userId', () => {
        expect(adminQuizInfo(userId.authUserId + 1, quizId.quizId)).toStrictEqual(ERROR);
    })

    test('returns error with an invalid quizId', () => {
        expect(adminQuizInfo(userId.authUserId, quizId.quizId + 1)).toStrictEqual(ERROR);
    })

    test('returns error for requesting info about a quiz not owned by the user', () => {
        let userId2 = adminAuthRegister('johnsmith@gmail.com', 'hashed_password2', 'John', 'Smith');
        expect(adminQuizInfo(userId2.authUserId, quizId.quizId)).toStrictEqual(ERROR);
    })

    test('returning info of one quiz created by one user', () => {
        let returnObject = {
            quizId: quizId.quizId,
            name: 'Quiz 1',
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: 'This is a quiz',
        }
        expect(adminQuizInfo(userId.authUserId, quizId.quizId)).toStrictEqual(returnObject);
    })

    test('returning info of second quiz created by second user', () => {
        let userId2 = adminAuthRegister('johnsmith@gmail.com', 'hashed_password2', 'John', 'Smith');
        let quizId2 = adminQuizCreate(userId2.authUserId, 'Quiz 2', 'This is a quiz2');

        let returnObject = {
            quizId: quizId2.quizId,
            name: 'Quiz 2',
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: 'This is a quiz2',
        }

        expect(adminQuizInfo(userId2.authUserId, quizId2.quizId)).toStrictEqual(returnObject);
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
        expect(adminQuizList(userId)).toStrictEqual({'quizzes': [expected]});
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
    let userId;
    let quizId;
    beforeEach(() => {
        let user = adminAuthRegister('janedoe@gmail.com', 'hashed_password1', 'Jane', 'Doe');
        userId = user.authUserId;
        let quiz = adminQuizCreate(userId, 'Quiz 1', 'This is a quiz');
        quizId = quiz.quizId;
    });

    test('returns an object with the updated description on success', () => {
        adminQuizDescriptionUpdate(userId, quizId, 'This is a new description');
        let result = adminQuizInfo(userId, quizId);
        expect(result.description).toStrictEqual('This is a new description');
    });

    test('returns error with an invalid userId', () => {
        let result = adminQuizDescriptionUpdate(userId + 1, quizId, 'This is a new description');
        expect(result).toStrictEqual({'error': 'AuthUserId is not a valid user'});
    });

    test('returns error with an invalid quizId', () => {
        let result = adminQuizDescriptionUpdate(userId, quizId + 1, 'This is a new description');
        expect(result).toStrictEqual({'error': 'QuizId is not a valid quiz'});
    });

    test('returns error with a quizId not owned by user', () => {
        let user2 = adminAuthRegister('johncitizen@gmail.com', 'hashed_password1', 'John', 'Citizen');
        let userId2 = user2.authUserId;
        let quiz2 = adminQuizCreate(userId2, 'Quiz 2', 'This is a quiz');
        let quizId2 = quiz2.quizId;
        let result = adminQuizDescriptionUpdate(userId, quizId2, 'This is a new description');
        expect(result).toStrictEqual({'error': 'QuizId is not owned by user'});
    });

    test('returns error when description is more than 100 characters', () => {
        let longDescription = 'Q'.repeat(101);
        let result = adminQuizDescriptionUpdate(userId, quizId, longDescription);
        expect(result).toStrictEqual({'error': 'Description is more than 100 characters'});
    });
});