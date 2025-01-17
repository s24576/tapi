import express from "express";
import cors from 'cors';

import orderRoutes from "./routes/teams/zlecenia.js";      // zlecenia
import productRoutes from "./routes/teams/towary.js";  // towary
import containerRoutes from "./routes/teams/kontenery.js";  // kontenery

const app = express();

app.use(express.json());

const allowedOrigins = ['http://localhost:3000']; 
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Cache-Control', 'no-store');
    next();
});

// API routes
app.use('/api/', orderRoutes, productRoutes, containerRoutes);

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Witamy w API systemu zarządzania logistyką!',
        _links: {
            orders: { href: 'http://localhost:3000/api/teams', method: 'GET' },
            products: { href: 'http://localhost:3000/api/players', method: 'GET' },
            containers: { href: 'http://localhost:3000/api/games', method: 'GET' }
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Wystąpił błąd serwera',
        message: err.message
    });
});

// 404 handling
app.use((req, res) => {
    res.status(404).json({
        error: 'Nie znaleziono zasobu',
        message: 'Żądany zasób nie istnieje'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
