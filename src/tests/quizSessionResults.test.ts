import {
  clearV1,
  authRegisterV1,
  authLogoutV1,
  quizCreateV2,
  quizInfoV2,
  quizQuestionCreateV2,
  quizSessionStartV1,
  quizSessionUpdateV1,
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
  QUESTION_BODY4,
  QUESTION_BODY5,
} from '../testTypes';
import {
  State,
  Action
} from '../dataTypes';
import {
  UserScore,
  PlayerQuestionResultsReturn,
  PlayerQuestionInfoReturn,
  AdminQuizInfoReturn,
} from '../functionTypes';
import {
  sortStringArray,
  getQuestionAnswerIds,
  getAnswerIds,
} from '../testHelpers';
import sleep from 'atomic-sleep';

beforeEach(() => {
  clearV1();
});

afterEach(() => {
  clearV1();
});

describe('Testing PUT /v1/player/{playerid}/question/{questionposition}/answer', () => {
  let token1: string;
  let quizId1: number;
  let sessionId: number;
  let player1: number;
  let answerIds1: number[];
  let answerIds2: number[];
  beforeEach(() => {
    token1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId1 = quizCreateV2(token1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
    const q1 = quizQuestionCreateV2(token1, quizId1, QUESTION_BODY1).jsonBody.questionId as number;
    const q2 = quizQuestionCreateV2(token1, quizId1, QUESTION_BODY2).jsonBody.questionId as number;
    sessionId = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
    player1 = playerJoinV1(sessionId, 'Tommy').jsonBody.playerId as number;
    const quizInfo = quizInfoV2(token1, quizId1).jsonBody as AdminQuizInfoReturn;
    answerIds1 = getAnswerIds(quizInfo, q1);
    answerIds2 = getAnswerIds(quizInfo, q2);
  });

  test('Correct status code and return value', () => {
    quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
    quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN);
    const response = playerQuestionAnswerV1(player1, 1, [answerIds1[0]]);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({});
  });

  describe('Bad request errors', () => {
    beforeEach(() => {
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN);
    });

    test('Player ID does not exist', () => {
      expect(playerQuestionAnswerV1(-1, 1, [answerIds1[0]])).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test.each([0, -1, 3])('Question position %i is invalid', (position) => {
      expect(playerQuestionAnswerV1(player1, position, [answerIds1[0]])).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Session is not up to this question yet', () => {
      expect(playerQuestionAnswerV1(player1, 2, [answerIds2[0]])).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Answer ID is invalid for this question', () => {
      expect(quizSessionStatusV1(token1, quizId1, sessionId).jsonBody.atQuestion).toStrictEqual(1);
      const questionInfo = playerQuestionInfoV1(player1, 1).jsonBody as PlayerQuestionInfoReturn;
      const answerIds = getQuestionAnswerIds(questionInfo);
      expect(playerQuestionAnswerV1(player1, 1, [answerIds[0] + 10])).toStrictEqual(BAD_REQUEST_ERROR);
      expect(playerQuestionAnswerV1(player1, 1, [answerIds[1] - 20])).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Duplicate answer IDs given', () => {
      expect(playerQuestionAnswerV1(player1, 1, [answerIds1[0], answerIds1[0]])).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Less than 1 answer ID given', () => {
      expect(playerQuestionAnswerV1(player1, 1, [])).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('More than 2 answer ID given for two-answer question', () => {
      expect(playerQuestionAnswerV1(player1, 1, [answerIds1[0], answerIds1[1], answerIds1[0]])).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Bad request error if session is not in QUESTION_OPEN state', () => {
    test('Session is in LOBBY state', () => {
      expect(playerQuestionAnswerV1(player1, 1, [answerIds1[0]])).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Session is in QUESTION_COUNTDOWN state', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      expect(playerQuestionAnswerV1(player1, 1, [answerIds1[0]])).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Session is in QUESTION_CLOSE state', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN);
      sleep(QUESTION_BODY1.duration * 1000);
      expect(playerQuestionAnswerV1(player1, 1, [answerIds1[0]])).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Session is in ANSWER_SHOW state', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      expect(playerQuestionAnswerV1(player1, 1, [answerIds1[0]])).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Session is in FINAL_RESULTS state', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);
      expect(playerQuestionAnswerV1(player1, 1, [answerIds1[0]])).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('Session is in END state', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.END);
      expect(playerQuestionAnswerV1(player1, 1, [answerIds1[0]])).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });
});

describe.skip('Testing GET /v1/admin/quiz/{quizid}/session/{sessionid}/results', () => {
  let token1: string;
  let quizId1: number;
  let questionId1: number;
  let questionId2: number;
  let sessionId: number;
  let player1: number;
  let player2: number;
  let player3: number;
  let player4: number;
  let answerIds: number[];
  beforeEach(() => {
    token1 = authRegisterV1(USER1.email, USER1.password, USER1.nameFirst, USER1.nameLast).jsonBody.token as string;
    quizId1 = quizCreateV2(token1, QUIZ1.name, QUIZ1.description).jsonBody.quizId as number;
  });

  test('Correct status code and return value', () => {
    questionId1 = quizQuestionCreateV2(token1, quizId1, QUESTION_BODY1).jsonBody.questionId as number;
    sessionId = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
    player1 = playerJoinV1(sessionId, 'Tommy').jsonBody.playerId as number;
    quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
    quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN);
    quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
    quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);
    expect(quizSessionStatusV1(token1, quizId1, sessionId).jsonBody.state).toStrictEqual(State.FINAL_RESULTS);
    const response = quizSessionResultsV1(token1, quizId1, sessionId);
    expect(response.statusCode).toStrictEqual(200);
    expect(response.jsonBody).toStrictEqual({
      usersRankedByScore: expect.any(Array) as UserScore[],
      questionResults: expect.any(Array) as PlayerQuestionResultsReturn[],
    });
  });

  describe('Final results for session with 1 question', () => {
    /**
     * answerIds[0] is the correct answer, answerIds[1] is the incorrect answer
     * Duration = 10, points = 5
     * Score = Points * (1 / N) => round up
     */
    beforeEach(() => {
      questionId1 = quizQuestionCreateV2(token1, quizId1, QUESTION_BODY2).jsonBody.questionId as number;
      sessionId = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
      player1 = playerJoinV1(sessionId, 'Tommy').jsonBody.playerId as number;
      player2 = playerJoinV1(sessionId, 'Mason').jsonBody.playerId as number;
      player3 = playerJoinV1(sessionId, 'Alice').jsonBody.playerId as number;
      player4 = playerJoinV1(sessionId, 'Katie').jsonBody.playerId as number;
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN); // move to question open
      const questionInfo = playerQuestionInfoV1(player1, 1).jsonBody as PlayerQuestionInfoReturn;
      answerIds = getQuestionAnswerIds(questionInfo);
    });

    test('No players have answered any questions', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);

      const response = quizSessionResultsV1(token1, quizId1, sessionId).jsonBody;
      // All players have score 0, no specified order
      expect(response.usersRankedByScore).toContainEqual({ name: 'Tommy', score: 0 });
      expect(response.usersRankedByScore).toContainEqual({ name: 'Mason', score: 0 });
      expect(response.usersRankedByScore).toContainEqual({ name: 'Alice', score: 0 });
      expect(response.usersRankedByScore).toContainEqual({ name: 'Katie', score: 0 });

      expect(response.questionResults).toStrictEqual([
        {
          questionId: questionId1,
          playersCorrectList: [],
          averageAnswerTime: expect.any(Number),
          percentCorrect: 0,
        },
      ]);
    });

    test('All players have answered the question correctly', () => {
      playerQuestionAnswerV1(player1, 1, [answerIds[0]]); // Tommy: 5 * 1/1 = 5
      playerQuestionAnswerV1(player2, 1, [answerIds[0]]); // Mason: 5 * 1/2 = 2.5 = 3
      playerQuestionAnswerV1(player3, 1, [answerIds[0]]); // Alice: 5 * 1/3 = 1.67 = 2
      playerQuestionAnswerV1(player4, 1, [answerIds[0]]); // Katie: 5 * 1/4 = 1.25 = 1

      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);

      const ret = quizSessionResultsV1(token1, quizId1, sessionId).jsonBody;
      expect(ret.usersRankedByScore).toStrictEqual([
        { name: 'Tommy', score: 5 },
        { name: 'Mason', score: 3 },
        { name: 'Alice', score: 2 },
        { name: 'Katie', score: 1 },
      ]);

      expect(ret.questionResults).toStrictEqual([
        {
          questionId: questionId1,
          playersCorrectList: sortStringArray(['Tommy', 'Mason', 'Alice', 'Katie']),
          averageAnswerTime: expect.any(Number),
          percentCorrect: 100,
        },
      ]);
    });

    test('All players have answered the question incorrectly', () => {
      playerQuestionAnswerV1(player1, 1, [answerIds[1]]);
      playerQuestionAnswerV1(player2, 1, [answerIds[1]]);
      playerQuestionAnswerV1(player3, 1, [answerIds[1]]);
      playerQuestionAnswerV1(player4, 1, [answerIds[1]]);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);

      expect(quizSessionResultsV1(token1, quizId1, sessionId).jsonBody).toStrictEqual({

        usersRankedByScore: [
          { name: 'Tommy', score: 0 },
          { name: 'Mason', score: 0 },
          { name: 'Alice', score: 0 },
          { name: 'Katie', score: 0 },
        ],
        questionResults: [
          {
            questionId: questionId1,
            playersCorrectList: [],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 0,
          },
        ],
      });
    });

    test('Half of the players have answered the question correctly', () => {
      playerQuestionAnswerV1(player1, 1, [answerIds[0]]); // Tommy: 5 * 1/1 = 5
      playerQuestionAnswerV1(player2, 1, [answerIds[0], answerIds[1]]); // Mason: 0
      playerQuestionAnswerV1(player3, 1, [answerIds[0]]); // Alice: 5 * 1/2 = 2.5 = 3
      playerQuestionAnswerV1(player4, 1, [answerIds[1]]); // Katie: 0
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);

      expect(quizSessionResultsV1(token1, quizId1, sessionId).jsonBody).toStrictEqual({
        usersRankedByScore: [
          { name: 'Tommy', score: 5 },
          { name: 'Alice', score: 3 },
          { name: 'Mason', score: 0 },
          { name: 'Katie', score: 0 },
        ],
        questionResults: [
          {
            questionId: questionId1,
            playersCorrectList: sortStringArray(['Tommy', 'Alice']) as string[],
            averageAnswerTime: expect.any(Number),
            percentCorrect: 50,
          },
        ],
      });
    });

    test('Mixed results', () => {
      playerQuestionAnswerV1(player1, 1, [answerIds[1]]); // Tommy: 0
      playerQuestionAnswerV1(player2, 1, [answerIds[0]]); // Mason: 5 * 1/1 = 5
      playerQuestionAnswerV1(player3, 1, [answerIds[1], answerIds[0]]); // Alice: 0
      playerQuestionAnswerV1(player4, 1, [answerIds[0]]); // Katie: 5 * 1/2 = 2.5 = 3
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);

      expect(quizSessionResultsV1(token1, quizId1, sessionId).jsonBody).toStrictEqual({
        usersRankedByScore: [
          { name: 'Mason', score: 5 },
          { name: 'Katie', score: 3 },
          { name: 'Tommy', score: 0 },
          { name: 'Alice', score: 0 },
        ],
        questionResults: [
          {
            questionId: questionId1,
            playersCorrectList: sortStringArray(['Mason', 'Katie']),
            averageAnswerTime: expect.any(Number),
            percentCorrect: 50,
          },
        ],
      });
    });
  });

  describe('Final results for session with 1 question and resubmissions', () => {
    beforeEach(() => {
      questionId1 = quizQuestionCreateV2(token1, quizId1, QUESTION_BODY4).jsonBody.questionId as number;
      sessionId = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
      player1 = playerJoinV1(sessionId, 'Tommy').jsonBody.playerId as number;
      player2 = playerJoinV1(sessionId, 'Mason').jsonBody.playerId as number;
      player3 = playerJoinV1(sessionId, 'Alice').jsonBody.playerId as number;
      player4 = playerJoinV1(sessionId, 'Katie').jsonBody.playerId as number;
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN); // move to question open
      const questionInfo = playerQuestionInfoV1(player1, 1).jsonBody as PlayerQuestionInfoReturn;
      answerIds = getQuestionAnswerIds(questionInfo);
    });

    test('Resubmitting a correct answer after initial incorrect answer', () => {
      playerQuestionAnswerV1(player1, 1, [answerIds[0]]);
      playerQuestionAnswerV1(player2, 1, [answerIds[0]]);
      playerQuestionAnswerV1(player3, 1, [answerIds[0]]);
      playerQuestionAnswerV1(player4, 1, [answerIds[0]]); // Katie: 7/1
      playerQuestionAnswerV1(player2, 1, [answerIds[0]]); // Mason: 7/2
      playerQuestionAnswerV1(player3, 1, [answerIds[0]]); // Alice  7/3
      playerQuestionAnswerV1(player1, 1, [answerIds[0]]); // Tommy  7/4

      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);

      const ret1 = quizSessionResultsV1(token1, quizId1, sessionId).jsonBody;
      expect(ret1.usersRankedByScore).toStrictEqual([
        { name: 'Katie', score: 7 },
        { name: 'Mason', score: Math.round(7 / 2) },
        { name: 'Alice', score: Math.round(7 / 3) },
        { name: 'Tommy', score: Math.round(7 / 4) },
      ]);

      expect(ret1.questionResults).toStrictEqual([
        {
          questionId: questionId1,
          playersCorrectList: sortStringArray(['Tommy', 'Mason', 'Alice', 'Katie']),
          averageAnswerTime: expect.any(Number),
          percentCorrect: 100,
        },
      ]);
    });

    test('Resubmitting a correct answer after submitting an incorrect answer', () => {
      playerQuestionAnswerV1(player1, 1, [answerIds[1]]);
      playerQuestionAnswerV1(player2, 1, [answerIds[0]]);
      playerQuestionAnswerV1(player3, 1, [answerIds[1]]);
      playerQuestionAnswerV1(player4, 1, [answerIds[0]]); // Katie:
      playerQuestionAnswerV1(player2, 1, [answerIds[0]]); // Mason:
      playerQuestionAnswerV1(player1, 1, [answerIds[1]]);
      playerQuestionAnswerV1(player3, 1, [answerIds[0]]); // Alice:

      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);

      expect(quizSessionResultsV1(token1, quizId1, sessionId).jsonBody).toStrictEqual({
        usersRankedByScore: [
          { name: 'Katie', score: 7 },
          { name: 'Mason', score: Math.round(7 / 2) },
          { name: 'Alice', score: Math.round(7 / 3) },
          { name: 'Tommy', score: 0 },
        ],
        questionResults: [
          {
            questionId: questionId1,
            playersCorrectList: sortStringArray(['Katie', 'Mason', 'Alice']),
            averageAnswerTime: expect.any(Number),
            percentCorrect: Math.round(3 / 4 * 100),
          },
        ],
      });
    });

    test('Resubmitting an incorrect answer after initial correct answer', () => {
      playerQuestionAnswerV1(player1, 1, [answerIds[1]]);
      playerQuestionAnswerV1(player2, 1, [answerIds[0]]); // Mason: 7 * 1/1 = 7
      playerQuestionAnswerV1(player4, 1, [answerIds[0]]);
      playerQuestionAnswerV1(player3, 1, [answerIds[0]]); // Alice: 7 * 1/2 = 3.5 = 4
      playerQuestionAnswerV1(player1, 1, [answerIds[1]]); // Tommy: 0
      playerQuestionAnswerV1(player4, 1, [answerIds[1]]); // Katie: 0

      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);
      expect(quizSessionResultsV1(token1, quizId1, sessionId).jsonBody).toStrictEqual({
        usersRankedByScore: [
          { name: 'Mason', score: 7 },
          { name: 'Alice', score: 4 },
          { name: 'Tommy', score: 0 },
          { name: 'Katie', score: 0 },
        ],
        questionResults: [
          {
            questionId: questionId1,
            playersCorrectList: sortStringArray(['Mason', 'Alice']),
            averageAnswerTime: expect.any(Number),
            percentCorrect: Math.round(2 / 4 * 100),
          },
        ],
      });
    });
  });

  describe('Final results for session with 2 questions', () => {
    let answerIds1: number[];
    let answerIds2: number[];
    beforeEach(() => {
      questionId1 = quizQuestionCreateV2(token1, quizId1, QUESTION_BODY1).jsonBody.questionId as number;
      questionId2 = quizQuestionCreateV2(token1, quizId1, QUESTION_BODY4).jsonBody.questionId as number;
      sessionId = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
      player1 = playerJoinV1(sessionId, 'Tommy').jsonBody.playerId as number;
      player2 = playerJoinV1(sessionId, 'Mason').jsonBody.playerId as number;
      player3 = playerJoinV1(sessionId, 'Alice').jsonBody.playerId as number;
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN); // move to question open
      const quizInfo = quizInfoV2(token1, quizId1).jsonBody as AdminQuizInfoReturn;
      answerIds1 = getAnswerIds(quizInfo, questionId1);
      answerIds2 = getAnswerIds(quizInfo, questionId2);
    });

    test('No resubmissions', () => {
      // QUESTION 1
      playerQuestionAnswerV1(player1, 1, [answerIds1[1]]);
      playerQuestionAnswerV1(player2, 1, [answerIds1[0]]); // Mason
      playerQuestionAnswerV1(player3, 1, [answerIds1[0]]); // Alice

      // MOVE TO QUESTION 2
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN);

      // QUESTION 2
      playerQuestionAnswerV1(player1, 2, [answerIds2[0]]); // Tommy
      playerQuestionAnswerV1(player2, 2, [answerIds2[0]]); // Mason
      playerQuestionAnswerV1(player3, 2, [answerIds2[0]]); // Alice

      // MOVE TO FINAL RESULTS
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);

      // CHECK RESULTS
      const response = quizSessionResultsV1(token1, quizId1, sessionId).jsonBody;
      expect(response.usersRankedByScore).toStrictEqual([
        { name: 'Mason', score: 8 }, // 5 + 3.5 = 8.5 = 9
        { name: 'Tommy', score: 7 }, // 7
        { name: 'Alice', score: 4 }, // 2.5 + 2.33 = 4.83 = 5
      ]);

      expect(response.questionResults).toStrictEqual([
        {
          questionResults: [
            {
              questionId: questionId1,
              playersCorrectList: sortStringArray(['Mason', 'Alice']),
              averageAnswerTime: expect.any(Number),
              percentCorrect: Math.round(2 / 3 * 100),
            },
            {
              questionId: questionId2,
              playersCorrectList: sortStringArray(['Tommy', 'Mason', 'Alice']),
              averageAnswerTime: expect.any(Number),
              percentCorrect: 100,
            },
          ],
        },
      ]);
    });

    test('With resubmissions', () => {
      // QUESTION 1 NEW SUBMISSIONS
      playerQuestionAnswerV1(player1, 1, [answerIds1[1]]);
      playerQuestionAnswerV1(player2, 1, [answerIds1[0]]);
      playerQuestionAnswerV1(player3, 1, [answerIds1[0]]);
      // MOVE TO QUESTION 2
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN);
      expect(quizSessionStatusV1(token1, quizId1, sessionId).jsonBody.state).toStrictEqual(State.QUESTION_OPEN);
      const questionInfo = playerQuestionInfoV1(player1, 2).jsonBody as PlayerQuestionInfoReturn;
      answerIds2 = getQuestionAnswerIds(questionInfo);
      expect(questionInfo.questionId).toStrictEqual(questionId2);
      // QUESTION 1 RESUBMISSIONS
      playerQuestionAnswerV1(player1, 1, [answerIds1[0]]); // Tommy: 5
      playerQuestionAnswerV1(player2, 1, [answerIds1[1]]); // Mason: 0
      playerQuestionAnswerV1(player3, 1, [answerIds1[0]]); // Alice: 5/2

      // QUESTION 2 NEW SUBMISSIONS
      playerQuestionAnswerV1(player1, 2, [answerIds2[1]]);
      playerQuestionAnswerV1(player2, 2, [answerIds2[0]]); // Mason: 7
      playerQuestionAnswerV1(player3, 2, [answerIds2[1]]);
      // QUESTION 2 RESUBMISSIONS
      playerQuestionAnswerV1(player1, 2, [answerIds2[0]]);
      playerQuestionAnswerV1(player3, 2, [answerIds2[1]]);
      playerQuestionAnswerV1(player1, 2, [answerIds2[1]]);
      playerQuestionAnswerV1(player3, 2, [answerIds2[0]]); // Alice: 7/2
      playerQuestionAnswerV1(player1, 2, [answerIds2[0]]); // Tommy: 7/3
      // MOVE TO FINAL RESULTS
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);
      // CHECK RESULTS
      const response = quizSessionResultsV1(token1, quizId1, sessionId).jsonBody;
      expect(response.usersRankedByScore).toStrictEqual([
        { name: 'Mason', score: 7 },
        { name: 'Tommy', score: 7 },
        { name: 'Alice', score: 6 },
      ]);

      expect(response.questionResults).toStrictEqual([
        {
          questionResults: [
            {
              questionId: questionId1,
              playersCorrectList: sortStringArray(['Tommy', 'Alice']),
              averageAnswerTime: expect.any(Number),
              percentCorrect: Math.round(2 / 3 * 100),
            },
            {
              questionId: questionId2,
              playersCorrectList: sortStringArray(['Mason', 'Tommy', 'Alice']),
              averageAnswerTime: expect.any(Number),
              percentCorrect: 100,
            },
          ],
        },
      ]);
    });
  });

  describe('Unauthorised errors', () => {
    beforeEach(() => {
      questionId1 = quizQuestionCreateV2(token1, quizId1, QUESTION_BODY1).jsonBody.questionId as number;
      sessionId = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
      player1 = playerJoinV1(sessionId, 'Tommy').jsonBody.playerId as number;
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);
    });

    test('Token is empty', () => {
      expect(quizSessionResultsV1('', quizId1, sessionId)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid user session', () => {
      expect(quizSessionResultsV1(token1 + 'random', quizId1, sessionId)).toStrictEqual(UNAUTHORISED_ERROR);
    });

    test('Token does not refer to a valid logged in user session', () => {
      authLogoutV1(token1);
      expect(quizSessionResultsV1(token1, quizId1, sessionId)).toStrictEqual(UNAUTHORISED_ERROR);
    });
  });

  test('Need to select all correct answers to be considered correct', () => {
    questionId1 = quizQuestionCreateV2(token1, quizId1, QUESTION_BODY5).jsonBody.questionId as number;
    sessionId = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
    player1 = playerJoinV1(sessionId, 'Tommy').jsonBody.playerId as number;
    player2 = playerJoinV1(sessionId, 'Mason').jsonBody.playerId as number;
    player3 = playerJoinV1(sessionId, 'Alice').jsonBody.playerId as number;
    quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
    quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN);
    const questionInfo = playerQuestionInfoV1(player1, 1).jsonBody as PlayerQuestionInfoReturn;
    answerIds = getQuestionAnswerIds(questionInfo);
    playerQuestionAnswerV1(player1, 1, [answerIds[0], answerIds[1]]); // Tommy: 7 * 1/1 = 7
    playerQuestionAnswerV1(player2, 1, [answerIds[1], answerIds[2]]); // Mason: 0
    playerQuestionAnswerV1(player3, 1, [answerIds[2], answerIds[0]]); // Alice: 0
    quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
    quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);
    expect(quizSessionResultsV1(token1, quizId1, sessionId).jsonBody).toStrictEqual({
      usersRankedByScore: [
        { name: 'Tommy', score: 7 },
        { name: 'Mason', score: 0 },
        { name: 'Alice', score: 0 },
      ],
      questionResults: [
        {
          questionId: questionId1,
          playersCorrectList: ['Tommy'],
          averageAnswerTime: expect.any(Number),
          percentCorrect: Math.round(1 / 3 * 100),
        },
      ],
    });
  });

  describe('Forbidden errors', () => {
    beforeEach(() => {
      questionId1 = quizQuestionCreateV2(token1, quizId1, QUESTION_BODY1).jsonBody.questionId as number;
      sessionId = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
      player1 = playerJoinV1(sessionId, 'Tommy').jsonBody.playerId as number;
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);
    });

    test('Valid token but invalid quizId', () => {
      expect(quizSessionResultsV1(token1, -1, sessionId)).toStrictEqual(FORBIDDEN_ERROR);
    });

    test('Valid token but user does not own the quiz', () => {
      const token2 = authRegisterV1(USER2.email, USER2.password, USER2.nameFirst, USER2.nameLast).jsonBody.token as string;
      expect(quizSessionResultsV1(token2, quizId1, sessionId)).toStrictEqual(FORBIDDEN_ERROR);
    });
  });

  describe('Bad request errors', () => {
    beforeEach(() => {
      questionId1 = quizQuestionCreateV2(token1, quizId1, QUESTION_BODY1).jsonBody.questionId as number;
      sessionId = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
      player1 = playerJoinV1(sessionId, 'Tommy').jsonBody.playerId as number;
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);
    });

    test('Invalid sessionId', () => {
      expect(quizSessionResultsV1(token1, quizId1, -1)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('SessionId does not refer to a valid session within this quiz', () => {
      const quizId2 = quizCreateV2(token1, QUIZ2.name, QUIZ2.description).jsonBody.quizId as number;
      quizQuestionCreateV2(token1, quizId2, QUESTION_BODY1).jsonBody.questionId as number;
      const sessionId2 = quizSessionStartV1(token1, quizId2, 0).jsonBody.sessionId as number;
      expect(quizSessionResultsV1(token1, quizId1, sessionId2)).toStrictEqual(BAD_REQUEST_ERROR);
    });
  });

  describe('Bad request error if session is not in the FINAL_RESULTS state', () => {
    beforeEach(() => {
      questionId1 = quizQuestionCreateV2(token1, quizId1, QUESTION_BODY1).jsonBody.questionId as number;
      sessionId = quizSessionStartV1(token1, quizId1, 0).jsonBody.sessionId as number;
      player1 = playerJoinV1(sessionId, 'Tommy').jsonBody.playerId as number;
    });

    test('LOBBY state', () => {
      expect(quizSessionResultsV1(token1, quizId1, sessionId)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('END state', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.END);
      expect(quizSessionResultsV1(token1, quizId1, sessionId)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('QUESTION_COUNTDOWN state', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      expect(quizSessionResultsV1(token1, quizId1, sessionId)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('QUESTION_OPEN state', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN);
      expect(quizSessionResultsV1(token1, quizId1, sessionId)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('QUESTION_CLOSE state', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN);
      sleep(QUESTION_BODY1.duration * 1000);
      expect(quizSessionResultsV1(token1, quizId1, sessionId)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('ANSWER_SHOW state', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      expect(quizSessionResultsV1(token1, quizId1, sessionId)).toStrictEqual(BAD_REQUEST_ERROR);
    });

    test('FINAL_RESULTS state', () => {
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.NEXT_QUESTION);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.SKIP_COUNTDOWN);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_ANSWER);
      quizSessionUpdateV1(token1, quizId1, sessionId, Action.GO_TO_FINAL_RESULTS);
      expect(quizSessionResultsV1(token1, quizId1, sessionId).statusCode).toStrictEqual(200);
    });
  });
});
