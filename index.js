const PASSWORD = require('./pw.js');
const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

let DBCONNECTION = mysql.createConnection({
    host: '192.168.178.120',
    user: 'coffeefe',
    database: 'Kaffee',
    password: PASSWORD
});

function query(sql, values) {
    return new Promise((resolve, reject) => {
        DBCONNECTION.query(sql, values, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
}


const app = express();
app.use(bodyParser.json());
app.use(cors());

// Beans

app.get('/beans', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('SELECT * FROM Bohne').then((result) => {
        res.json(result);
    }).catch((err) => {
        res.send(err);
    });
});

app.get('/beans/:name', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('SELECT * FROM Bohne WHERE Name = ?', [req.params.name]).then((result) => { 
        res.json(result);
    }).catch((err) => {
        res.send(err);
    });
});

app.post('/beans', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('INSERT INTO Bohne (Name, Röster, Website, Notiz, VorhandendeMenge) VALUES (?, ?, ?, ?, ?)', 
        [req.body.Name, req.body.Röster, req.body.Website, req.body.Notiz, req.body.VorhandendeMenge])
    .then((result) => {
        res.send(result);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    });
});

app.put('/beans/:name', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('UPDATE Bohne SET Name = ?, Röster = ?, Website = ?, Notiz = ?, VorhandendeMenge = ? WHERE Name = ?', [req.body.Name, req.body.Röster, req.body.Website, req.body.Notiz, req.body.VorhandendeMenge, req.params.name])
    .then((result) => {
        res.send(result);
    }).catch((err) => {
        res.send(err);
    });
});

app.delete('/beans/:name', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('DELETE FROM Bohne WHERE Name = ?', [req.params.name])
    .then((result) => {
        res.send(result);
    }).catch((err) => {
        res.send(err);
    });
});

app.get('/beannames', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('SELECT Name FROM Bohne').then((result) => {
        res.json(result.map(obj => obj.Name));
    }).catch((err) => {
        res.send(err);
    })
});


// Methods

app.get('/methods', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('SELECT * FROM Methode').then((result) => {
        res.json(result.map(obj => obj.Name));
    }).catch((err) => {
        res.send(err);
    })
});

// Brühung

app.post('/brew', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('INSERT INTO Brühung (BohnenName, BrühmethodenName, Getränkemenge, Mahlgrad, Bohnenmenge, Brühtemperatur, zubereitet, Notiz) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [req.body.BohnenName, req.body.BrühmethodenName, req.body.GetränkeMenge, req.body.Mahlgrad, req.body.BohnenMenge, req.body.Brühtemperatur, req.body.zubereitet, req.body.Notiz])
    .then((result) => {
        res.send(result);
    }).catch((err) => {
        res.send(err);
    })
})


app.get('/rezept/:methode/:bohne', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('SELECT * FROM Rezept R INNER JOIN Brühung B ON B.BrühID = R.brühID WHERE R.methodenName = ? AND B.bohnenName = ?', [req.params.methode, req.params.bohne]).then((result) => {
        res.json(result);
    })
    .catch((err) => {
        res.send(err);
    })
});

app.put('/make-rezept/:brühID/:methode/:bohne', (req, res) => {
    query('UPDATE Rezept SET brühID = ? WHERE methodenName = ? AND bohnenName = ?', [req.params.brühID, req.params.methode, req.params.bohne]).then((result) => {
        res.send(result);
    }).catch((err) => {
        res.send(err);
    })
});

app.put('/brew-exists', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');
    query('SELECT * FROM Brühung WHERE BohnenName = ? AND BrühmethodenName = ? AND GetränkeMenge = ? AND Mahlgrad = ? AND BohnenMenge = ? AND Brühtemperatur = ? AND Notiz = ?', [req.body.BohnenName, req.body.BrühmethodenName, req.body.GetränkeMenge, req.body.Mahlgrad, req.body.BohnenMenge, req.body.Brühtemperatur, req.body.Notiz]).then((result) => {        
        res.send(result);
    }).catch((err) => {
        res.send(err);
    })
});

app.put('/brew-count', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('UPDATE Brühung SET zubereitet = zubereitet + 1 WHERE BrühID = ?', [req.body.BrühID]).then((result) => {
    }).catch((err) => {
        res.send(err);
    })
});


app.listen(3000);