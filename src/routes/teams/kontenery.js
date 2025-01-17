import express from 'express';
import path, {dirname} from 'path';
import {fileURLToPath} from "url";
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();
const filePath = path.join(__dirname, '../../../dane/kontenery.json');

const loadContainersFromJSON = async () => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('Błąd podczas wczytywania danych z pliku JSON: ' + error.message);
    }
};

const saveContainersToJSON = async (containers) => {
    try {
        await fs.writeFile(filePath, JSON.stringify(containers, null, 2), 'utf8');
    } catch (error) {
        throw new Error('Błąd podczas zapisywania danych do pliku JSON: ' + error.message);
    }
};

router.get('/games', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');  

    try {
        const containers = await loadContainersFromJSON();
        const limitedContainers = containers.slice(0, 20);
        res.status(200).json({
            containers: limitedContainers,
            _links: {
                self: { href: 'http://localhost:3000/api/games', method: 'GET' },
                addContainer: { href: 'http://localhost:3000/api/games/add', method: 'POST' }
            }
        });
    } catch (error) {
        console.error('Błąd przy wczytywaniu danych z pliku JSON:', error);
        res.status(500).send('Błąd przy wczytywaniu danych z pliku JSON');
    }
});

router.get('/games/:id', async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Powered-By', 'Express');
    res.setHeader('Content-Type', 'application/json');

    const orderId = req.params.id;

    try {
        const containers = await loadContainersFromJSON();
        const container = containers.find(c => c.kontener.numer_zlecenia === orderId);

        if (!container) {
            return res.status(404).send('Kontener o podanym numerze zlecenia nie został znaleziony.');
        }

        res.status(200).json({
            container,
            _links: {
                self: { href: `http://localhost:3000/api/games/${orderId}`, method: 'GET' },
                update: { href: `http://localhost:3000/api/games/update/${orderId}`, method: 'PATCH' },
                delete: { href: `http://localhost:3000/api/games/delete/${orderId}`, method: 'DELETE' },
                allContainers: { href: 'http://localhost:3000/api/games', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas wczytywania kontenera:', error);
        res.status(500).send('Błąd podczas wczytywania kontenera.');
    }
});

router.post('/games/add', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Resource-Created', 'Container');
    res.setHeader('X-Powered-By', 'Express');

    const newContainer = req.body;

    if (!newContainer.kontener?.numer_zlecenia || !newContainer.kontener?.numer_kontenera) {
        return res.status(400).send('Brakuje wymaganych pól: numer_zlecenia, numer_kontenera');
    }

    try {
        const containers = await loadContainersFromJSON();

        const existingContainer = containers.find(c => 
            c.kontener.numer_zlecenia === newContainer.kontener.numer_zlecenia
        );
        
        if (existingContainer) {
            return res.status(400).send('Kontener o podanym numerze zlecenia już istnieje.');
        }

        containers.push(newContainer);
        await saveContainersToJSON(containers);

        res.status(201).json({
            message: 'Kontener został dodany pomyślnie.',
            _links: {
                self: { href: `http://localhost:3000/api/games/${newContainer.kontener.numer_zlecenia}`, method: 'GET' },
                allContainers: { href: 'http://localhost:3000/api/games', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas dodawania kontenera:', error);
        res.status(500).send('Błąd przy dodawaniu kontenera.');
    }
});

router.patch('/games/update/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Container Partial Update');
    res.setHeader('X-Powered-By', 'Express');

    const orderId = req.params.id;
    const updates = req.body;

    try {
        const containers = await loadContainersFromJSON();
        const containerIndex = containers.findIndex(c => c.kontener.numer_zlecenia === orderId);

        if (containerIndex === -1) {
            return res.status(404).send('Kontener o podanym numerze zlecenia nie istnieje.');
        }

        containers[containerIndex] = {
            kontener: { ...containers[containerIndex].kontener, ...updates.kontener }
        };

        await saveContainersToJSON(containers);

        res.status(200).json({
            message: 'Kontener został zaktualizowany pomyślnie.',
            updatedContainer: containers[containerIndex],
            _links: {
                self: { href: `http://localhost:3000/api/games/${orderId}`, method: 'GET' },
                allContainers: { href: 'http://localhost:3000/api/games', method: 'GET' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas aktualizacji kontenera:', error);
        res.status(500).send('Błąd przy aktualizacji kontenera.');
    }
});

router.delete('/games/delete/:id', async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-Action', 'Container Deletion');
    res.setHeader('X-Powered-By', 'Express');

    const orderId = req.params.id;

    try {
        const containers = await loadContainersFromJSON();
        const containerIndex = containers.findIndex(c => c.kontener.numer_zlecenia === orderId);

        if (containerIndex === -1) {
            return res.status(404).send(`Kontener o numerze zlecenia ${orderId} nie został znaleziony.`);
        }

        containers.splice(containerIndex, 1);
        await saveContainersToJSON(containers);

        res.status(200).json({
            message: `Kontener o numerze zlecenia ${orderId} został usunięty.`,
            _links: {
                allContainers: { href: 'http://localhost:3000/api/games', method: 'GET' },
                addContainer: { href: 'http://localhost:3000/api/games/add', method: 'POST' }
            }
        });
    } catch (error) {
        console.error('Błąd podczas usuwania kontenera:', error);
        res.status(500).send('Błąd przy usuwaniu kontenera.');
    }
});

export default router;
