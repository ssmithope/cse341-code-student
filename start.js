const app = require('./server');
const PORT = process.env.TEST_PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
