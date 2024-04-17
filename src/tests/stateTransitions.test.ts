import sleep from 'atomic-sleep';
import { State, Action } from '../dataTypes';
import {
  clearV1,
  authRegisterV1,
  quizCreateV2,
  quizQuestionCreateV2,
  quizSessionStartV1,
  quizSessionUpdateV1,
  quizSessionStatusV1,
} from '../httpHelpers';
import {
  USER1,
  QUIZ1,
  QUESTION_BODY1,
  QUESTION_BODY2,
  OK_SUCCESS,
} from '../testTypes';

let token1: string;
let quizId1: number;
let sessionId1: number;

beforeEach(() => {
  clearV1();
  token1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
  quizId1 = quizCreateV2(token1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
  quizQuestionCreateV2(token1, quizId1, QUESTION_BODY1);
  quizQuestionCreateV2(token1, quizId1, QUESTION_BODY2);
  sessionId1 = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
});

afterEach(() => {
  clearV1();
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
    sleep(3000);
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
