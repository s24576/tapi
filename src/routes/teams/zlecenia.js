import express from 'express';
import path, {dirname} from 'path';
import {fileURLToPath} from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const router = express.Router();
const __dirname = dirname(__filename);

const filePath = path.join(__dirname, '../../../dane/zlecenia.json');

const loadOrdersFromJSON = async () => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error('Błąd podczas wczytywania danych z pliku JSON: ' + error.message);
    }
};

const saveOrdersToJSON = async (orders) => {
    try {
        await fs.writeFile(filePath, JSON.stringify(orders, null, 2), 'utf8');
    } catch (error) {
        throw new Error('Błąd podczas zapisywania danych do pliku JSON: ' + error.message);
    }
};

router.get('/teams', async (req, res) => {
    try {
        const orders = await loadOrdersFromJSON();
        const status = req.query.status?.toLowerCase();

        const filteredOrders = status 
            ? orders.filter(o => o.zlecenie.status.toLowerCase() === status) 
            : orders;

        if (status && filteredOrders.length === 0) {
            return res.status(404).set({
                'Operation-Status': 'Failed',
                'Resource-Status': 'Not Found',
                'Request-Type': 'GET',
            }).send(`Nie znaleziono zleceń o statusie: ${status}`);
        }

        res.set({
            'Operation-Status': 'Success',
            'Resource-Status': 'Retrieved',
            'Request-Type': 'GET',
        }).status(200).json({
            orders: filteredOrders,
            _links: {
                self: {href: 'http://localhost:3000/api/teams', method: 'GET'},
                add: {href: 'http://localhost:3000/api/teams/add', method: 'POST'},
                delete: {href: `http://localhost:3000/api/teams/delete/{id}`, method: 'DELETE'},
                update: {href: `http://localhost:3000/api/teams/update/{id}`, method: 'PUT'}
            }
        });
    } catch (error) {
        res.status(500).send('Błąd przy wczytywaniu danych z pliku JSON');
    }
});

router.get('/teams/:id', async (req, res) => {
    const orderId = req.params.id;

    try {
        const orders = await loadOrdersFromJSON();
        const order = orders.find(o => o.zlecenie.numer_zlecenia === orderId);

        if (!order) {
            return res.status(404).set({
                'Operation-Status': 'Failed',
                'Resource-Status': 'Not Found',
                'Request-Type': 'GET'
            }).send('Zlecenie o podanym numerze nie zostało znalezione.');
        }

        res.set({
            'Operation-Status': 'Success',
            'Resource-Status': 'Retrieved',
            'Request-Type': 'GET',
        }).status(200).json({
            order,
            _links: {
                self: {href: `http://localhost:3000/api/teams/${orderId}`, method: 'GET'},
                update: {href: `http://localhost:3000/api/teams/update/${orderId}`, method: 'PUT'},
                delete: {href: `http://localhost:3000/api/teams/delete/${orderId}`, method: 'DELETE'}
            }
        });
    } catch (error) {
        res.status(500).send('Błąd podczas wczytywania zlecenia.');
    }
});

router.put('/teams/:id', async (req, res) => {
    const orderId = req.params.id;
    const {status} = req.body;

    if (!status) {
        return res.status(400).send('Pole "status" jest wymagane');
    }

    try {
        const orders = await loadOrdersFromJSON();
        const orderIndex = orders.findIndex(o => o.zlecenie.numer_zlecenia === orderId);

        if (orderIndex === -1) {
            return res.status(404).set({
                'Operation-Status': 'Failed',
                'Resource-Status': 'Not Found',
                'Request-Type': 'PUT'
            }).send(`Zlecenie o numerze ${orderId} nie zostało znalezione`);
        }

        orders[orderIndex].zlecenie.status = status;
        await saveOrdersToJSON(orders);

        res.set({
            'Operation-Status': 'Success',
            'Resource-Status': 'Updated',
            'Request-Type': 'PUT',
        }).status(200).json({
            updatedOrder: orders[orderIndex],
            _links: {
                self: {href: `http://localhost:3000/api/teams/${orderId}`, method: 'GET'},
                update: {href: `http://localhost:3000/api/teams/update/${orderId}`, method: 'PUT'},
                allOrders: {href: 'http://localhost:3000/api/teams', method: 'GET'}
            }
        });
    } catch (error) {
        res.status(500).send('Błąd przy aktualizacji statusu zlecenia');
    }
});

router.post('/teams/add', async (req, res) => {
    const newOrder = req.body;

    if (!newOrder.zlecenie?.numer_zlecenia || !newOrder.zlecenie?.status || 
        !newOrder.zlecenie?.klient || !newOrder.zlecenie?.trasa) {
        return res.status(400).send('Brakuje wymaganych pól zlecenia.');
    }

    try {
        const orders = await loadOrdersFromJSON();
        const existingOrder = orders.find(o => 
            o.zlecenie.numer_zlecenia === newOrder.zlecenie.numer_zlecenia
        );

        if (existingOrder) {
            return res.status(400).send('Zlecenie o podanym numerze już istnieje.');
        }

        orders.push(newOrder);
        await saveOrdersToJSON(orders);

        res.set({
            'Operation-Status': 'Success',
            'Resource-Status': 'Created',
            'Request-Type': 'POST',
        }).status(201).json({
            message: 'Zlecenie zostało dodane pomyślnie.',
            _links: {
                self: {href: `http://localhost:3000/api/teams/${newOrder.zlecenie.numer_zlecenia}`, method: 'GET'},
                allOrders: {href: 'http://localhost:3000/api/teams', method: 'GET'}
            }
        });
    } catch (error) {
        res.status(500).send('Błąd przy dodawaniu zlecenia.');
    }
});

router.delete('/teams/:id', async (req, res) => {
    const orderId = req.params.id;

    try {
        const orders = await loadOrdersFromJSON();
        const orderIndex = orders.findIndex(o => o.zlecenie.numer_zlecenia === orderId);

        if (orderIndex === -1) {
            return res.status(404).set({
                'Operation-Status': 'Failed',
                'Resource-Status': 'Not Found',
                'Request-Type': 'DELETE'
            }).send(`Zlecenie o numerze ${orderId} nie zostało znalezione`);
        }

        orders.splice(orderIndex, 1);
        await saveOrdersToJSON(orders);

        res.set({
            'Operation-Status': 'Success',
            'Resource-Status': 'Deleted',
            'Request-Type': 'DELETE',
        }).status(200).json({
            message: `Zlecenie o numerze ${orderId} zostało usunięte.`,
            _links: {
                allOrders: {href: 'http://localhost:3000/api/teams', method: 'GET'},
                addOrder: {href: 'http://localhost:3000/api/teams/add', method: 'POST'}
            }
        });
    } catch (error) {
        res.status(500).send('Błąd przy usuwaniu zlecenia.');
    }
});

router.patch('/teams/:id', async (req, res) => {
    const orderId = req.params.id;
    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
        return res.status(400).set({
            'Operation-Status': 'Failed',
            'Resource-Status': 'Not Updated',
            'Request-Type': 'PATCH'
        }).send('Nie podano żadnych pól do aktualizacji.');
    }

    try {
        const orders = await loadOrdersFromJSON();
        const orderIndex = orders.findIndex(o => o.zlecenie.numer_zlecenia === orderId);

        if (orderIndex === -1) {
            return res.status(404).set({
                'Operation-Status': 'Failed',
                'Resource-Status': 'Not Found',
                'Request-Type': 'PATCH'
            }).send('Zlecenie o podanym numerze nie istnieje.');
        }

        orders[orderIndex] = {
            zlecenie: { ...orders[orderIndex].zlecenie, ...updates.zlecenie }
        };

        await saveOrdersToJSON(orders);

        res.set({
            'Operation-Status': 'Success',
            'Resource-Status': 'Updated',
            'Request-Type': 'PATCH'
        }).status(200).json({
            message: 'Zlecenie zostało zaktualizowane pomyślnie.',
            updatedOrder: orders[orderIndex],
            _links: {
                self: {href: `http://localhost:3000/api/teams/${orderId}`, method: 'GET'},
                allOrders: {href: 'http://localhost:3000/api/teams', method: 'GET'},
                delete: {href: `http://localhost:3000/api/teams/delete/${orderId}`, method: 'DELETE'}
            }
        });
    } catch (error) {
        console.error('Błąd podczas aktualizacji zlecenia:', error);
        res.status(500).set({
            'Operation-Status': 'Failed',
            'Resource-Status': 'Error',
            'Request-Type': 'PATCH'
        }).send('Błąd przy aktualizacji zlecenia.');
    }
});

export default router;
