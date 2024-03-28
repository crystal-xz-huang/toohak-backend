import express, { json, Request, Response } from 'express';
import { echo } from './newecho';
import morgan from 'morgan';
import config from './config.json';
import cors from 'cors';
import YAML from 'yaml';
import sui from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import process from 'process';

// import { getData, setData } from './dataStore';
import { clear } from './other';
import { adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserDetailsUpdate, adminUserPasswordUpdate, adminAuthLogout } from './auth';
import { adminQuizList, adminQuizCreate, adminQuizRemove, adminQuizInfo, adminQuizNameUpdate, adminQuizDescriptionUpdate, adminQuizTrashView, adminQuizRestore, adminQuizTrashEmpty, adminQuizTransfer, adminQuizQuestionCreate, adminQuizQuestionUpdate, adminQuizQuestionDuplicate } from './quiz';

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

// DATA PERISTENCE
// Load data from file
// const load = () => {
//   try {
//     // Check if file exists, read the file and set the data
//     if (fs.existsSync('./database.json')) {
//       const file = fs.readFileSync('./database.json', 'utf8');
//       setData(JSON.parse(file.toString()));
//     }
//   } catch (error) {
//     console.error(`Failed to load data from file: ${error}`);
//   }
// };

// // Save data to file
// const save = () => {
//   // Write the data to the file, if it fails, log the error
//   try {
//     fs.writeFileSync('./database.json', JSON.stringify(getData()));
//   } catch (error) {
//     console.error(`Failed to save data to file: ${error}`);
//   }
// };

// // Call load() on server start
// load();

// // Set up a regular interval to save the data to the file
// setInterval(save, 1000 * 60 * 5); // Save every 5 minutes

// // Call save() on server shutdown (SIGINT and SIGTERM)
// process.on('SIGINT', save);
// process.on('SIGTERM', save);

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
  const response = adminQuizRemove(token, quizId);
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

// app.put('/v1/admin/quiz/:quizid/question/:questionid/move', (req: Request, res: Response) => {
//   const quizId = parseInt(req.params.quizid);
//   const questionId = parseInt(req.params.questionid);
//   const { token, newPosition } = req.body;
//   const response = adminQuizQuestionMove(token, quizId, questionId, newPosition);
//   res.json(response);
// });

app.post('/v1/admin/quiz/:quizid/question/:questionid/duplicate', (req: Request, res: Response) => {
  const quizId = parseInt(req.params.quizid);
  const questionId = parseInt(req.params.questionid);
  const token = req.body.token as string;
  const response = adminQuizQuestionDuplicate(token, quizId, questionId);
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

// start server
const server = app.listen(PORT, HOST, () => {
  // DO NOT CHANGE THIS LINE
  console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
});

// For coverage, handle Ctrl+C gracefully
process.on('SIGINT', () => {
  server.close(() => console.log('Shutting down server gracefully.'));
});
