import {
  clearV1,
  authRegisterV1,
  // authLogoutV1,
  // quizListV2,
  // quizInfoV2,
  // quizTrashV2,
  quizCreateV2,
  // quizNameUpdateV2,
  // quizDescriptionUpdateV2,
  // quizTransferV2,
  quizQuestionCreateV2,
  // quizQuestionUpdateV2,
  // quizQuestionRemoveV2,
  // quizQuestionMoveV2,
  // quizQuestionDuplicateV2,
  quizSessionStartV1,
  quizSessionUpdateV1,
  // quizSessionListV1,
  // quizSessionStatusV1,
  // quizSessionResultsV1,
  // quizSessionCSVResultsV1,
  playerJoinV1,
  playerStatusV1,
  playerQuestionInfoV1,
  // playerQuestionAnswerV1,
  // playerQuestionResultsV1,
  // playerFinalResultsV1,
  playerChatListV1,
  playerChatSendV1
} from '../httpHelpers';
// import {
//   getTimeStamp,
//   checkTimeStamp
// } from '../testHelpers';
import {
  BAD_REQUEST_ERROR,
  // UNAUTHORISED_ERROR,
  // FORBIDDEN_ERROR,
  USER1,
  // USER2,
  QUIZ1,
  // QUIZ2,
  QUESTION_BODY1,
  // OK_SUCCESS,
  PLAYER_BODY1,
  QUESTION_BODY2,
  // PLAYER_BODY2,
  // PLAYER_BODY3,
} from '../testTypes';
import {
  // State,
  Action
} from '../dataTypes';
/* import { QuizMetadata } from '../functionTypes';
import { sortArray } from '../testHelpers';
import sleep from 'atomic-sleep'; */

beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

//= =============================================================================
//= =============================================================================
describe('Testing POST v1/player/join', () => {
  let token: string;
  let quizId: number;
  let sessionId: number;
  beforeEach(() => {
    token = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    quizQuestionCreateV2(token, quizId, QUESTION_BODY1).jsonBody.questionId as number;
    sessionId = quizSessionStartV1(token, quizId, 0).jsonBody.sessionId as number;
  });

  test('Correct status code and return value with given name', () => {
    const response = playerJoinV1(sessionId, PLAYER_BODY1.name);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({ playerId: expect.any(Number) });
  });

  test('Correct status code and return value with empty string', () => {
    const response = playerJoinV1(sessionId, '');
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({ playerId: expect.any(Number) });
  });

  describe('BAD_REQUEST_ERROR', () => {
    test('Name of user entered is not unique (compared to other users who have already joined)', () => {
      playerJoinV1(sessionId, PLAYER_BODY1.name);
      // Same name of a user
      expect(playerJoinV1(sessionId, PLAYER_BODY1.name)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Session Id does not refer to a valid session', () => {
      expect(playerJoinV1(sessionId + 220, PLAYER_BODY1.name)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each([
      Action.NEXT_QUESTION,
      Action.END,
    ])('%s state cannot be applied in player join', (InvalidAction) => {
      quizSessionUpdateV1(token, quizId, sessionId, InvalidAction);
      expect(playerJoinV1(sessionId, PLAYER_BODY1.name)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing GET/v1/player/{playerid}', () => {
  let token: string;
  let quizId: number;
  let sessionId: number;
  let playerId: number;

  beforeEach(() => {
    token = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    quizQuestionCreateV2(token, quizId, QUESTION_BODY1).jsonBody.questionId as number;
    sessionId = quizSessionStartV1(token, quizId, 0).jsonBody.sessionId as number;
    playerId = playerJoinV1(sessionId, PLAYER_BODY1.name).jsonBody.playerId as number;
  });

  test('Correct status code and return value with given name', () => {
    const respone = playerStatusV1(playerId);
    expect(respone.statusCode).toStrictEqual(200);
    expect(respone.jsonBody).toStrictEqual({
      state: expect.any(String),
      numQuestions: expect.any(Number),
      atQuestion: expect.any(Number),
    });
  });

  test.each([
    Action.GO_TO_FINAL_RESULTS,
    Action.END,
  ])('%s state than atQuestion should be 0', (InvalidAction) => {
    quizSessionUpdateV1(token, quizId, sessionId, InvalidAction);
    const respone = playerStatusV1(playerId);
    expect(respone.statusCode).toStrictEqual(200);
    expect(respone.jsonBody).toStrictEqual({
      state: expect.any(String),
      numQuestions: expect.any(Number),
      atQuestion: 0,
    });
  });

  test('BAD_REQUEST_ERROR', () => {
    expect(playerStatusV1(playerId + 220)).toStrictEqual(BAD_REQUEST_ERROR);
  });
});

describe('Testing GET/v1/player/{playerid}/question/{questionposition}', () => {
  let token: string;
  let quizId: number;
  let sessionId: number;
  let playerId: number;
  let questionId1: number;

  beforeEach(() => {
    token = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    questionId1 = quizQuestionCreateV2(token, quizId, QUESTION_BODY1).jsonBody.questionId as number;
    quizQuestionCreateV2(token, quizId, QUESTION_BODY2).jsonBody.questionId as number;
    sessionId = quizSessionStartV1(token, quizId, 0).jsonBody.sessionId as number;
    playerId = playerJoinV1(sessionId, PLAYER_BODY1.name).jsonBody.playerId as number;
  });

  test('Correct status code and return value with given name', () => {
    quizSessionUpdateV1(token, quizId, sessionId, Action.NEXT_QUESTION);
    quizSessionUpdateV1(token, quizId, sessionId, Action.SKIP_COUNTDOWN);
    const response = playerQuestionInfoV1(playerId, 1);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({
      questionId: questionId1,
      question: QUESTION_BODY1.question,
      duration: QUESTION_BODY1.duration,
      thumbnailUrl: QUESTION_BODY1.thumbnailUrl,
      points: QUESTION_BODY1.points,
      answers: expect.any(Array),
    });
  });

  describe('BAD_REQUEST_ERROR', () => {
    test('Player Id does not exists', () => {
      expect(playerQuestionInfoV1(playerId + 220, 1)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('If question position is not valid for the session this player is in', () => {
      quizSessionUpdateV1(token, quizId, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token, quizId, sessionId, Action.SKIP_COUNTDOWN);
      expect(playerQuestionInfoV1(playerId, 3)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('If session is not currently on this question', () => {
      quizSessionUpdateV1(token, quizId, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token, quizId, sessionId, Action.SKIP_COUNTDOWN);
      // currently at first question
      expect(playerQuestionInfoV1(playerId, 2)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Session is in LOBBY state', () => {
      expect(playerQuestionInfoV1(playerId, 1)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Session is in QUESTION_COUNTDOWN State', () => {
      quizSessionUpdateV1(token, quizId, sessionId, Action.NEXT_QUESTION);
      expect(playerQuestionInfoV1(playerId, 1)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Session is in END State', () => {
      quizSessionUpdateV1(token, quizId, sessionId, Action.END);
      expect(playerQuestionInfoV1(playerId, 1)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing POST/v1/player/{playerid}/chat', () => {
  let token: string;
  let quizId: number;
  let sessionId: number;
  let playerId: number;
  const message = { messageBody: 'chat' };

  beforeEach(() => {
    token = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    quizQuestionCreateV2(token, quizId, QUESTION_BODY1).jsonBody.questionId as number;
    sessionId = quizSessionStartV1(token, quizId, 0).jsonBody.sessionId as number;
    playerId = playerJoinV1(sessionId, PLAYER_BODY1.name).jsonBody.playerId as number;
  });

  test('Correct status code and return value with given name', () => {
    const response = playerChatSendV1(playerId, message);
    // const message = playerChatListV1(playerId).jsonBody;
    expect(response.statusCode).toStrictEqual(200);
    // expect(message).toStrictEqual({});
  });

  describe('BAD_REQUEST_ERROR', () => {
    test('Player Id does not refer to a valid player', () => {
      const response = playerChatSendV1(playerId + 1, message);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Message is less than 1 characters', () => {
      const message1 = { messageBody: '' };
      const response = playerChatSendV1(playerId, message1);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Message is greater than 100 characters', () => {
      const message1 = { messageBody: 'm'.repeat(101) };
      const response = playerChatSendV1(playerId, message1);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  test.skip('Message sent time is within a 1 second range of the current time', () => {
    // const expectedTime = getTimeStamp();
    playerChatSendV1(playerId, message);
    // const timeSent = playerChatListV1(playerId).jsonBody.timeSent as number;
    // checkTimeStamp(timeSent, expectedTime);
  });
});

describe('Testing GET/v1/player/{playerid}/chat', () => {
  let token: string;
  let quizId: number;
  let sessionId: number;
  let playerId: number;
  const message = { messageBody: 'chat' };

  beforeEach(() => {
    token = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId = quizCreateV2(token, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    quizQuestionCreateV2(token, quizId, QUESTION_BODY1).jsonBody.questionId as number;
    sessionId = quizSessionStartV1(token, quizId, 0).jsonBody.sessionId as number;
    playerId = playerJoinV1(sessionId, PLAYER_BODY1.name).jsonBody.playerId as number;
  });

  test('Correct status code and return value with given name', () => {
    playerChatSendV1(playerId, message);
    const response = playerChatListV1(playerId).jsonBody;
    const expected = { messages: [{messageBody: 'chat', playerId: playerId, playerName: PLAYER_BODY1.name, timeSent: expect.any(Number)}] };
    expect(response.statusCode).toStrictEqual(200);
    expect(response).toStrictEqual({expected});
  });

  test('Successful retrieval when player has no messages', () => {
    const response = playerChatListV1(playerId).jsonBody;
    expect(response).toStrictEqual({ messages: []});
  });

  test('Successful retrieval and displayed in correct order', () => {
    playerChatSendV1(playerId, message);
    const message1 = { messageBody: 'chat1' };
    playerChatSendV1(playerId, message1);
    const message2 = { messageBody: 'chat2' };
    playerChatSendV1(playerId, message2);
    const expected = { messages: [{messageBody: 'chat', playerId: playerId, playerName: PLAYER_BODY1.name, timeSent: expect.any(Number)}] };
    const response = playerChatListV1(playerId).jsonBody;
    expect(response).toStrictEqual(expected);
  });

  describe('BAD_REQUEST_ERROR', () => {
    test('Player Id does not refer to a valid player', () => {
      const response = playerChatListV1(playerId + 1);
      expect(response).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});
