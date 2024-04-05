import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import errorHandler from 'middleware-http-errors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';

// import { getData, setData } from './dataStore';
import { clear } from './other';
import { adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserDetailsUpdate, adminUserPasswordUpdate, adminAuthLogout } from './auth';
import { adminQuizList, adminQuizCreate, adminQuizTrash, adminQuizInfo, adminQuizNameUpdate, adminQuizDescriptionUpdate, adminQuizTrashView, adminQuizRestore, adminQuizTrashEmpty, adminQuizTransfer, adminQuizQuestionCreate, adminQuizQuestionUpdate, adminQuizQuestionRemove, adminQuizQuestionMove, adminQuizQuestionDuplicate, adminQuizThumbnailUpdate } from './quiz';
import { adminQuizSessionList, adminQuizSessionStatus, adminQuizSessionUpdate, adminQuizSessionResults, adminQuizSessionResultsCSV, adminQuizSessionStart } from './quizSession';
import { playerJoin, playerStatus, playerQuestionInfo, playerQuestionAnswer, playerQuestionResults, playerFinalResults, playerChatList, playerChatSend } from './player';

// Set up web app
const app = express();
// Use middleware that allows us to access the JSON body of requests
app.use(json());
// Use middleware that allows for access from other domains
app.use(cors());
// for logging errors (print to terminal)
app.use(morgan('dev'));
// for producing the docs that define the API
const file = fs.readFileSync(path.join(process.cwd(), 'swagger.yaml'), 'utf8');
app.get('/', (req: Request, res: Response) => res.redirect('/docs'));
app.use('/docs', sui.serve, sui.setup(YAML.parse(file), { swaggerOptions: { docExpansion: config.expandDocs ? 'full' : 'list' } }));

const PORT: number = parseInt(process.env.PORT || config.port);
// const HOST: string = process.env.IP || 'localhost';
const HOST: string = process.env.IP || '127.0.0.1';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// Check if database file exists

// Example get request
app.get('/echo', (req: Request, res: Response) => {
  const data = req.query.echo as string;
  return res.json(echo(data));
});

/***********************************************************************
* Iteration 2 (Using Iteration 1)
***********************************************************************/
app.delete('/v1/clear', (req: Request, res: Response) => {
  const response = clear();
  res.json(response);
});

app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const response = adminAuthRegister(email, password, nameFirst, nameLast);
  res.json(response);
});

app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const response = adminAuthLogin(email, password);
  res.json(response);
});

app.get('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminUserDetails(token);
  res.json(response);
});

app.put('/v1/admin/user/details', (req: Request, res: Response) => {
  const token = req.body.token as string;
  const email = req.body.email as string;
  const nameFirst = req.body.nameFirst as string;
  const nameLast = req.body.nameLast as string;
  const response = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  res.json(response);
});

app.put('/v1/admin/user/password', (req: Request, res: Response) => {
  const { token, oldPassword, newPassword } = req.body;
  const response = adminUserPasswordUpdate(token, oldPassword, newPassword);
  res.json(response);
});

app.get('/v1/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminQuizList(token);
  res.json(response);
});

app.post('/v1/admin/quiz', (req: Request, res: Response) => {
  const { token, name, description } = req.body;
  const response = adminQuizCreate(token, name, description);
  res.json(response);
});

app.delete('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.query.token as string;
  const response = adminQuizTrash(token, quizId);
  res.json(response);
});

app.get('/v1/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const response = adminQuizTrashView(token);
  res.json(response);
});

app.get('/v1/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.query.token as string;
  const response = adminQuizInfo(token, quizId);
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, name } = req.body;
  const response = adminQuizNameUpdate(token, quizId, name);
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, description } = req.body;
  const response = adminQuizDescriptionUpdate(token, quizId, description);
  res.json(response);
});

/***********************************************************************
* Iteration 2 (NEW)
***********************************************************************/
app.post('/v1/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.body.token as string;
  const response = adminAuthLogout(token);
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.body.token as string;
  const response = adminQuizRestore(token, quizId);
  res.json(response);
});

app.delete('/v1/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.query.token as string;
  const quizIds = JSON.parse(req.query.quizIds as string);
  const response = adminQuizTrashEmpty(token, quizIds);
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, userEmail } = req.body;
  const response = adminQuizTransfer(token, quizId, userEmail);
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const { token, questionBody } = req.body;
  const response = adminQuizQuestionCreate(token, quizId, questionBody);
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token, questionBody } = req.body;
  const response = adminQuizQuestionUpdate(token, quizId, questionId, questionBody);
  res.json(response);
});

app.delete('/v1/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.query.token as string;
  const response = adminQuizQuestionRemove(token, quizId, questionId);
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const { token, newPosition } = req.body;
  const response = adminQuizQuestionMove(token, quizId, questionId, newPosition);
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.body.token as string;
  const response = adminQuizQuestionDuplicate(token, quizId, questionId);
  res.json(response);
});

/***********************************************************************
* Iteration 3 (MODIFIED)
* Routes now have tokens in the headers instead of the body or query
* Access HTTP headers with:
* 1. const token = req.header('token')  - for a single header
* 2. const token = req.headers['token'] - for multiple headers
***********************************************************************/
app.get('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.header('token');
  const response = adminUserDetails(token);
  res.json(response);
});

app.put('/v2/admin/user/details', (req: Request, res: Response) => {
  const token = req.header('token');
  const email = req.body.email as string;
  const nameFirst = req.body.nameFirst as string;
  const nameLast = req.body.nameLast as string;
  const response = adminUserDetailsUpdate(token, email, nameFirst, nameLast);
  res.json(response);
});

app.put('/v2/admin/user/password', (req: Request, res: Response) => {
  const token = req.header('token');
  const { oldPassword, newPassword } = req.body;
  const response = adminUserPasswordUpdate(token, oldPassword, newPassword);
  res.json(response);
});

app.get('/v2/admin/quiz/list', (req: Request, res: Response) => {
  const token = req.header('token');
  const response = adminQuizList(token);
  res.json(response);
});

app.post('/v2/admin/quiz', (req: Request, res: Response) => {
  const token = req.header('token');
  const { name, description } = req.body;
  const response = adminQuizCreate(token, name, description);
  res.json(response);
});

app.delete('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const response = adminQuizTrash(token, quizId);
  res.json(response);
});

app.get('/v2/admin/quiz/trash', (req: Request, res: Response) => {
  const token = req.header('token');
  const response = adminQuizTrashView(token);
  res.json(response);
});

app.get('/v2/admin/quiz/:quizid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const response = adminQuizInfo(token, quizId);
  res.json(response);
});

app.put('/v2/admin/quiz/:quizid/name', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const name = req.body.name as string;
  const response = adminQuizNameUpdate(token, quizId, name);
  res.json(response);
});

app.put('/v2/admin/quiz/:quizid/description', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const description = req.body.description as string;
  const response = adminQuizDescriptionUpdate(token, quizId, description);
  res.json(response);
});

app.post('/v2/admin/auth/logout', (req: Request, res: Response) => {
  const token = req.header('token');
  const response = adminAuthLogout(token);
  res.json(response);
});

app.post('/v2/admin/quiz/:quizid/restore', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const response = adminQuizRestore(token, quizId);
  res.json(response);
});

app.delete('/v2/admin/quiz/trash/empty', (req: Request, res: Response) => {
  const token = req.header('token');
  const quizIds = JSON.parse(req.query.quizIds as string);
  const response = adminQuizTrashEmpty(token, quizIds);
  res.json(response);
});

app.post('/v2/admin/quiz/:quizid/transfer', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const userEmail = req.body.userEmail as string;
  const response = adminQuizTransfer(token, quizId, userEmail);
  res.json(response);
});

app.post('/v2/admin/quiz/:quizid/question', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const questionBody = req.body.questionBody;
  const response = adminQuizQuestionCreate(token, quizId, questionBody);
  res.json(response);
});

app.put('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.header('token');
  const questionBody = req.body.questionBody;
  const response = adminQuizQuestionUpdate(token, quizId, questionId, questionBody);
  res.json(response);
});

app.delete('/v2/admin/quiz/:quizid/question/:questionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.header('token');
  const response = adminQuizQuestionRemove(token, quizId, questionId);
  res.json(response);
});

app.put('/v2/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.header('token');
  const newPosition = req.body.newPosition as number;
  const response = adminQuizQuestionMove(token, quizId, questionId, newPosition);
  res.json(response);
});

app.post('/v2/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.header('token');
  const response = adminQuizQuestionDuplicate(token, quizId, questionId);
  res.json(response);
});

/***********************************************************************
* Iteration 3 (NEW)
***********************************************************************/
app.put('/v1/admin/quiz/:quizid/thumbnail', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const imgUrl = req.body.imgUrl as string;
  const response = adminQuizThumbnailUpdate(token, quizId, imgUrl);
  res.json(response);
});

app.get('/v1/admin/quiz/:quizid/sessions', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const response = adminQuizSessionList(token, quizId);
  res.json(response);
});

app.post('/v1/admin/quiz/:quizid/session/start', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const token = req.header('token');
  const autoStartNum = req.body.autoStartNum as number;
  const response = adminQuizSessionStart(token, quizId, autoStartNum);
  res.json(response);
});

app.put('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.header('token');
  const action = req.body.action as string;
  const response = adminQuizSessionUpdate(token, quizId, sessionId, action);
  res.json(response);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.header('token');
  const response = adminQuizSessionStatus(token, quizId, sessionId);
  res.json(response);
});

app.get('/v1/admin/quiz/:quizid/session/:sessionid/results', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.header('token');
  const response = adminQuizSessionResults(token, quizId, sessionId);
  res.json(response);
});

app.get('v1/admin/quiz/:quizid/session/:sessionid/results/csv', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const sessionId = parseInt(req.params.sessionid);
  const token = req.header('token');
  const response = adminQuizSessionResultsCSV(token, quizId, sessionId);
  res.json(response);
});

app.post('/v1/player/join', (req: Request, res: Response) => {
  const { sessionId, name } = req.body;
  const response = playerJoin(sessionId, name);
  res.json(response);
});

app.get('/v1/player/:playerid', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const response = playerStatus(playerId);
  res.json(response);
});

app.get('/v1/player/:playerid/question/:questionposition', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const response = playerQuestionInfo(playerId, questionPosition);
  res.json(response);
});

app.put('/v1/player/:playerid/question/:questionposition/answer', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const answerIds = req.body.answerIds as number[];
  const response = playerQuestionAnswer(playerId, questionPosition, answerIds);
  res.json(response);
});

app.get('/v1/player/:playerid/question/:questionposition/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const questionPosition = parseInt(req.params.questionposition);
  const response = playerQuestionResults(playerId, questionPosition);
  res.json(response);
});

app.get('/v1/player/:playerid/results', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const response = playerFinalResults(playerId);
  res.json(response);
});

app.get('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const response = playerChatList(playerId);
  res.json(response);
});

app.post('/v1/player/:playerid/chat', (req: Request, res: Response) => {
  const playerId = parseInt(req.params.playerid);
  const { message } = req.body;
  const response = playerChatSend(playerId, message);
  res.json(response);
});

// ====================================================================
//  ================= WORK IS DONE ABOVE THIS LINE ===================
// ====================================================================

app.use((req: Request, res: Response) => {
  const error = `
    Route not found - This could be because:
      0. You have defined routes below (not above) this middleware in server.ts
      1. You have not implemented the route ${req.method} ${req.path}
      2. There is a typo in either your test or server, e.g. /posts/list in one
         and, incorrectly, /post/list in the other
      3. You are using ts-node (instead of ts-node-dev) to start your server and
         have forgotten to manually restart to load the new changes
      4. You've forgotten a leading slash (/), e.g. you have posts/list instead
         of /posts/list in your server.ts or test file
  `;
  res.json({ error });
});

// For handling errors
app.use(errorHandler());

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
