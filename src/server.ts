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

/* UNCOMMENT THE FOLLOWING LINES WHEN YOU HAVE IMPLEMENTED THE FUNCTIONS */
import { clear } from './other';
import { getData, setData } from './dataStore';
import { adminAuthRegister, adminAuthLogin, adminUserDetails, adminUserDetailsUpdate, adminUserPasswordUpdate } from './auth';
import { adminQuizList, adminQuizCreate, adminQuizRemove, adminQuizInfo, adminQuizNameUpdate, adminQuizDescriptionUpdate } from './quiz';

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
const HOST: string = process.env.IP || 'localhost';

// ====================================================================
//  ================= WORK IS DONE BELOW THIS LINE ===================
// ====================================================================

// DATA PERISTENCE (DO NOT UNCOMMENT)
// // Load data from file
// const load = () => {
//   try {
//     // Check if file exists, read the file and set the data
//     if (fs.existsSync('./database.json')) {
//       const file = fs.readFileSync('./database.json', 'utf8');
//       console.log(file); // Display the file content (for debugging purposes - to Remove)
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
app.post('/v1/admin/auth/register', (req: Request, res: Response) => {
  const { email, password, nameFirst, nameLast } = req.body;
  const response = adminAuthRegister(email, password, nameFirst, nameLast);
  // console.log('Response from POST /v1/admin/auth/register:', response);
  if ('error' in response) {
    return res.status(400).json(response);
  }
  res.json(response);
});

// app.post('/v1/admin/auth/login', (req: Request, res: Response) => {
//   const { email, password } = req.body;
//   const response = adminAuthLogin(email, password);
//   if ('error' in response) {
//     return res.status(400).json(response);
//   }
//   res.json(response);
// });

/***********************************************************************
* Iteration 2 (NEW)
***********************************************************************/





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
