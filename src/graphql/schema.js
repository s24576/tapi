export const typeDefs = `#graphql
    scalar PositiveInt

    type Adres {
        ulica: String!
        miasto: String!
        kod_pocztowy: String!
        kraj: String!
    }

    type Klient {
        nazwa: String!
        nip: String!
        adres: Adres!
    }

    type Port {
        nazwa: String!
        kod_UNLOCODE: String!
    }

    type Terminy {
        zaladunek: String!
        wyjscie_statku: String!
        przewidywane_dostarczenie: String!
    }

    type Trasa {
        port_zaladunku: Port!
        port_docelowy: Port!
        terminy: Terminy!
    }

    type Zlecenie {
        numer_zlecenia: String!
        data_utworzenia: String!
        status: String!
        klient: Klient!
        trasa: Trasa!
    }

    type Wymiary {
        dlugosc: String!
        szerokosc: String!
        wysokosc: String!
        jednostka: String!
    }

    type Opakowanie {
        rodzaj: String!
        wymiary: Wymiary!
    }

    type Waga {
        brutto: String!
        netto: String!
        jednostka: String!
    }

    type Ladunek {
        opis: String!
        ilosc_palet: String!
        opakowanie: Opakowanie!
    }

    type Kontener {
        numer_zlecenia: String!
        numer_kontenera: String!
        typ: String!
        waga: Waga!
        numer_towaru: String!
        ladunek: Ladunek!
    }

    type Towar {
        numer_towaru: String!
        nazwa: String!
        ilosc: String!
        jednostka: String!
        wartosc: String!
    }

    input AdresInput {
        ulica: String!
        miasto: String!
        kod_pocztowy: String!
        kraj: String!
    }

    input KlientInput {
        nazwa: String!
        nip: String!
        adres: AdresInput!
    }

    input PortInput {
        nazwa: String!
        kod_UNLOCODE: String!
    }

    input TerminyInput {
        zaladunek: String!
        wyjscie_statku: String!
        przewidywane_dostarczenie: String!
    }

    input TrasaInput {
        port_zaladunku: PortInput!
        port_docelowy: PortInput!
        terminy: TerminyInput!
    }

    input ZlecenieInput {
        numer_zlecenia: String!
        data_utworzenia: String!
        status: String!
        klient: KlientInput!
        trasa: TrasaInput!
    }

    input WymiaryInput {
        dlugosc: String!
        szerokosc: String!
        wysokosc: String!
        jednostka: String!
    }

    input OpakowanieInput {
        rodzaj: String!
        wymiary: WymiaryInput!
    }

    input WagaInput {
        brutto: String!
        netto: String!
        jednostka: String!
    }

    input LadunekInput {
        opis: String!
        ilosc_palet: String!
        opakowanie: OpakowanieInput!
    }

    input KontenerInput {
        numer_zlecenia: String!
        numer_kontenera: String!
        typ: String!
        waga: WagaInput!
        numer_towaru: String!
        ladunek: LadunekInput!
    }

    input TowarInput {
        numer_towaru: String!
        nazwa: String!
        ilosc: String!
        jednostka: String!
        wartosc: String!
    }

    input FilterInput {
        field: String!
        operation: String!
        value: String!
    }

    input SortInput {
        field: String!
        order: String!
    }

    input PageInput {
        limit: Int!
        offset: Int!
    }

    type DeleteResponse {
        success: Boolean!
        message: String
        code: String!
    }

    type ErrorResponse {
        message: String
        code: String
    }

    union ZlecenieResult = Zlecenie | ErrorResponse
    union KontenerResult = Kontener | ErrorResponse
    union TowarResult = Towar | ErrorResponse

    type Query {
        zlecenia(filter: [FilterInput], sort: SortInput, page: PageInput): [Zlecenie]
        kontenery(filter: [FilterInput], sort: SortInput, page: PageInput): [Kontener]
        towary(filter: [FilterInput], sort: SortInput, page: PageInput): [Towar]
        zlecenie(numer_zlecenia: String!): ZlecenieResult
        kontener(numer_kontenera: String!): KontenerResult
        towar(numer_towaru: String!): TowarResult
    }

    type Mutation {
        createZlecenie(zlecenie: ZlecenieInput!): ZlecenieResult
        updateZlecenie(numer_zlecenia: String!, zlecenie: ZlecenieInput!): ZlecenieResult
        deleteZlecenie(numer_zlecenia: String!): DeleteResponse

        createKontener(kontener: KontenerInput!): KontenerResult
        updateKontener(numer_kontenera: String!, kontener: KontenerInput!): KontenerResult
        deleteKontener(numer_kontenera: String!): DeleteResponse

        createTowar(towar: TowarInput!): TowarResult
        updateTowar(numer_towaru: String!, towar: TowarInput!): TowarResult
        deleteTowar(numer_towaru: String!): DeleteResponse
    }
`;
