import path from "path";
import { fileURLToPath } from "url";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { zlecenieResolvers } from "./zleceniaResolver.js";
import { kontenerResolvers } from "./kontenerReslover.js";
import { towarResolvers } from "./towarResolver.js";

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
        oneofs: true
    }
);

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(protoDescriptor.zlecenie.ZlecenieService.service, {
    GetZlecenie: zlecenieResolvers.GetZlecenie,
    ListZlecenia: zlecenieResolvers.ListZlecenia,
    CreateZlecenie: zlecenieResolvers.CreateZlecenie,
    UpdateZlecenie: zlecenieResolvers.UpdateZlecenie,
    DeleteZlecenie: zlecenieResolvers.DeleteZlecenie
});

server.addService(protoDescriptor.kontener.KontenerService.service, {
    GetKontener: kontenerResolvers.GetKontener,
    ListKontenery: kontenerResolvers.ListKontenery,
    CreateKontener: kontenerResolvers.CreateKontener,
    UpdateKontener: kontenerResolvers.UpdateKontener,
    DeleteKontener: kontenerResolvers.DeleteKontener
});

server.addService(protoDescriptor.towar.TowarService.service, {
    GetTowar: towarResolvers.GetTowar,
    ListTowary: towarResolvers.ListTowary,
    CreateTowar: towarResolvers.CreateTowar,
    UpdateTowar: towarResolvers.UpdateTowar,
    DeleteTowar: towarResolvers.DeleteTowar
});

server.bindAsync(
    "127.0.0.1:50051",
    grpc.ServerCredentials.createInsecure(),
    (error, port) => {
        if (error) {
            console.error("Błąd podczas uruchamiania serwera:", error);
            return;
        }
        server.start();
        console.log(`Serwer gRPC uruchomiony na porcie ${port}`);
    }
);

const handleShutdown = () => {
    console.log("\nZamykanie serwera...");
    server.tryShutdown(() => {
        console.log("Serwer został zamknięty");
        process.exit(0);
    });
};

process.on("SIGINT", handleShutdown);
process.on("SIGTERM", handleShutdown);
