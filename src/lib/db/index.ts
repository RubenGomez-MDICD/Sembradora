/**
 * Guardado en el teléfono con IndexedDB (Dexie). Plan técnico, secciones 4 y 5.
 * Nada de esto sale del teléfono: el respaldo cifrado se arma aparte.
 */
export * from "./tipos";
export { CATEGORIAS_DE_FABRICA, SembradoraDB, getDb } from "./base";
export * from "./repositorio";
export * from "./resumen";
export * from "./respaldo";
