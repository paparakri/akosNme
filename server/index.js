const express = require('express');
const app = express();
const path = require('path');
const {logger} = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const verifyToken = require('./middleware/auth');
const cookieParser = require('cookie-parser');
const { verifyData } = require('./controllers/search');
const PORT = process.env.PORT || 3500;

//Load environment variables
require('dotenv').config();

//Mongoose Initialization
require('./config/mongoose')().catch(err => console.log(err));

app.set('case sensitive routing', false);

//reqLogger
app.use(logger);

//Cross Origin Resource Sharing
app.use(require('./config/cors'));

//middleware to handle urlendcoded data
app.use(express.urlencoded({ extended: false }));

//built-in middleware for json
app.use(express.json());

//cookie parser
app.use(cookieParser());

verifyData().then(count => {
    console.log(`Verified ${count} documents in database`);
});


//Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/user', express.static(path.join(__dirname, 'public')));
app.use('/club', express.static(path.join(__dirname, 'public')));
app.use('/provider', express.static(path.join(__dirname, 'public')));

//routers
app.use('/', require('./routes/root.js'));
app.use('/refresh', require('./routes/refresh.js'));
app.use('/logout', require('./routes/logout.js'));

app.use('/user', require('./routes/user.js'));
app.use('/club', require('./routes/club.js'));
app.use('/search', require('./routes/search.js'));
app.use('/provider', require('./routes/provider.js'));

app.all('*', require('./config/404'));

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));