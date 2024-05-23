// Importamos las librerías requeridas
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Documentación en https://expressjs.com/en/starter/hello-world.html
const app = express();

// Creamos un parser de tipo application/json
// Documentación en https://expressjs.com/en/resources/middleware/body-parser.html
const jsonParser = bodyParser.json();

// Conectamos a la base de datos SQLite
const dbPath = path.resolve(__dirname, 'todos.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        // Creamos la tabla "todos" si no existe
        db.run(`
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                todo TEXT NOT NULL,
                created_at INTEGER
            )
        `, (err) => {
            if (err) {
                console.error('Error al crear la tabla:', err.message);
            }
        });
    }
});

// Ruta GET raíz
app.get('/', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'status': 'ok' }));
});

// Endpoint POST /login
app.post('/login', jsonParser, function (req, res) {
    console.log(req.body);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 'status': 'ok' }));
});

// Endpoint POST /agrega_todo
app.post('/agrega_todo', jsonParser, function (req, res) {
    const { todo } = req.body;
    if (!todo) {
        res.status(400).json({ error: 'El campo "todo" es requerido' });
        return;
    }

    const createdAt = Math.floor(Date.now() / 1000); // Unix timestamp

    const sql = `INSERT INTO todos (todo, created_at) VALUES (?, ?)`;
    const params = [todo, createdAt];

    db.run(sql, params, function (err) {
        if (err) {
            res.status(500).json({ error: 'Error al insertar el todo' });
        } else {
            res.status(201).json({ id: this.lastID, todo, created_at: createdAt });
        }
    });
});

// Nuevo endpoint GET /lista_todos para listar todos los elementos
app.get('/lista_todos', (req, res) => {
    const sql = 'SELECT * FROM todos';
    db.all(sql, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            todos: rows
        });
    });
});

// Corremos el servidor en el puerto 3000
const port = 3000;
app.listen(port, () => {
    console.log(`Aplicación corriendo en http://localhost:${port}`);
});
