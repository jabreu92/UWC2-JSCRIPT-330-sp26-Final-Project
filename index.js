import mongoose from 'mongoose';
import server from './server.js';
import Jet from './models/jet.js';

const port = process.env.PORT || 3000;

mongoose.connect('mongodb://localhost/jscript-330-final-project', {})
  .then(async () => {
    console.log("Connected to MongoDB");

    // Sync indexes for the Jet model to ensure the Gold Medal IXSCAN is possible
    try {
      await Jet.syncIndexes();
      console.log("Jet indexes synced successfully");
    } catch (indexError) {
      console.error("Error syncing indexes:", indexError.message);
    }

    server.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Server is listening on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });