require('express-async-errors');
const migrationRun = require('./database/sqlite/migrations');
const AppError = require('./utils/AppError');
const uploadConfig = require('./configs/upload');
const cors = require('cors');
const express = require('express');
const routes = require('./routes'); // qnd não se diz o nome, vai pro index.js
const { response } = require('express');

migrationRun();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/files', express.static(uploadConfig.UPLOADS_FOLDER));
app.use(routes);
app.use(function (error, req, resp, next) {
  if (error instanceof AppError) {
    return resp.status(error.statusCode).json({
      status: 'error',
      message: error.message
    });
  }

  console.error(error);

  return response.status(500).json({
    status: 'error',
    message: 'Internal server erro'
  });
});

const PORT = 3333;
app.listen(PORT, function (req, res) {
	console.log(`Server is running on port: ${PORT}\nhttp://localhost:3333`);
});
