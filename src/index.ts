import express from 'express';
import bodyParser from 'body-parser';

const app = express();

// Request parser
app.use(bodyParser.json());

app.use('/', (req, res, next) => {
  console.log('req.url:', req.url);
  console.log('req.body:', req.body);

  res.send('Hello world!');
});

app.listen(5000, () => {
  console.log('Server started at port 5000');
});
