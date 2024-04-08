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
} from '../testTypes';

import {
  // State,
  Action
} from '../dataTypes';

import { QuizMetadata } from '../functionTypes';

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

  test.skip('Starts a new active quiz session for a quiz', () => {
    const sessionId = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
    const response = quizSessionListV1(token1, quizId1).jsonBody;
    expect(response.activeSessions).toStrictEqual([sessionId]);
  });

  describe.skip('Copies the quiz so any edits to the quiz does not affect the active session', () => {
    let sessionId: number;
    let beforeMetadata: QuizMetadata;
    beforeEach(() => {
      sessionId = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
      beforeMetadata = quizSessionStatusV1(token1, quizId1, sessionId).jsonBody.metadata;
    });

    test.only('Quiz is copied correctly', () => {
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
