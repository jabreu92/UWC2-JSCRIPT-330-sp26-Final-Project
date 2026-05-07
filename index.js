import mongoose from 'mongoose';
import server from './server';

const port = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/jscript-330-final-project', {}).then(() => {
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is listening on http://localhost:${port}`);
  });
});
