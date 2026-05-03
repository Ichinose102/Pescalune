export interface Prestation {
  id: number;
  category: string;
  name: string;
  unit_price: number;
}

export const PRESTATIONS: Prestation[] = [
  { "id": 1, "category": "Repas", "name": "Menu entrée, plat et dessert ( Adulte )", "unit_price": 25 },
  { "id": 2, "category": "Boissons", "name": "Pastis Camarguais", "unit_price": 5 },
  { "id": 3, "category": "Repas", "name": "Menu entrée, plat et dessert ( Enfant )", "unit_price": 15 },
  { "id": 4, "category": "Repas", "name": "Planche apéritive", "unit_price": 9 },
  { "id": 5, "category": "Repas", "name": "Dessert", "unit_price": 5 },
  { "id": 6, "category": "Boissons", "name": "Apéritif Lou Gardian", "unit_price": 5 },
  { "id": 7, "category": "Boissons", "name": "Bière locales des Alpilles", "unit_price": 5 },
  { "id": 8, "category": "Boissons", "name": "Bouteille de vin Grand Mas de Lansac", "unit_price": 16 },
  { "id": 9, "category": "Boissons", "name": "Verre de vin Grand Mas de Lansac", "unit_price": 5 },
  { "id": 10, "category": "Boissons", "name": "Bouteille de vin mousseux fines bulles Grand Mas de Lansac", "unit_price": 23 },
  { "id": 11, "category": "Boissons", "name": "Liqueur Carmarguaise", "unit_price": 6 },
  { "id": 12, "category": "Boissons", "name": "Gin de Carmargue", "unit_price": 6 },
  { "id": 13, "category": "Boissons", "name": "Verre de sirop \"Couleur Provence\"", "unit_price": 4 },
  { "id": 14, "category": "Boissons", "name": "Jus de fruit", "unit_price": 5 },
  { "id": 15, "category": "Boissons", "name": "Droits de bouchon/bouteille", "unit_price": 4 }
];
