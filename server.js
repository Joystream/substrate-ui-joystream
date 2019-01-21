import express from 'express';

const port = 8000;
let app = express();
app.use(express.static('build'));

app.listen(port, () => {
  console.log('Listening on port 8000');
});
