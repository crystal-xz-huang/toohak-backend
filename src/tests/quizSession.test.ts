import {
  clearV1,
  authRegisterV1,
  authLogoutV1,
  quizListV2,
  quizInfoV2,
  quizTrashV2,
  quizCreateV2,
  quizNameUpdateV2,
  quizDescriptionUpdateV2,
  quizTransferV2,
  quizQuestionCreateV2,
  quizQuestionUpdateV2,
  quizQuestionRemoveV2,
  quizQuestionMoveV2,
  // quizQuestionDuplicateV2,
  quizSessionStartV1,
  quizSessionUpdateV1,
  quizSessionListV1,
  quizSessionStatusV1,
  quizSessionResultsV1,
  // quizSessionCSVResultsV1,
  playerJoinV1,
  playerQuestionInfoV1,
  playerQuestionAnswerV1,
  // playerQuestionResultsV1,
  // playerFinalResultsV1,
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
} from '../testTypes';
import {
  State,
  Action
} from '../dataTypes';
import { 
  QuizMetadata,
  UserScore,
  PlayerQuestionResultsReturn,
  PlayerQuestionInfoReturn,
} from '../functionTypes';
import { 
  sortArray,
  getQuestionAnswerIds,
} from '../testHelpers';
import sleep from 'atomic-sleep';
import exp from 'constants';

beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

//= =============================================================================
//= =============================================================================

describe('Testing POST /v2/admin/quiz/{quizid}/transfer', () => {
  let token1: string;
  let token2: string;
  let quizId1: number;
  let sessionId1: number;
  let sessionId2: number;
  beforeEach(() => {
    token1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId1 = quizCreateV2(token1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    quizQuestionCreateV2(token1, quizId1, QUESTION_BODY1).jsonBody.questionId as number;
    sessionId1 = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
    sessionId2 = quizSessionStartV1(token1, quizId1, 1).jsonBody.sessionId as number;
    token2 = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody.token as string;
  });

  test('Bad request error if any session for this quiz is not in END state', () => {
    // sessionId1 is in LOBBY state
    // sessionId2 is in END state
    quizSessionUpdateV1(token1, quizId1, sessionId2, Action.END);
    // LOBBY -> QUESTION_COUNTDOWN
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION);
    expect(quizTransferV2(token1, quizId1, USER2.email)).toStrictEqual(BAD_REQUEST_ERROR);
    // QUESTION_COUNTDOWN -> QUESTION_OPEN
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN);
    expect(quizTransferV2(token1, quizId1, USER2.email)).toStrictEqual(BAD_REQUEST_ERROR);
    // QUESTION_OPEN -> QUESTION_CLOSE
    sleep(QUESTION_BODY1.duration * 1000);
    expect(quizTransferV2(token1, quizId1, USER2.email)).toStrictEqual(BAD_REQUEST_ERROR);
    // QUESTION_CLOSE -> ANSWER_SHOW
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_ANSWER);
    expect(quizTransferV2(token1, quizId1, USER2.email)).toStrictEqual(BAD_REQUEST_ERROR);
    // ANSWER_SHOW -> FINAL_RESULTS
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_FINAL_RESULTS);
    expect(quizTransferV2(token1, quizId1, USER2.email)).toStrictEqual(BAD_REQUEST_ERROR);
  });

  test('Successful quiz transfer when all sessions are in END state', () => {
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END);
    quizSessionUpdateV1(token1, quizId1, sessionId2, Action.END);
    const response = quizTransferV2(token1, quizId1, USER2.email);
    expect(response.statusCode).toStrictEqual(200);
    expect(quizListV2(token1).jsonBody).toStrictEqual({ quizzes: [] });
    expect(quizListV2(token2).jsonBody).toStrictEqual({ quizzes: [{ quizId: quizId1, name: QUIZ1.name }] });
  });
});

describe('Testing GET /v1/admin/quiz/:quizid/sessions', () => {
  let token1: string;
  let quizId1: number;
  let sessionId1: number, sessionId2: number, sessionId3: number, sessionId4: number;
  beforeEach(() => {
    clearV1();
    token1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId1 = quizCreateV2(token1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    quizQuestionCreateV2(token1, quizId1, QUESTION_BODY1).jsonBody.questionId as number;
    sessionId1 = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
    sessionId2 = quizSessionStartV1(token1, quizId1, 1).jsonBody.sessionId as number;
    sessionId3 = quizSessionStartV1(token1, quizId1, 2).jsonBody.sessionId as number;
    sessionId4 = quizSessionStartV1(token1, quizId1, 3).jsonBody.sessionId as number;
  });

  afterEach(() => {
    clearV1();
  });

  test('Correct status code and return value', () => {
    const response = quizSessionListV1(token1, quizId1);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({
      activeSessions: expect.any(Array),
      inactiveSessions: expect.any(Array),
    });
  });

  test('Retrieves active and inactive session ids (sorted in ascending order) for a quiz', () => {
    const response = quizSessionListV1(token1, quizId1).jsonBody;
    expect(response.activeSessions).toStrictEqual(sortArray([sessionId1, sessionId2, sessionId3, sessionId4]));
    expect(response.inactiveSessions).toStrictEqual([]);
  });

  test('Quiz has both active and inactive sessions', () => {
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END);
    quizSessionUpdateV1(token1, quizId1, sessionId2, Action.END);
    const response = quizSessionListV1(token1, quizId1).jsonBody;
    expect(response.activeSessions).toStrictEqual(sortArray([sessionId3, sessionId4]));
    expect(response.inactiveSessions).toStrictEqual(sortArray([sessionId1, sessionId2]));
  });

  test('Quiz has only inactive sessions', () => {
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END);
    quizSessionUpdateV1(token1, quizId1, sessionId2, Action.END);
    quizSessionUpdateV1(token1, quizId1, sessionId3, Action.END);
    quizSessionUpdateV1(token1, quizId1, sessionId4, Action.END);
    const response = quizSessionListV1(token1, quizId1).jsonBody;
    expect(response.activeSessions).toStrictEqual([]);
    expect(response.inactiveSessions).toStrictEqual(sortArray([sessionId1, sessionId2, sessionId3, sessionId4]));
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizSessionListV1('', quizId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizSessionListV1(token1 + 'random', quizId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid looged in user session', () => {
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

    test('Token does not refer to a valid looged in user session', () => {
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

    test('Token does not refer to a valid looged in user session', () => {
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

  describe('State transitions from LOBBY state', () => {
    test('LOBBY -> END', () => {
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.LOBBY);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.END);
    });

    test('LOBBY -> QUESTION_COUNTDOWN', () => {
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.LOBBY);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_COUNTDOWN);
    });
  });

  describe('State transitions from QUESTION_COUNTDOWN state', () => {
    beforeEach(() => {
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_COUNTDOWN);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(1);
    });

    test('QUESTION_COUNTDOWN -> END', () => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.END);
    });

    test('QUESTION_COUNTDOWN -> QUESTION_OPEN with SKIP_COUNTDOWN', () => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_OPEN);
    });

    test('QUESTION_COUNTDOWN -> QUESTION_OPEN without SKIP_COUNTDOWN', () => {
      sleep(3000); // wait for 3 seconds
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_OPEN);
    });
  });

  describe('State transitions from QUESTION_OPEN state', () => {
    beforeEach(() => {
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_OPEN);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(1);
    });

    test('QUESTION_OPEN -> END', () => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.END);
    });

    test('QUESTION_OPEN -> QUESTION_CLOSE', () => {
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_OPEN);
      sleep(QUESTION_BODY1.duration * 1000); // wait for the duration of the question
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_CLOSE);
    });

    test('QUESTION_OPEN -> ANSWER_SHOW', () => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_ANSWER)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.ANSWER_SHOW);
    });
  });

  describe('State transitions from QUESTION_CLOSE state', () => {
    beforeEach(() => {
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN);
      sleep(QUESTION_BODY1.duration * 1000);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_CLOSE);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(1);
    });

    test('QUESTION_CLOSE -> END', () => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.END);
    });

    test('QUESTION_CLOSE -> ANSWER_SHOW', () => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_ANSWER)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.ANSWER_SHOW);
    });

    test('QUESTION_CLOSE -> FINAL_RESULTS', () => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_FINAL_RESULTS)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.FINAL_RESULTS);
    });

    test('QUESTION_CLOSE -> QUESTION_COUNTDOWN', () => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_COUNTDOWN);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(2); // moved to the next question
    });
  });

  describe('State transitions from ANSWER_SHOW state', () => {
    beforeEach(() => {
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN);
      sleep(QUESTION_BODY1.duration * 1000);
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_ANSWER);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.ANSWER_SHOW);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(1);
    });

    test('ANSWER_SHOW -> END', () => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.END);
    });

    test('ANSWER_SHOW -> QUESTION_COUNTDOWN', () => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_COUNTDOWN);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.atQuestion).toStrictEqual(2); // moved to the next question
    });

    test('ANSWER_SHOW -> FINAL_RESULTS', () => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_FINAL_RESULTS)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.FINAL_RESULTS);
    });

    test('ANSWER_SHOW -> FINAL_RESULTS -> END', () => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_FINAL_RESULTS)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.FINAL_RESULTS);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.END);
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
  });

  test.skip('Names of all the players in the quiz session are ordered in ascending order of player name', () => {
    // TODO:
    // Add players to the session
    // Check if the names are sorted with sortArray()
  });

  test('Correct state, atQuestion, players and metadata values', () => {
    const response = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody;
    expect(response.state).toStrictEqual(State.LOBBY);
    expect(response.atQuestion).toStrictEqual(0);
    expect(response.players).toStrictEqual([]);
    expect(response.metadata).toStrictEqual({
      quizId: quizId1,
      name: QUIZ1.name,
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: QUIZ1.description,
      numQuestions: 1,
      questions: [
        {
          questionId: questionId1,
          question: QUESTION_BODY1.question,
          duration: QUESTION_BODY1.duration,
          thumbnailUrl: QUESTION_BODY1.thumbnailUrl,
          points: QUESTION_BODY1.points,
          answers: expect.any(Array),
        },
      ],
      duration: QUESTION_BODY1.duration,
      thumbnailUrl: expect.any(String),
    });
  });

  describe('Unauthorised errors', () => {
    test('Token is empty', () => {
      expect(quizSessionStatusV1('', quizId1, sessionId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizSessionStatusV1(token1 + 'random', quizId1, sessionId1)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid looged in user session', () => {
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

describe('Testing GET /v1/admin/quiz/{quizid}/session/{sessionid}/results', () => {
  let token1: string;
  let quizId1: number;
  let questionId1: number;
  let sessionId1: number;
  let player1: number;
  let player2: number;
  let player3: number;
  let player4: number;
  beforeEach(() => {
    token1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId1 = quizCreateV2(token1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    questionId1 = quizQuestionCreateV2(token1, quizId1, QUESTION_BODY2).jsonBody.questionId as number;
    sessionId1 = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
    player1 = playerJoinV1(sessionId1, 'Hayden').jsonBody.playerId as number;
    player2 = playerJoinV1(sessionId1, 'John').jsonBody.playerId as number;
    player3 = playerJoinV1(sessionId1, 'Alice').jsonBody.playerId as number;
    player4 = playerJoinV1(sessionId1, 'Bob').jsonBody.playerId as number;
  });
  
  test('Correct status code and return value', () => {
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION);
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN);
    const response = quizSessionResultsV1(token1, quizId1, sessionId1);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({
      usersRankedByScore: expect.any(Array) as UserScore[],
      questionResults: expect.any(Array) as PlayerQuestionResultsReturn[],
    });
  });

  describe('Correct usersRankedByScore and questionResults values', () => {
    let answerIds: number[];
    beforeEach(() => {
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN);
      const questionInfo = playerQuestionInfoV1(sessionId1, player1).jsonBody as PlayerQuestionInfoReturn;
      answerIds = getQuestionAnswerIds(questionInfo);
    });

    test('No players have answered any questions', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_FINAL_RESULTS);
      const response = quizSessionResultsV1(token1, quizId1, sessionId1).jsonBody;
      // no answer = 0 score
      expect(response.usersRankedByScore).toStrictEqual([
        { name: 'Hayden', score: 0 },
        { name: 'John', score: 0 },
        { name: 'Alice', score: 0 },
        { name: 'Bob', score: 0 },
      ]);
      expect(response.questionResults).toStrictEqual([
        {
          questionId: questionId1,
          playersCorrectList: [],
          averageAnswerTime: 0,
          percentCorrect: 0,
        },
      ]);
    });

    test('All players have answered the question correctly', () => {
      // Points = 5, answerId[0] is the correct answer, answerId[1] is the incorrect answer
      playerQuestionAnswerV1(player1, 1, [answerIds[0]]); // Hayden - score 5 * 1/1 = 5
      playerQuestionAnswerV1(player2, 1, [answerIds[0]]); // John - score 5 * 1/2 = 2.5 = 3 (rounded up)
      playerQuestionAnswerV1(player3, 1, [answerIds[0]]); // Alice - score 5 * 1/3 = 1.67 = 2
      playerQuestionAnswerV1(player4, 1, [answerIds[0]]); // Bob - score 5 * 1/4 = 1.25 = 1
      
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_FINAL_RESULTS);

      const ret = quizSessionResultsV1(token1, quizId1, sessionId1).jsonBody;
      expect(ret.usersRankedByScore).toStrictEqual([
        { name: 'Hayden', score: 5 },
        { name: 'John', score: 3 },
        { name: 'Alice', score: 2 },
        { name: 'Bob', score: 1 },
      ]);
      expect(ret.questionResults).toStrictEqual([
        {
          questionId: questionId1,
          playersCorrectList: ['Hayden', 'John', 'Alice', 'Bob'],
          averageAnswerTime: 0,
          percentCorrect: 100,
        },
      ]);
    });

    test('All players have answered the question incorrectly', () => {
      playerQuestionAnswerV1(player1, 1, [answerIds[1]]); 
      playerQuestionAnswerV1(player2, 1, [answerIds[1]]); 
      playerQuestionAnswerV1(player3, 1, [answerIds[1]]); 
      playerQuestionAnswerV1(player4, 1, [answerIds[1]]); 
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_FINAL_RESULTS);
      
      expect(quizSessionResultsV1(token1, quizId1, sessionId1).jsonBody).toStrictEqual({
        usersRankedByScore: [
          { name: 'Hayden', score: 0 },
          { name: 'John', score: 0 },
          { name: 'Alice', score: 0 },
          { name: 'Bob', score: 0 },
        ],
        questionResults: [
          {
            questionId: questionId1,
            playersCorrectList: [],
            averageAnswerTime: 0,
            percentCorrect: 0,
          },
        ],
      });
    });

    test('Half of the players have answered the question correctly', () => {
      playerQuestionAnswerV1(player1, 1, [answerIds[0]]);  // Hayden - score 5 * 1/1 = 5
      playerQuestionAnswerV1(player2, 1, [answerIds[0], answerIds[1]]);  // John - score 0
      playerQuestionAnswerV1(player3, 1, [answerIds[0]]); // Alice - score 5 * 1/3 = 1.67 = 2
      playerQuestionAnswerV1(player4, 1, [answerIds[1]]); // Bob - score 0
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_FINAL_RESULTS);
      
      expect(quizSessionResultsV1(token1, quizId1, sessionId1).jsonBody).toStrictEqual({
        usersRankedByScore: [
          { name: 'Hayden', score: 5 },
          { name: 'Alice', score: 2 },
          { name: 'John', score: 0 },
          { name: 'Bob', score: 0 },
        ],
        questionResults: [
          {
            questionId: questionId1,
            playersCorrectList: ['Hayden', 'Alice'],
            averageAnswerTime: 0,
            percentCorrect: 50,
          },
        ],
      });
    });

    test('Mixed results', () => {
      playerQuestionAnswerV1(player1, 1, [answerIds[1]]);  // Hayden - score 0
      playerQuestionAnswerV1(player2, 1, [answerIds[0]]);  // John - score 5 * 1/2 = 2.5 = 3
      playerQuestionAnswerV1(player3, 1, [answerIds[1], answerIds[0]]); // Alice - score 0
      playerQuestionAnswerV1(player4, 1, [answerIds[0]]); // Bob - score 5 * 1/4 = 1.25 = 1
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_FINAL_RESULTS);
      
      expect(quizSessionResultsV1(token1, quizId1, sessionId1).jsonBody).toStrictEqual({
        usersRankedByScore: [
          { name: 'John', score: 3 },
          { name: 'Bob', score: 1 },
          { name: 'Hayden', score: 0 },
          { name: 'Alice', score: 0 },
        ],
        questionResults: [
          {
            questionId: questionId1,
            playersCorrectList: ['John', 'Bob'],
            averageAnswerTime: 0,
            percentCorrect: 50,
          },
        ],
      });
    });

    test('All players have answered the question correctly but with different times', () => {
      playerQuestionAnswerV1(player1, 1, [answerIds[0]]);  // Hayden - score 5 * 1/1 = 5
      sleep(1000); // 1 second delay
      playerQuestionAnswerV1(player2, 1, [answerIds[0]]);  // John - score 5 * 1/2 = 2.5 = 3
      sleep(2000); // 2 second delay
      playerQuestionAnswerV1(player3, 1, [answerIds[0]]); // Alice - score 5 * 1/3 = 1.67 = 2
      sleep(5000); // 5 second delay
      playerQuestionAnswerV1(player4, 1, [answerIds[0]]); // Bob - score 5 * 1/4 = 1.25 = 1
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_FINAL_RESULTS);
      expect(quizSessionResultsV1(token1, quizId1, sessionId1).jsonBody).toStrictEqual({
        usersRankedByScore: [
          { name: 'Hayden', score: 5 },
          { name: 'John', score: 3 },
          { name: 'Alice', score: 2 },
          { name: 'Bob', score: 1 },
        ],
        questionResults: [
          {
            questionId: questionId1,
            playersCorrectList: ['Hayden', 'John', 'Alice', 'Bob'],
            averageAnswerTime: 3,
            percentCorrect: 100,
          },
        ],
      });
    });

    describe('Unauthorised errors', () => {
      test('Token is empty', () => {
        expect(quizSessionResultsV1('', quizId1, sessionId1)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('Token does not refer to a valid user session', () => {
        expect(quizSessionResultsV1(token1 + 'random', quizId1, sessionId1)).toStrictEqual(UNAUTHORISED_ERROR);
      });

      test('Token does not refer to a valid looged in user session', () => {
        authLogoutV1(token1);
        expect(quizSessionResultsV1(token1, quizId1, sessionId1)).toStrictEqual(UNAUTHORISED_ERROR);
      });
    });

    describe('Forbidden errors', () => {
      test('Valid token but invalid quizId', () => {
        expect(quizSessionResultsV1(token1, -1, sessionId1)).toStrictEqual(FORBIDDEN_ERROR);
      });

      test('Valid token but user does not own the quiz', () => {
        const token2 = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody.token as string;
        expect(quizSessionResultsV1(token2, quizId1, sessionId1)).toStrictEqual(FORBIDDEN_ERROR);
      });
    });

    describe('Bad request errors', () => {
      test('Invalid sessionId', () => {
        expect(quizSessionResultsV1(token1, quizId1, -1)).toStrictEqual(BAD_REQUEST_ERROR);
      });
    
      test('SessionId does not refer to a valid session within this quiz', () => {
        const quizId2 = quizCreateV2(token1, QUIZ2.name, QUIZ2.description).jsonBody.quizId as number;
        quizQuestionCreateV2(token1, quizId2, QUESTION_BODY1).jsonBody.questionId as number;
        const sessionId2 = quizSessionStartV1(token1, quizId2, 0).jsonBody.sessionId as number;
        expect(quizSessionResultsV1(token1, quizId1, sessionId2)).toStrictEqual(BAD_REQUEST_ERROR);
      });

      test('Session is not in the FINAL_RESULTS state', () => {
        expect(quizSessionResultsV1(token1, quizId1, sessionId1)).toStrictEqual(BAD_REQUEST_ERROR);
      });
    });
  });





  // {
  //   "usersRankedByScore": [
  //     {
  //       "name": "Hayden",
  //       "score": 45
  //     }
  //   ],
  //   "questionResults": [
  //     {
  //       "questionId": 5546,
  //       "playersCorrectList": [
  //         "Hayden"
  //       ],
  //       "averageAnswerTime": 45,
  //       "percentCorrect": 54
  //     }
  //   ]
  // }

});