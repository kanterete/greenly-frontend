export const plantCatalog = [
  {
    id: "monstera-deliciosa",
    name: "Monstera deliciosa",
    commonName: "Monstera dziurawa",
    watering: "Co 7 dni",
    humidity: "50–70%",
    light: "Jasne, rozproszone",
    imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=80",
    description:
      "Popularna roślina domowa o dekoracyjnych, dużych liściach. Preferuje jasne stanowisko bez bezpośredniego ostrego słońca.",
  },
  {
    id: "ficus-elastica",
    name: "Ficus elastica",
    commonName: "Fikus sprężysty",
    watering: "Co 8–10 dni",
    humidity: "40–60%",
    light: "Jasne lub półcień",
    imageUrl: "https://images.unsplash.com/photo-1598880940080-ff9a29891b85?auto=format&fit=crop&w=900&q=80",
    description:
      "Wytrzymała roślina o dużych, błyszczących liściach. Dobrze sprawdza się w mieszkaniach i biurach.",
  },
  {
    id: "sansevieria-trifasciata",
    name: "Sansevieria trifasciata",
    commonName: "Sansewieria",
    watering: "Co 14 dni",
    humidity: "30–50%",
    light: "Od cienia do słońca",
    imageUrl: "https://images.unsplash.com/photo-1593482892290-f54927ae2b25?auto=format&fit=crop&w=900&q=80",
    description:
      "Roślina bardzo odporna na przesuszenie. Nadaje się dla początkujących użytkowników.",
  },
  {
    id: "capsicum-annuum",
    name: "Capsicum annuum",
    commonName: "Papryka chili",
    watering: "Co 2–3 dni",
    humidity: "50–70%",
    light: "Pełne słońce",
    imageUrl: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=900&q=80",
    description:
      "Roślina zewnętrzna wymagająca dużej ilości światła oraz regularnego podlewania w czasie wzrostu.",
  },
  {
    id: "epipremnum-aureum",
    name: "Epipremnum aureum",
    commonName: "Epipremnum złociste",
    watering: "Co 7–9 dni",
    humidity: "40–70%",
    light: "Rozproszone",
    imageUrl: "https://images.unsplash.com/photo-1611211232937-b6b59d85c942?auto=format&fit=crop&w=900&q=80",
    description:
      "Pnącze domowe o niewielkich wymaganiach. Dobrze znosi różne warunki oświetleniowe.",
  },
];

export const findCatalogPlant = (id) => plantCatalog.find((plant) => plant.id === id);
