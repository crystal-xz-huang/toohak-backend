import sleep from 'atomic-sleep';
import { QuizMetadata, AdminQuizInfoReturn, AdminQuizSessionStatusReturn } from '../functionTypes';
import { State, Action } from '../dataTypes';
import { sortNumericArray, sortStringArray } from '../testHelpers';
import {
  clearV1,
  authRegisterV1,
  authLogoutV1,
  quizInfoV2,
  quizTrashV2,
  quizCreateV2,
  quizNameUpdateV2,
  quizDescriptionUpdateV2,
  quizQuestionCreateV2,
  quizQuestionUpdateV2,
  quizQuestionRemoveV2,
  quizQuestionMoveV2,
  quizQuestionDuplicateV2,
  quizSessionStartV1,
  quizSessionUpdateV1,
  quizSessionListV1,
  quizSessionStatusV1,
  playerJoinV1,
} from '../httpHelpers';
import {
  BAD_REQUEST_ERROR,
  UNAUTHORISED_ERROR,
  FORBIDDEN_ERROR,
  USER1,
  USER2,
  QUIZ1,
  QUIZ2,
  QUESTION_BODY1,
  QUESTION_BODY2,
  OK_SUCCESS,
  QUESTION_BODY3,
  QUESTION_BODY4,
} from '../testTypes';

beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

describe('Testing GET /v1/admin/quiz/:quizid/sessions', () => {
  let token1: string;
  let quizId1: number;
  let sessionId1: number, sessionId2: number, sessionId3: number, sessionId4: number;
  beforeEach(() => {
    token1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId1 = quizCreateV2(token1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    quizQuestionCreateV2(token1, quizId1, QUESTION_BODY1).jsonBody.questionId as number;
    sessionId1 = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
    sessionId2 = quizSessionStartV1(token1, quizId1, 1).jsonBody.sessionId as number;
    sessionId3 = quizSessionStartV1(token1, quizId1, 2).jsonBody.sessionId as number;
    sessionId4 = quizSessionStartV1(token1, quizId1, 3).jsonBody.sessionId as number;
  });

  test('Correct status code and return value', () => {
    const response = quizSessionListV1(token1, quizId1);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({
      activeSessions: expect.any(Array),
      inactiveSessions: expect.any(Array),
    });
  });

  test('Retrieves active and inactive sessionids (sorted in ascending order) for a quiz', () => {
    const response = quizSessionListV1(token1, quizId1).jsonBody;
    expect(response.activeSessions).toStrictEqual(sortNumericArray([sessionId1, sessionId2, sessionId3, sessionId4]));
    expect(response.inactiveSessions).toStrictEqual([]);
  });

  test('Quiz has both active and inactive sessions', () => {
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END);
    quizSessionUpdateV1(token1, quizId1, sessionId2, Action.END);
    const response = quizSessionListV1(token1, quizId1).jsonBody;
    expect(response.activeSessions).toStrictEqual(sortNumericArray([sessionId3, sessionId4]));
    expect(response.inactiveSessions).toStrictEqual(sortNumericArray([sessionId1, sessionId2]));
  });

  test('Quiz has only inactive sessions', () => {
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END);
    quizSessionUpdateV1(token1, quizId1, sessionId2, Action.END);
    quizSessionUpdateV1(token1, quizId1, sessionId3, Action.END);
    quizSessionUpdateV1(token1, quizId1, sessionId4, Action.END);
    const response = quizSessionListV1(token1, quizId1).jsonBody;
    expect(response.activeSessions).toStrictEqual([]);
    expect(response.inactiveSessions).toStrictEqual(sortNumericArray([sessionId1, sessionId2, sessionId3, sessionId4]));
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizSessionListV1('', quizId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizSessionListV1(token1 + 'random', quizId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid logged in user session', () => {
      authLogoutV1(token1);
      expect(quizSessionListV1(token1, quizId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      expect(quizSessionListV1(token1, -1)).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const token2 = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody.token as string;
      expect(quizSessionListV1(token2, quizId1)).toStrictEqual(FORBIDDEN_ERROR);
    });
  });
});

describe('Testing POST /v1/admin/quiz/:quizid/session/start', () => {
  let token1: string;
  let quizId1: number;
  let questionId1: number;
  beforeEach(() => {
    token1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId1 = quizCreateV2(token1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    questionId1 = quizQuestionCreateV2(token1, quizId1, QUESTION_BODY1).jsonBody.questionId as number;
  });

  test('Correct status code and return value', () => {
    const response = quizSessionStartV1(token1, quizId1, 0);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({ sessionId: expect.any(Number) });
  });

  test('Starts a new active quiz session for a quiz', () => {
    const sessionId = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
    const response = quizSessionListV1(token1, quizId1).jsonBody;
    expect(response.activeSessions).toStrictEqual([sessionId]);
  });

  describe('Copies the quiz so any edits to the quiz does not affect the active session', () => {
    let sessionId: number;
    let beforeMetadata: QuizMetadata;
    beforeEach(() => {
      sessionId = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
      beforeMetadata = quizSessionStatusV1(token1, quizId1, sessionId).jsonBody.metadata;
    });

    test('Quiz is copied correctly', () => {
      const quizInfo = quizInfoV2(token1, quizId1).jsonBody;
      expect(beforeMetadata).toStrictEqual(quizInfo);
    });

    test('Updating the quiz name has no effect', () => {
      quizNameUpdateV2(token1, quizId1, 'New Name');
      const afterMetadata = quizSessionStatusV1(token1, quizId1, sessionId).jsonBody.metadata;
      expect(afterMetadata.name).toStrictEqual(QUIZ1.name);
    });

    test('Updating the quiz description has no effect', () => {
      quizDescriptionUpdateV2(token1, quizId1, 'New Description');
      const afterMetadata = quizSessionStatusV1(token1, quizId1, sessionId).jsonBody.metadata;
      expect(afterMetadata.description).toStrictEqual(QUIZ1.description);
    });

    test('Adding a new question has no effect', () => {
      quizQuestionCreateV2(token1, quizId1, QUESTION_BODY2);
      const afterMetadata = quizSessionStatusV1(token1, quizId1, sessionId).jsonBody.metadata;
      expect(afterMetadata.numQuestions).toStrictEqual(1);
    });

    test('Updating an existing question has no effect', () => {
      quizQuestionUpdateV2(token1, quizId1, questionId1, QUESTION_BODY2);
      const afterMetadata = quizSessionStatusV1(token1, quizId1, sessionId).jsonBody.metadata;
      expect(afterMetadata).toStrictEqual(beforeMetadata);
    });

    test('Removing a question has no effect', () => {
      quizQuestionRemoveV2(token1, quizId1, questionId1);
      const afterMetadata = quizSessionStatusV1(token1, quizId1, sessionId).jsonBody.metadata;
      expect(afterMetadata).toStrictEqual(beforeMetadata);
    });

    test('Moving a question has no effect', () => {
      quizQuestionMoveV2(token1, quizId1, questionId1, 1);
      const afterMetadata = quizSessionStatusV1(token1, quizId1, sessionId).jsonBody.metadata;
      expect(afterMetadata).toStrictEqual(beforeMetadata);
    });
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizSessionStartV1('', quizId1, 0)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizSessionStartV1(token1 + 'random', quizId1, 0)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid logged in user session', () => {
      authLogoutV1(token1);
      expect(quizSessionStartV1(token1, quizId1, 0)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      expect(quizSessionStartV1(token1, -1, 0)).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const token2 = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody.token as string;
      expect(quizSessionStartV1(token2, quizId1, 0)).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test.each([
      { autoStartNum: -1 },
      { autoStartNum: 51 },
      { autoStartNum: 100 },
    ])('Invalid autoStartNum: $autoStartNum', ({ autoStartNum }) => {
      expect(quizSessionStartV1(token1, quizId1, autoStartNum)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Quiz does not have any questions', () => {
      const quizId2 = quizCreateV2(token1, QUIZ2.name, QUIZ2.description).jsonBody.quizId as number;
      expect(quizSessionStartV1(token1, quizId2, 0)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Quiz is in the trash', () => {
      quizTrashV2(token1, quizId1);
      expect(quizSessionStartV1(token1, quizId1, 0)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('A maximum of 10 sessions that are not in END state currently exist for the quiz', () => {
      for (let i = 0; i < 10; i++) {
        expect(quizSessionStartV1(token1, quizId1, i).statusCode).toStrictEqual(200);
      }
      expect(quizSessionStartV1(token1, quizId1, 0)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing PUT /v1/admin/quiz/:quizid/session/:sessionid', () => {
  let token1: string;
  let quizId1: number;
  let sessionId1: number;
  beforeEach(() => {
    token1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId1 = quizCreateV2(token1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    quizQuestionCreateV2(token1, quizId1, QUESTION_BODY1).jsonBody.questionId as number;
    quizQuestionCreateV2(token1, quizId1, QUESTION_BODY2).jsonBody.questionId as number;
    sessionId1 = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
  });

  test('Correct status code and return value', () => {
    sessionId1 = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
    const response = quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizSessionUpdateV1('', quizId1, sessionId1, Action.END)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizSessionUpdateV1(token1 + 'random', quizId1, sessionId1, Action.END)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid logged in user session', () => {
      authLogoutV1(token1);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      expect(quizSessionUpdateV1(token1, -1, sessionId1, Action.END)).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const token2 = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody.token as string;
      expect(quizSessionUpdateV1(token2, quizId1, sessionId1, Action.END)).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('Invalid sessionId', () => {
      expect(quizSessionUpdateV1(token1, quizId1, -1, Action.END)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('SessionId does not refer to a valid session within this quiz', () => {
      const quizId2 = quizCreateV2(token1, QUIZ2.name, QUIZ2.description).jsonBody.quizId as number;
      quizQuestionCreateV2(token1, quizId2, QUESTION_BODY1).jsonBody.questionId as number;
      const sessionId2 = quizSessionStartV1(token1, quizId2, 0).jsonBody.sessionId as number;
      // sessionId2 belongs to quizId2
      expect(quizSessionUpdateV1(token1, quizId1, sessionId2, Action.END)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Action is not a valid Action enum', () => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END + 1)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each([
      Action.SKIP_COUNTDOWN,
      Action.GO_TO_ANSWER,
      Action.GO_TO_FINAL_RESULTS,
    ])('%s action cannot be applied in the LOBBY state', (InvalidAction) => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, InvalidAction)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each([
      Action.NEXT_QUESTION,
      Action.GO_TO_ANSWER,
      Action.GO_TO_FINAL_RESULTS,
    ])('%s action cannot be applied in the QUESTION_COUNTDOWN state', (InvalidAction) => {
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_COUNTDOWN);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, InvalidAction)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each([
      Action.NEXT_QUESTION,
      Action.SKIP_COUNTDOWN,
      Action.GO_TO_FINAL_RESULTS,
    ])('%s action cannot be applied in the QUESTION_OPEN state', (InvalidAction) => {
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_OPEN);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, InvalidAction)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each([
      Action.SKIP_COUNTDOWN,
    ])('%s action cannot be applied in the QUESTION_CLOSE state', (InvalidAction) => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN)).toStrictEqual(OK_SUCCESS);
      sleep(QUESTION_BODY1.duration * 1000);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_CLOSE);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, InvalidAction)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each([
      Action.SKIP_COUNTDOWN,
      Action.GO_TO_ANSWER,
    ])('%s action cannot be applied in the ANSWER_SHOW state', (InvalidAction) => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN)).toStrictEqual(OK_SUCCESS);
      sleep(QUESTION_BODY1.duration * 1000);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_ANSWER)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.ANSWER_SHOW);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, InvalidAction)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each([
      Action.NEXT_QUESTION,
      Action.SKIP_COUNTDOWN,
      Action.GO_TO_ANSWER,
      Action.GO_TO_FINAL_RESULTS,
    ])('%s action cannot be applied in the FINAL_RESULTS state', (InvalidAction) => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN)).toStrictEqual(OK_SUCCESS);
      sleep(QUESTION_BODY1.duration * 1000);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_ANSWER)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_FINAL_RESULTS)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.FINAL_RESULTS);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, InvalidAction)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('END action cannot be applied in the END state', () => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe('Testing GET /v1/admin/quiz/:quizid/session/:sessionid', () => {
  let token1: string;
  let quizId1: number;
  let questionId1: number;
  let sessionId1: number;
  beforeEach(() => {
    token1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId1 = quizCreateV2(token1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    questionId1 = quizQuestionCreateV2(token1, quizId1, QUESTION_BODY1).jsonBody.questionId as number;
    quizQuestionCreateV2(token1, quizId1, QUESTION_BODY2).jsonBody.questionId as number;
    quizQuestionCreateV2(token1, quizId1, QUESTION_BODY3).jsonBody.questionId as number;
    sessionId1 = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
  });

  test('Correct status code and return value', () => {
    const response = quizSessionStatusV1(token1, quizId1, sessionId1);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({
      state: expect.any(String),
      atQuestion: expect.any(Number),
      players: expect.any(Array) as string[],
      metadata: expect.any(Object) as QuizMetadata,
    });
    expect(response.jsonBody.metadata.questions.length).toStrictEqual(3);
  });

  test('Names of all the players in the quiz session are ordered in ascending order of player name', () => {
    playerJoinV1(sessionId1, 'Harry').jsonBody.playerId as number;
    playerJoinV1(sessionId1, 'Ron').jsonBody.playerId as number;
    playerJoinV1(sessionId1, 'Hermione').jsonBody.playerId as number;

    const sortedNames = sortStringArray(['Harry', 'Ron', 'Hermione']);
    const response = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.players;
    expect(response).toStrictEqual(sortedNames);
  });

  test('Metadata is a copy of the quiz information', () => {
    const expectedMetadata = quizInfoV2(token1, quizId1).jsonBody as AdminQuizInfoReturn;
    const response = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.metadata as QuizMetadata;
    expect(response).toStrictEqual(expectedMetadata);
  });

  describe('Session status is unchanged when the quiz is updated by the admin', () => {
    test('Changing the quiz name', () => {
      const before = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody as AdminQuizSessionStatusReturn;
      quizNameUpdateV2(token1, quizId1, 'New Name');
      const after = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody as AdminQuizSessionStatusReturn;
      expect(after).toStrictEqual(before);
    });

    test('Changing the quiz description', () => {
      const before = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody as AdminQuizSessionStatusReturn;
      quizDescriptionUpdateV2(token1, quizId1, 'New Description');
      const after = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody as AdminQuizSessionStatusReturn;
      expect(after).toStrictEqual(before);
    });

    test('Adding a new question', () => {
      const before = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody as AdminQuizSessionStatusReturn;
      quizQuestionCreateV2(token1, quizId1, QUESTION_BODY2);
      const after = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody as AdminQuizSessionStatusReturn;
      expect(after).toStrictEqual(before);
    });

    test('Updating an existing question', () => {
      const before = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody as AdminQuizSessionStatusReturn;
      quizQuestionUpdateV2(token1, quizId1, questionId1, QUESTION_BODY4);
      const after = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody as AdminQuizSessionStatusReturn;
      expect(after).toStrictEqual(before);
    });

    test('Deleting a question', () => {
      const before = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody as AdminQuizSessionStatusReturn;
      quizQuestionRemoveV2(token1, quizId1, questionId1);
      const after = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody as AdminQuizSessionStatusReturn;
      expect(after).toStrictEqual(before);
    });

    test('Moving a question', () => {
      const before = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody as AdminQuizSessionStatusReturn;
      quizQuestionMoveV2(token1, quizId1, questionId1, 2);
      const after = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody as AdminQuizSessionStatusReturn;
      expect(after).toStrictEqual(before);
    });

    test('Duplicating a question', () => {
      const before = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody as AdminQuizSessionStatusReturn;
      quizQuestionDuplicateV2(token1, quizId1, questionId1);
      const after = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody as AdminQuizSessionStatusReturn;
      expect(after).toStrictEqual(before);
    });
  });

  describe('atQuestion is 0 in LOBBY, END or FINAL_RESULTS state', () => {
    // starting at lobby
    test('LOBBY state and atQuestion is 0', () => {
      const response = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody;
      expect(response.state).toStrictEqual(State.LOBBY);
      expect(response.atQuestion).toStrictEqual(0);
    });

    test('END state and atQuestion is 0', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END);
      const response = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody;
      expect(response.state).toStrictEqual(State.END);
      expect(response.atQuestion).toStrictEqual(0);
    });

    test('FINAL_RESULTS state and atQuestion is 0', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN);
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_FINAL_RESULTS);
      const response = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody;
      expect(response.state).toStrictEqual(State.FINAL_RESULTS);
      expect(response.atQuestion).toStrictEqual(0);
    });
  });

  test('Correct state and atQuestion when advancing through the quiz', () => {
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_COUNTDOWN);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(1);

    // skip the countdown to move to question open
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_OPEN);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(1);

    // wait for the duration of the question to move to question close
    sleep(QUESTION_BODY1.duration * 1000);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_CLOSE);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(1);

    // move to answer show
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_ANSWER);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.ANSWER_SHOW);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(1);

    // move to 2nd question
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_COUNTDOWN);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(2);

    // skip the countdown to move to question open
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_OPEN);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(2);

    // move to question close
    sleep(QUESTION_BODY2.duration * 1000);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_CLOSE);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(2);

    // move to next question
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_COUNTDOWN);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(3);

    // skip the countdown to move to question open
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_OPEN);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(3);

    // move to answer show
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_ANSWER);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.ANSWER_SHOW);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(3);

    // move to next question (out of range)
    expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION)).toStrictEqual(BAD_REQUEST_ERROR);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.ANSWER_SHOW);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(3);

    // move to final results
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_FINAL_RESULTS);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.FINAL_RESULTS);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(0);

    // move to end
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.END);
    expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(0);
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizSessionStatusV1('', quizId1, sessionId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizSessionStatusV1(token1 + 'random', quizId1, sessionId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid logged in user session', () => {
      authLogoutV1(token1);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  describe('Forbidden errors', () => {
    test('Valid token but invalid quizId', () => {
      expect(quizSessionStatusV1(token1, -1, sessionId1)).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const token2 = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody.token as string;
      expect(quizSessionStatusV1(token2, quizId1, sessionId1)).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    test('Invalid sessionId', () => {
      expect(quizSessionStatusV1(token1, quizId1, -1)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('SessionId does not refer to a valid session within this quiz', () => {
      const quizId2 = quizCreateV2(token1, QUIZ2.name, QUIZ2.description).jsonBody.quizId as number;
      quizQuestionCreateV2(token1, quizId2, QUESTION_BODY1).jsonBody.questionId as number;
      const sessionId2 = quizSessionStartV1(token1, quizId2, 0).jsonBody.sessionId as number;
      expect(quizSessionStatusV1(token1, quizId1, sessionId2)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});
