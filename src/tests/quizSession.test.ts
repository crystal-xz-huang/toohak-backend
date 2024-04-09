import {
  clearV1,
  authRegisterV1,
  quizListV2,
  quizCreateV2,
  quizTransferV2,
  // quizSessionListV1,
  quizSessionStartV1,
  quizSessionUpdateV1,
  // quizSessionStatusV1,
  // quizSessionResultsV1,
  // quizSessionCSVResultsV1,
} from '../testHelpers';

import {
  BAD_REQUEST_ERROR,
  // UNAUTHORISED_ERROR,
  // FORBIDDEN_ERROR,
  USER1,
  USER2,
  QUIZ1,
  // QUIZ2,
  // QUIZ3,
} from '../testTypes';

import {
  // State,
  Action
} from '../dataTypes';

beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

//= =============================================================================
// Waiting on quizSessionStartV1 and quizSessionUpdateV1 to be implemented
//= =============================================================================
describe.skip('Testing POST /v2/admin/quiz/{quizid}/transfer', () => {
  let token1: string;
  let token2: string;
  let quizId1: number;
  let sessionId1: number;
  let sessionId2: number;
  beforeEach(() => {
    token1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId1 = quizCreateV2(token1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    sessionId1 = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
    sessionId2 = quizSessionStartV1(token1, quizId1, 1).jsonBody.sessionId as number;
    token2 = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody.token as string;
  });

  describe('Bad request error if any session for this quiz is not in END state', () => {
    beforeEach(() => {
      // sessionId1 is in LOBBY state
      // sessionId2 is in END state
      quizSessionUpdateV1(token1, quizId1, sessionId2, Action.END);
    });

    test('One session in LOBBY state', () => {
      expect(quizTransferV2(token1, quizId1, USER2.email)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('One session in QUESTION_COUNTDOWN state', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.NEXT_QUESTION);
      expect(quizTransferV2(token1, quizId1, USER2.email)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('One session in QUESTION_OPEN state', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.SKIP_COUNTDOWN);
      expect(quizTransferV2(token1, quizId1, USER2.email)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('One session in ANSWER_SHOW state', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_ANSWER);
      expect(quizTransferV2(token1, quizId1, USER2.email)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('One session in FINAL_RESULTS state', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId1, Action.GO_TO_FINAL_RESULTS);
      expect(quizTransferV2(token1, quizId1, USER2.email)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  test('Successful quiz transfer when all sessions are in END state', () => {
    quizSessionUpdateV1(token1, quizId1, sessionId1, Action.END);
    quizSessionUpdateV1(token1, quizId1, sessionId2, Action.END);
    expect(quizTransferV2(token1, quizId1, USER2.email)).toStrictEqual({});
    expect(quizListV2(token1)).toStrictEqual({ quizzes: [] });
    expect(quizListV2(token2)).toStrictEqual({ quizzes: [{ quizId: quizId1, name: QUIZ1.name }] });
  });
});
