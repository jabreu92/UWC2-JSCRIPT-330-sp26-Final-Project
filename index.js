// Entry Points

const server = require('./server');

server.listen(3000, () => {
    console.log('Server is running at http://localhost:3000')
});

