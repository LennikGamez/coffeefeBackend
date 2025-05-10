const PASSWORD = require('./pw.js');
const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

let DBCONNECTION;
function connect(){
    DBCONNECTION = mysql.createConnection({
        host: '192.168.178.120',
        user: 'coffeefe',
        database: 'Kaffee',
        password: PASSWORD
    });
    DBCONNECTION.connect((err) => {
        if (err) {
            return;
        } else {
            console.log('Connected to the database!');
        }
    })
    DBCONNECTION.on('error', (err)=>{
        console.log("Whoopsies-",err);
        setTimeout(connect, 5000);
    })
   
}
connect();


setInterval(() => {
    DBCONNECTION.query('SELECT 1;')
}, 600000 * 6); // Every hour the connection gets updated to prevent disconnection


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

app.get('/beans-count/:name', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('SELECT VorhandendeMenge FROM Bohne WHERE Name = ?', [req.params.name]).then((result) => {
        res.json(result[0].VorhandendeMenge);
    }).catch((err) => {
        res.send(err);
    });
});

app.post('/beans', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('INSERT INTO Bohne (Name, Röster, Website, Notiz, VorhandendeMenge, Röstgrad) VALUES (?, ?, ?, ?, ?, ?)', 
        [req.body.Name, req.body.Röster, req.body.Website, req.body.Notiz, req.body.VorhandendeMenge, req.body.Röstgrad])
    .then((result) => {
        res.send(result);
    }).catch((err) => {
        console.log(err);
        res.send(err);
    });
});

app.put('/beans/:name', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('UPDATE Bohne SET Name = ?, Röster = ?, Website = ?, Notiz = ?, VorhandendeMenge = ?, Röstgrad = ? WHERE Name = ?', [req.body.Name, req.body.Röster, req.body.Website, req.body.Notiz, req.body.VorhandendeMenge, req.body.Röstgrad, req.params.name])
    .then((result) => {
        // on update cascade has to be set in the database for the foreign key to update
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

app.get('/brews', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('SELECT * FROM Brühung').then((result) => {
        res.json(result);
    }).catch((err) => {
        res.send(err);
    });
});

app.post('/brew', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');
    console.log(req.body);

    query('INSERT INTO Brühung (BohnenName, BrühmethodenName, Getränkemenge, Mahlgrad, Bohnenmenge, Brühtemperatur, zubereitet, Notiz) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [req.body.BohnenName, req.body.BrühmethodenName, parseFloat(req.body.Getränkemenge), parseFloat(req.body.Mahlgrad), parseFloat(req.body.Bohnenmenge), parseFloat(req.body.Brühtemperatur), req.body.zubereitet, req.body.Notiz])
    .then((result) => {                
        res.send({id: result.insertId});
    }).catch((err) => {
        res.send(err);
    })
})

app.delete('/brew', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('DELETE FROM Brühung WHERE BrühID = ?', [req.body.id]).then((result) => {
        res.send(result);
    }).catch((err) => {
        res.send(err);
    });
});


app.get('/rezept/:methode/:bohne', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('SELECT * FROM Rezept R INNER JOIN Brühung B ON B.BrühID = R.brühID WHERE R.methodenName = ? AND B.bohnenName = ?', [req.params.methode, req.params.bohne]).then((result) => {
        const data = {
            BrühID: result[0].BrühID,
            BohnenName: result[0].BohnenName,
            BrühmethodenName: result[0].BrühmethodenName,
            Getränkemenge: result[0].Getränkemenge,
            Mahlgrad: result[0].Mahlgrad,
            Bohnenmenge: result[0].Bohnenmenge,
            Brühtemperatur: result[0].Brühtemperatur,
            zubereitet: result[0].zubereitet,
            Notiz: result[0].Notiz
        }
        res.json(data);
    })
    .catch((err) => {
        res.send(err);
    })
});

app.delete('/rezept/:methode/:bohne', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    query('DELETE FROM Rezept WHERE methodenName = ? AND bohnenName = ?', [req.params.methode, req.params.bohne]).then((result) => {
        res.send(result);
    }).catch((err) => {
        res.send(err);
    });
});

app.post('/save-rezept', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');

    // check if rezept already exists
    query('SELECT * FROM Rezept WHERE methodenName = ? AND bohnenName = ?;', [req.body.Methode, req.body.Bohne]).then((result) => {
        if (result.length > 0) {
            // if rezept already exists, update it            
            updateRecipe(req, res);
        } else {
            // if rezept doesn't exist, insert it
            insertNewRecipe(req, res);
        }
    })
});

app.put('/brew-exists', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');
    query('SELECT * FROM Brühung WHERE BohnenName = ? AND BrühmethodenName = ? AND Getränkemenge = ? AND Mahlgrad = ? AND Bohnenmenge = ? AND Brühtemperatur = ?', [req.body.BohnenName, req.body.BrühmethodenName, req.body.Getränkemenge, req.body.Mahlgrad, req.body.Bohnenmenge, req.body.Brühtemperatur]).then((result) => {               
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


app.put('/reduce-bean', (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", '*');
    query('UPDATE Bohne SET VorhandendeMenge = VorhandendeMenge - ? WHERE Name = ?', [req.body.Bohnenmenge, req.body.BohnenName]).then((result) => {
        res.send(result);
    }).catch((err) => {
        res.send(err);
    });
});


app.listen(3000);

function insertNewRecipe(req, res) {
    query('INSERT INTO Rezept (brühID, methodenName, bohnenName) VALUES (?, ?, ?);', [req.body.BrühID, req.body.Methode, req.body.Bohne]).then((result) => {
        res.send(result);
    }).catch((err) => {
        res.send(err);
    });
}

function updateRecipe(req, res) {
    query('UPDATE Rezept SET brühID = ? WHERE methodenName = ? AND bohnenName = ?;', [req.body.BrühID, req.body.Methode, req.body.Bohne]).then((result) => {
        res.send(result);
    }).catch((err) => {
        res.send(err);
    });
}
