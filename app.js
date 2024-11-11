const axios = require('axios');
const express = require('express')
const mariadb = require('mariadb');
const mysql = require('mysql2');
const path = require('path');
const session = require('express-session')
const {sendCode, genCode} = require('./code.js')
// const pool = require('./con.js')
let dataCode = {}
let passwords = {}
const app = express()
app.use(session({
    secret:'shhhh'

}))
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname)));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());
const port = 3001
const RECAPTCHA_SECRET_KEY = "6Lf8M3sqAAAAAKDd1088P7M2aNlU9AG-__H9eAsZ"
const connection = mysql.createConnection({
    host: 'sql7.freemysqlhosting.net',
    user: 'sql7743821',
    password: '3ZeDb4dxz7',
    database: 'sql7743821',
    connectionLimit: 10
});
app.get('/h', async (req, res) => {
    let username = req.query.username
    console.log(username)
    connection.connect()
        .then(conn => {

            conn.query(`INSERT INTO test(user) VALUES ('${username}')`)
                .then((rows) => {
                    console.log(rows); //[ {val: 1}, meta: ... ]
                    //Table must have been created before
                    // " CREATE TABLE myTable (id int, val varchar(255)) "

                })

        });
    const insertId = await connection.promise().query(
        `INSERT INTO user (username, password) 
          VALUES ('${email}','${password}')`
    );
    res.send(200)
})
app.get('/', (req, res) => {
    const options = {
        root: path.join(__dirname)
    };
    console.log(options + 'index.html');
    res.sendFile('index.html', options);
})

app.post('/otp', async (req, res) => {
    let email = req.body.username;
    let password = req.body.password;
    const token = req.body["g-recaptcha-response"];

    if (!token) {
        return res.status(400).send("CAPTCHA token is missing.");
    }


    // Verify the token with Google's API
    const response = await axios.post(
        `https://www.google.com/recaptcha/api/siteverify`,
        {},
        {
            params: {
                secret: RECAPTCHA_SECRET_KEY,
                response: token,
            },
        }
    );

    const data = response.data;

    if (data.success) {
        // CAPTCHA passed successfully

        const insertId = await connection.promise().query(
            `SELECT * FROM user WHERE username = '${email}'`
        );
        console.log(insertId[0][0]);
        if (insertId[0][0] == undefined) {
            console.log('sending code!')
            let code = genCode();
            sendCode(email, code)

            dataCode[email] = code;
            passwords[email] = password;
            console.log('em', email, 'c', code, data);
            const options = {
                root: path.join(__dirname)
            };

            res.redirect(`/otp.html?email=${email}`);
        } else {
            console.log(insertId[0][0]['password']);
            if (insertId[0][0]['password'] == password) {
                console.log("logged in")
                req.session.username = email

                let ifLogged = 'true'
                res.redirect(`/loggedin.html?email=${email}&ifLogged=${ifLogged}`)
            } else {
                console.log("not logged in")
                let ifLogged = 'false'
                res.redirect(`/loggedin.html?email=${email}&ifLogged=${ifLogged}`)
            }


        }
    } else {
        // CAPTCHA failed
        res.send("CAPTCHA verification failed. Please try again.");
    }

    // catch (error) {
    //     console.error("Error verifying reCAPTCHA:", error);
    //     res.status(500).send("Server error. Please try again later.");
    // }


})
app.get('/session', async (req, res) => {
    console.log(req.session)
    res.send(`Hello broski ${req.session.username}`);
})
app.get('nocode', (req, res) => {
    let email = req.body.username;
    let code = genCode();
    sendCode(email, code)

    dataCode[email] = code;
    console.log('em', email, 'c', code, data);
    const options = {
        root: path.join(__dirname)
    };
    res.send(200);
})
app.post('/ver', async (req, res) => {
    let email = req.body.email;
    let code = req.body.code;
    let password = passwords[email];
    console.log(dataCode[email])
    if (dataCode[email] == code) {
        delete dataCode[email];
        console.log(`INSERT INTO user( username, password) VALUES ('${email}',"${password}")`)

        const insertId = await connection.promise().query(
            `INSERT INTO user( username, password) VALUES ('${email}','${password}')`
        );
        res.send(200)
    } else {
        res.send(404)
    }

})
app.post('/auth/register', (req, res) => {
    console.log(req.body)

    connection.connect()
        .then(conn => {

            conn.query(`INSERT INTO users( username, password) VALUES ('${req.body.username}','${req.body.password}')`)
                .catch(err => {
                    console.log(err);
                    res.send(404)
                })


        }).catch(err => {
        console.log(err);
        res.send(404)
    })


    res.send(200)


})
app.get('/auth/register', (req, res) => {
    console.log(req.query)

    res.send(200)
})
app.post('/new', async (req, res) => {
    const token = req.body["g-recaptcha-response"];

    if (!token) {
        return res.status(400).send("CAPTCHA token is missing.");
    }

    try {
        // Verify the token with Google's API
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            {},
            {
                params: {
                    secret: RECAPTCHA_SECRET_KEY,
                    response: token,
                },
            }
        );

        const data = response.data;

        if (data.success) {
            // CAPTCHA passed successfully

            res.redirect('/otp')
        } else {
            // CAPTCHA failed
            res.send("CAPTCHA verification failed. Please try again.");
        }
    } catch (error) {
        console.error("Error verifying reCAPTCHA:", error);
        res.status(500).send("Server error. Please try again later.");
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

