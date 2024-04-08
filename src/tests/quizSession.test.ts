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
  // quizSessionListV1,
  quizSessionStartV1,
  quizSessionUpdateV1,
  quizSessionListV1,
  quizSessionStatusV1,
  // quizSessionResultsV1,
  // quizSessionCSVResultsV1,
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

import { QuizMetadata } from '../functionTypes';

import sleep from 'atomic-sleep';

beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

//= =============================================================================
// POST /v2/admin/quiz/{quizid}/transfer waiting on quizSessionStartV1 and quizSessionUpdateV1 to be implemented
// POST /v1/admin/quiz/:quizid/session/start waiting on quizSessionListV1, quizSessionStatusV1 and quizInfoV2 to be implemented
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

describe.only('Testing PUT /v1/admin/quiz/:quizid/session/:sessionid', () => {
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
      const response = quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody;
      expect(response.state).toStrictEqual(State.QUESTION_COUNTDOWN);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, InvalidAction)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each([
      Action.NEXT_QUESTION,
      Action.SKIP_COUNTDOWN,
      Action.GO_TO_FINAL_RESULTS,
    ])('%s action cannot be applied in the QUESTION_OPEN state', (InvalidAction) => {
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION)
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN)
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_OPEN);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, InvalidAction)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each([
      Action.NEXT_QUESTION,
      Action.SKIP_COUNTDOWN,
    ])('%s action cannot be applied in the QUESTION_CLOSE state', (InvalidAction) => {
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION)).toStrictEqual(OK_SUCCESS);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN)).toStrictEqual(OK_SUCCESS);
      sleep(QUESTION_BODY1.duration * 1000);
      expect(quizSessionStatusV1(token1, quizId1, sessionId1).jsonBody.state).toStrictEqual(State.QUESTION_CLOSE);
      expect(quizSessionUpdateV1(token1, quizId1, sessionId1, InvalidAction)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each([
      Action.NEXT_QUESTION,
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
