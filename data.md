```javascript
let data = {
    // array of user objects 
    users: [
        {
            userId: 1,
            email:'user1@example.com',
            password: 'hashed_passedword1',
            nameFirst: 'Jane',
            nameLast: 'Doe',
            logins: {
                numSuccess: 1,
                numFailed: 0
            },
        }
    ],
    // array of quiz objects
    quizzes: [
        {
            quizId: 1,
            name: 'quiz1',
            userId: 1,
            description: 'this is quiz1',
            timeCreated: 1,
            timeLastEdited: 1,
        }
    ],
    // method to return the number of quizzes owned by a user
    numQuizzesByUserId: function(userId) {
        let count = 0;
        // to implement
    },
    // method to return the number of registered users
    numUsers: function() {
        // to implement
    },
    // method to return the number of quizzes
    numQuizzes: function() {
        // to implement
    },
    // add more
}
```

[Optional] short description: 
