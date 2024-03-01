```javascript
let data = {
    // array of user objects 
    users: [
        {
            authUserId: 1,
            email:'user1@example.com',
            password: 'hashed_passedword1',
            nameFirst: 'Jane',
            nameLast: 'Doe',
            numSuccessLogins: 1,
            numFailedLogins: 0,
        }
    ],
    // array of quiz objects
    quizzes: [
        {
            quizId: 1,
            name: 'quiz1',
            authUserId: 1,
            description: 'this is quiz1',
            timeCreated: 1,
            timeLastEdited: 1,
        }
    ],
}
```

[Optional] short description: This data structure contains information about the users and quizzes. Users and quizzes are an array of objects where user and quiz is an object.
