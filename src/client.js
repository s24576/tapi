import path from "path";
import { fileURLToPath } from "url";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROTO_PATH_ZLECENIE = path.join(__dirname, "proto/zlecenie.proto");
const PROTO_PATH_KONTENER = path.join(__dirname, "proto/kontener.proto");
const PROTO_PATH_TOWAR = path.join(__dirname, "proto/towar.proto");

const packageDefinition = protoLoader.loadSync(
  [PROTO_PATH_ZLECENIE, PROTO_PATH_KONTENER, PROTO_PATH_TOWAR],
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
  }
);

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const zlecenieClient = new protoDescriptor.zlecenie.ZlecenieService(
  "127.0.0.1:50051",
  grpc.credentials.createInsecure()
);

const kontenerClient = new protoDescriptor.kontener.KontenerService(
  "127.0.0.1:50051",
  grpc.credentials.createInsecure()
);

const towarClient = new protoDescriptor.towar.TowarService(
  "127.0.0.1:50051",
  grpc.credentials.createInsecure()
);

export const getZlecenie = (numerZlecenia) => {
  return new Promise((resolve, reject) => {
    zlecenieClient.GetZlecenie(
      { numer_zlecenia: numerZlecenia },
      (error, response) => {
        if (error) reject(error);
        else resolve(response);
      }
    );
  });
};

export const listZlecenia = (filter, sort, page) => {
  return new Promise((resolve, reject) => {
    zlecenieClient.ListZlecenia({ filter, sort, page }, (error, response) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
};

export const getKontener = (numerKontenera) => {
  return new Promise((resolve, reject) => {
    kontenerClient.GetKontener(
      { numer_kontenera: numerKontenera },
      (error, response) => {
        if (error) reject(error);
        else resolve(response);
      }
    );
  });
};

export const listKontenery = (filter, sort, page) => {
  return new Promise((resolve, reject) => {
    kontenerClient.ListKontenery({ filter, sort, page }, (error, response) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
};

export const getTowar = (numerTowaru) => {
  return new Promise((resolve, reject) => {
    towarClient.GetTowar({ numer_towaru: numerTowaru }, (error, response) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
};

export const listTowary = (filter, sort, page) => {
  return new Promise((resolve, reject) => {
    towarClient.ListTowary({ filter, sort, page }, (error, response) => {
      if (error) reject(error);
      else resolve(response);
    });
  });
};

const testConnection = async () => {
  try {
    const zlecenia = await listZlecenia(
      null,
      { field: "data_utworzenia", order: "DESC" },
      { limit: 10, offset: 0 }
    );
    console.log("Pobrane zlecenia:", zlecenia);

    const kontenery = await listKontenery(
      null,
      { field: "typ", order: "ASC" },
      { limit: 10, offset: 0 }
    );
    console.log("Pobrane kontenery:", kontenery);

    const towary = await listTowary(
      null,
      { field: "wartosc", order: "DESC" },
      { limit: 10, offset: 0 }
    );
    console.log("Pobrane towary:", towary);
  } catch (error) {
    console.error("Błąd podczas testowania połączenia:", error);
  }
};

testConnection();

process.on("SIGINT", () => {
  grpc.closeClient(zlecenieClient);
  grpc.closeClient(kontenerClient);
  grpc.closeClient(towarClient);
  process.exit(0);
});
