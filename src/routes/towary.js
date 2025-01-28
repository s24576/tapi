import express from "express";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const router = express.Router();
const filePath = path.join(__dirname, "../../../dane/towary.json");

const loadProductsFromJSON = async () => {
  try {
    const data = await fs.readFile(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    throw new Error(
      "Błąd podczas wczytywania danych z pliku JSON: " + error.message
    );
  }
};

const saveProductsToJSON = async (products) => {
  try {
    await fs.writeFile(filePath, JSON.stringify(products, null, 2), "utf8");
  } catch (error) {
    throw new Error(
      "Błąd podczas zapisywania danych do pliku JSON: " + error.message
    );
  }
};

router.get("/towary", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Powered-By", "Express");
  res.setHeader("Content-Type", "application/json");

  try {
    const products = await loadProductsFromJSON();

    if (req.query.unit) {
      const unit = req.query.unit;
      const filteredProducts = products.filter(
        (p) => p.towar.jednostka === unit
      );

      if (filteredProducts.length > 0) {
        return res.status(200).json({
          products: filteredProducts,
          _links: {
            self: {
              href: `http://localhost:3000/api/towary?unit=${unit}`,
              method: "GET",
            },
            allProducts: {
              href: "http://localhost:3000/api/towary",
              method: "GET",
            },
          },
        });
      } else {
        return res
          .status(404)
          .send(`Nie znaleziono towarów o jednostce: ${unit}`);
      }
    }

    res.status(200).json({
      products,
      _links: {
        self: { href: "http://localhost:3000/api/towary", method: "GET" },
        addProduct: {
          href: "http://localhost:3000/api/towary/add",
          method: "POST",
        },
      },
    });
  } catch (error) {
    console.error("Błąd przy wczytywaniu danych z pliku JSON:", error);
    res.status(500).send("Błąd przy wczytywaniu danych z pliku JSON");
  }
});

router.get("/towary/:id", async (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Powered-By", "Express");
  res.setHeader("Content-Type", "application/json");

  const productId = req.params.id;

  try {
    const products = await loadProductsFromJSON();
    const product = products.find((p) => p.towar.numer_towaru === productId);

    if (!product) {
      return res
        .status(404)
        .send("Towar o podanym numerze nie został znaleziony.");
    }

    res.status(200).json({
      product,
      _links: {
        self: {
          href: `http://localhost:3000/api/towary/${productId}`,
          method: "GET",
        },
        update: {
          href: `http://localhost:3000/api/towary/update/${productId}`,
          method: "PATCH",
        },
        delete: {
          href: `http://localhost:3000/api/towary/delete/${productId}`,
          method: "DELETE",
        },
        allProducts: {
          href: "http://localhost:3000/api/towary",
          method: "GET",
        },
      },
    });
  } catch (error) {
    console.error("Błąd podczas wczytywania towaru:", error);
    res.status(500).send("Błąd podczas wczytywania towaru.");
  }
});

router.post("/towary/add", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Resource-Created", "Product");
  res.setHeader("X-Powered-By", "Express");

  const newProduct = req.body;

  if (
    !newProduct.towar?.numer_towaru ||
    !newProduct.towar?.nazwa ||
    !newProduct.towar?.ilość ||
    !newProduct.towar?.jednostka
  ) {
    return res
      .status(400)
      .send(
        "Brakuje wymaganych pól: numer_towaru, nazwa, ilość lub jednostka."
      );
  }

  try {
    const products = await loadProductsFromJSON();

    const existingProduct = products.find(
      (p) => p.towar.numer_towaru === newProduct.towar.numer_towaru
    );

    if (existingProduct) {
      return res.status(400).send("Towar o podanym numerze już istnieje.");
    }

    products.push(newProduct);
    await saveProductsToJSON(products);

    res.status(201).json({
      message: "Towar został dodany pomyślnie.",
      _links: {
        self: {
          href: `http://localhost:3000/api/towary/${newProduct.towar.numer_towaru}`,
          method: "GET",
        },
        allProducts: {
          href: "http://localhost:3000/api/towary",
          method: "GET",
        },
      },
    });
  } catch (error) {
    console.error("Błąd podczas dodawania towaru:", error);
    res.status(500).send("Błąd przy dodawaniu towaru.");
  }
});

router.put("/towary/update/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Action", "Product Full Update");
  res.setHeader("X-Powered-By", "Express");

  const productId = req.params.id;
  const updatedProduct = req.body;

  if (
    !updatedProduct.towar?.numer_towaru ||
    !updatedProduct.towar?.nazwa ||
    !updatedProduct.towar?.ilość ||
    !updatedProduct.towar?.jednostka
  ) {
    return res
      .status(400)
      .send(
        "Brakuje wymaganych pól: numer_towaru, nazwa, ilość lub jednostka."
      );
  }

  try {
    const products = await loadProductsFromJSON();
    const productIndex = products.findIndex(
      (p) => p.towar.numer_towaru === productId
    );

    if (productIndex === -1) {
      return res.status(404).send("Towar o podanym numerze nie istnieje.");
    }

    products[productIndex] = updatedProduct;

    await saveProductsToJSON(products);

    res.status(200).json({
      message: "Towar został zaktualizowany pomyślnie.",
      updatedProduct: products[productIndex],
      _links: {
        self: {
          href: `http://localhost:3000/api/towary/${productId}`,
          method: "GET",
        },
        allProducts: {
          href: "http://localhost:3000/api/towary",
          method: "GET",
        },
      },
    });
  } catch (error) {
    console.error("Błąd podczas pełnej aktualizacji towaru:", error);
    res.status(500).send("Błąd przy pełnej aktualizacji towaru.");
  }
});

router.patch("/towary/update/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Action", "Product Partial Update");
  res.setHeader("X-Powered-By", "Express");

  const productId = req.params.id;
  const updates = req.body;

  try {
    const products = await loadProductsFromJSON();
    const productIndex = products.findIndex(
      (p) => p.towar.numer_towaru === productId
    );

    if (productIndex === -1) {
      return res.status(404).send("Towar o podanym numerze nie istnieje.");
    }

    products[productIndex] = {
      towar: { ...products[productIndex].towar, ...updates.towar },
    };

    await saveProductsToJSON(products);

    res.status(200).json({
      message: "Towar został zaktualizowany pomyślnie.",
      updatedProduct: products[productIndex],
      _links: {
        self: {
          href: `http://localhost:3000/api/towary/${productId}`,
          method: "GET",
        },
        allProducts: {
          href: "http://localhost:3000/api/towary",
          method: "GET",
        },
      },
    });
  } catch (error) {
    console.error("Błąd podczas aktualizacji towaru:", error);
    res.status(500).send("Błąd przy aktualizacji towaru.");
  }
});

router.delete("/towary/delete/:id", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("X-Action", "Product Deletion");
  res.setHeader("X-Powered-By", "Express");

  const productId = req.params.id;

  try {
    const products = await loadProductsFromJSON();
    const productIndex = products.findIndex(
      (p) => p.towar.numer_towaru === productId
    );

    if (productIndex === -1) {
      return res
        .status(404)
        .set({
          "Operation-Status": "Failed",
          "Resource-Status": "Not Found",
          "Request-Type": "DELETE",
        })
        .send(`Towar o numerze ${productId} nie został znaleziony.`);
    }

    products.splice(productIndex, 1);
    await saveProductsToJSON(products);

    res
      .set({
        "Operation-Status": "Success",
        "Resource-Status": "Deleted",
        "Request-Type": "DELETE",
      })
      .status(200)
      .json({
        message: `Towar o numerze ${productId} został usunięty.`,
        _links: {
          allProducts: {
            href: "http://localhost:3000/api/towary",
            method: "GET",
          },
          addProduct: {
            href: "http://localhost:3000/api/towary/add",
            method: "POST",
          },
        },
      });
  } catch (error) {
    console.error("Błąd podczas usuwania towaru:", error);
    res.status(500).send("Błąd przy usuwaniu towaru.");
  }
});

export default router;
