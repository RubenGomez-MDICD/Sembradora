/**
 * Glosario (Figma AP-1, AP-2 y AP-3).
 *
 * Cada palabra tiene:
 * - `dicho`: cómo lo decimos, en pocas palabras (primera línea del Drawer).
 * - `texto`: la explicación sencilla.
 * - `ejemplo`: un caso con números, si ayuda.
 * - `fuente`: el artículo de ley o la institución de donde sale, para revisarlo.
 *
 * BORRADOR PARA REVISIÓN: los textos legales deben validarse con CACEH o
 * PROFEDET antes de publicar (plan técnico, sección 11).
 * LFT = Ley Federal del Trabajo. LSS = Ley del Seguro Social.
 */

export type Tema = "dinero" | "derechos" | "ahorro";

export type Termino = {
  id: string;
  palabra: string;
  tema: Tema;
  dicho: string;
  texto: string;
  ejemplo?: string;
  fuente?: string;
  /** Otras formas de buscarla (sin acentos no hace falta: la búsqueda los ignora). */
  tambien?: string[];
};

export const TEMAS: { value: Tema | "todas"; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "dinero", label: "Dinero" },
  { value: "derechos", label: "Derechos" },
  { value: "ahorro", label: "Ahorro" },
];

export const GLOSARIO: Termino[] = [
  /* ------------------------------ Derechos ------------------------------ */
  {
    id: "aguinaldo",
    palabra: "Aguinaldo",
    tema: "derechos",
    dicho: "el pago extra de fin de año",
    texto: "Te toca cada año y es de por lo menos 15 días de sueldo. Te lo deben pagar antes del 20 de diciembre. Si trabajaste menos de un año, te toca la parte que corresponde a los días que trabajaste.",
    ejemplo: "Si te pagan $450 al día, tu aguinaldo es de al menos $6,750.",
    fuente: "art. 87 LFT",
  },
  {
    id: "vacaciones",
    palabra: "Vacaciones pagadas",
    tema: "derechos",
    dicho: "días de descanso con sueldo",
    texto: "Después de tu primer año de trabajo te tocan 12 días de vacaciones con sueldo. Cada año suben 2 días hasta llegar a 20 en el quinto año. Después suben 2 días cada 5 años.",
    ejemplo: "En tu cuarto año te tocan 18 días.",
    fuente: "art. 76 LFT",
    tambien: ["vacaciones"],
  },
  {
    id: "prima-vacacional",
    palabra: "Prima vacacional",
    tema: "derechos",
    dicho: "un extra para tus vacaciones",
    texto: "Es un pago adicional de por lo menos el 25 % de lo que te pagan en tus días de vacaciones.",
    ejemplo: "Si por tus 18 días de vacaciones te pagan $8,100, la prima es de $2,025.",
    fuente: "art. 80 LFT",
  },
  {
    id: "finiquito",
    palabra: "Finiquito",
    tema: "derechos",
    dicho: "lo que te deben pagar cuando dejas un trabajo",
    texto: "Es la suma de lo que te deben al terminar: los días trabajados que no te han pagado y la parte de aguinaldo, vacaciones y prima vacacional que te tocaba ese año. Te toca aunque tú hayas decidido irte.",
    fuente: "arts. 76, 80 y 87 LFT",
  },
  {
    id: "liquidacion",
    palabra: "Liquidación",
    tema: "derechos",
    dicho: "lo que te toca si te despiden sin una razón justa",
    texto: "Incluye tu finiquito más una indemnización de 3 meses de sueldo y la prima de antigüedad. En algunos casos se suman 20 días de sueldo por cada año trabajado. Los montos de La sembradora son aproximados: para tu caso, busca asesoría gratis en PROFEDET.",
    fuente: "arts. 48, 49, 50 y 162 LFT",
    tambien: ["indemnizacion", "despido"],
  },
  {
    id: "prima-antiguedad",
    palabra: "Prima de antigüedad",
    tema: "derechos",
    dicho: "un pago por los años que llevas",
    texto: "Son 12 días de sueldo por cada año trabajado. Te toca si te despiden y, si tú te vas, cuando llevas por lo menos 15 años en el mismo trabajo.",
    fuente: "art. 162 LFT",
  },
  {
    id: "antiguedad",
    palabra: "Antigüedad",
    tema: "derechos",
    dicho: "el tiempo que llevas en el mismo trabajo",
    texto: "Cuenta desde el primer día que empezaste a trabajar en esa casa. De ella dependen tus días de vacaciones y lo que te toca si dejas el trabajo.",
    fuente: "art. 158 LFT",
  },
  {
    id: "salario-minimo",
    palabra: "Salario mínimo",
    tema: "derechos",
    dicho: "lo menos que te pueden pagar por ley",
    texto: "Para las personas trabajadoras del hogar hay un salario mínimo propio, que la CONASAMI fija cada año. Nadie te puede pagar menos que eso por una jornada completa.",
    fuente: "CONASAMI; art. 335 LFT",
    tambien: ["minimo"],
  },
  {
    id: "salario-digno",
    palabra: "Salario digno",
    tema: "derechos",
    dicho: "lo que de verdad vale tu trabajo",
    texto: "Es un sueldo que toma en cuenta las tareas que haces, cada cuánto las haces y el tamaño de la casa. Es más que el mínimo de ley. Mi sueldo lo calcula con el tabulador de CACEH.",
    fuente: "CACEH, Tabulador de Salario Digno (2024)",
  },
  {
    id: "contrato",
    palabra: "Contrato por escrito",
    tema: "derechos",
    dicho: "el acuerdo de trabajo en papel",
    texto: "La ley dice que el trabajo del hogar debe tener un contrato por escrito. Ahí quedan tu sueldo, tus tareas, tu horario, tus días de descanso y tus prestaciones. Te protege a ti y a tus patrones.",
    fuente: "art. 331 Ter LFT",
  },
  {
    id: "prestaciones",
    palabra: "Prestaciones",
    tema: "derechos",
    dicho: "lo que te toca además de tu sueldo",
    texto: "Son los pagos y derechos que vienen con tu trabajo: aguinaldo, vacaciones pagadas, prima vacacional, días de descanso y seguro social en el IMSS.",
    fuente: "LFT, capítulo XIII",
  },
  {
    id: "jornada",
    palabra: "Jornada",
    tema: "derechos",
    dicho: "las horas que trabajas en un día",
    texto: "Tu jornada no debe pasar de 8 horas al día. Si vives en la casa donde trabajas, te tocan además 9 horas seguidas de descanso en la noche y 3 horas de descanso durante el día.",
    fuente: "art. 333 LFT",
    tambien: ["horario"],
  },
  {
    id: "descanso-semanal",
    palabra: "Descanso semanal",
    tema: "derechos",
    dicho: "tu día y medio libre",
    texto: "Cada semana te toca un día y medio de descanso seguido, de preferencia sábado y domingo, con sueldo.",
    fuente: "art. 336 LFT",
  },
  {
    id: "descanso-obligatorio",
    palabra: "Días de descanso obligatorio",
    tema: "derechos",
    dicho: "los días festivos de la ley",
    texto: "Son días como el 1 de enero, el 1 de mayo, el 16 de septiembre y el 25 de diciembre. Si trabajas ese día, te deben pagar el doble aparte de tu sueldo del día.",
    fuente: "arts. 74 y 75 LFT",
    tambien: ["festivos"],
  },
  {
    id: "imss",
    palabra: "IMSS",
    tema: "derechos",
    dicho: "el seguro social",
    texto: "Instituto Mexicano del Seguro Social. Con el registro tienes médico, medicinas, incapacidades pagadas, guardería y ahorro para tu retiro. Tus patrones tienen la obligación de registrarte y pagar las cuotas.",
    fuente: "art. 337 LFT; arts. 239-A a 239-F LSS",
    tambien: ["seguro social"],
  },
  {
    id: "incapacidad",
    palabra: "Incapacidad",
    tema: "derechos",
    dicho: "permiso pagado cuando estás enferma",
    texto: "Si el IMSS te da incapacidad por una enfermedad o un accidente, te paga una parte de tu sueldo mientras no puedes trabajar. Solo aplica si estás registrada.",
    fuente: "LSS",
  },
  {
    id: "patron",
    palabra: "Patrones",
    tema: "derechos",
    dicho: "las personas para quienes trabajas",
    texto: "Son quienes te contratan y te pagan. La ley les pone obligaciones: darte contrato, pagarte por lo menos el mínimo, respetar tu descanso y registrarte en el IMSS.",
    fuente: "art. 337 LFT",
    tambien: ["patrona", "empleadora"],
  },
  {
    id: "profedet",
    palabra: "PROFEDET",
    tema: "derechos",
    dicho: "abogados gratis para tu trabajo",
    texto: "Procuraduría Federal de la Defensa del Trabajo. Te orienta y te representa gratis si te despiden o no te pagan lo que te toca.",
  },

  /* ------------------------------- Dinero ------------------------------- */
  {
    id: "ingreso",
    palabra: "Ingreso",
    tema: "dinero",
    dicho: "el dinero que te entra",
    texto: "Tu pago, una tanda que te tocó, un apoyo o un préstamo. En Mi dinero lo anotas para saber con cuánto cuentas.",
  },
  {
    id: "gasto",
    palabra: "Gasto",
    tema: "dinero",
    dicho: "el dinero que sale",
    texto: "Todo lo que pagas: comida, casa, transporte, escuela o el abono de una deuda.",
  },
  {
    id: "balance",
    palabra: "Balance",
    tema: "dinero",
    dicho: "lo que te queda",
    texto: "Es lo que te entró menos lo que gastaste. Si el número sale negativo, gastaste más de lo que te entró.",
  },
  {
    id: "presupuesto",
    palabra: "Presupuesto",
    tema: "dinero",
    dicho: "un plan para tu dinero",
    texto: "Decides antes cuánto vas a gastar en cada cosa. Un tope por semana en una categoría es un presupuesto sencillo.",
    tambien: ["tope"],
  },
  {
    id: "deuda",
    palabra: "Deuda",
    tema: "dinero",
    dicho: "dinero que debes",
    texto: "Lo que tienes que pagar a una persona, una tienda, un banco o una casa de empeño. Saber cuánto falta y cuándo pagas te ayuda a no atrasarte.",
  },
  {
    id: "prestamo",
    palabra: "Préstamo",
    tema: "dinero",
    dicho: "dinero que te dan y regresas después",
    texto: "Puede ser de una persona, de tus patrones, de un banco, de una financiera o de una app. Casi siempre regresas más de lo que te prestaron.",
  },
  {
    id: "interes",
    palabra: "Interés",
    tema: "dinero",
    dicho: "lo que te cobran por prestarte",
    texto: "Es el dinero extra que pagas por usar dinero prestado. Entre más tardas en pagar, más interés se junta.",
    ejemplo: "Si te prestan $1,000 y regresas $1,300, pagaste $300 de interés.",
    tambien: ["intereses"],
  },
  {
    id: "cat",
    palabra: "CAT",
    tema: "dinero",
    dicho: "lo que de verdad te cuesta un crédito",
    texto: "Costo Anual Total. Junta los intereses y las comisiones de un año en un solo porcentaje. Sirve para comparar créditos: entre más bajo, mejor. Viene en tu contrato y en tu estado de cuenta.",
    fuente: "Banco de México",
  },
  {
    id: "comision",
    palabra: "Comisión",
    tema: "dinero",
    dicho: "un cobro por un servicio",
    texto: "Lo que te cobra un banco o una tienda por algo, como sacar dinero de un cajero de otro banco o pagar tarde.",
    tambien: ["comisiones"],
  },
  {
    id: "abono",
    palabra: "Abono",
    tema: "dinero",
    dicho: "un pago en partes",
    texto: "Cada pago que haces para ir cubriendo una compra o una deuda. Comprar en abonos casi siempre sale más caro que pagar de contado.",
    tambien: ["abonos"],
  },
  {
    id: "pago-minimo",
    palabra: "Pago mínimo",
    tema: "dinero",
    dicho: "lo menos que puedes pagar de tu tarjeta",
    texto: "Evita que te cobren por atraso, pero la deuda baja muy poco y sigue cobrando intereses. Si puedes, paga más que el mínimo.",
  },
  {
    id: "tarjeta-credito",
    palabra: "Tarjeta de crédito",
    tema: "dinero",
    dicho: "dinero prestado para comprar",
    texto: "El banco o la tienda te presta para que compres y después pagas. Si no pagas todo cada mes, te cobran intereses.",
  },
  {
    id: "tarjeta-debito",
    palabra: "Tarjeta de débito",
    tema: "dinero",
    dicho: "tu propio dinero en una tarjeta",
    texto: "Usa el dinero que tienes en tu cuenta. No es un préstamo, así que no te cobra intereses.",
  },
  {
    id: "empeno",
    palabra: "Empeño",
    tema: "dinero",
    dicho: "dejar algo a cambio de dinero",
    texto: "Dejas una cosa de valor en una casa de empeño y te prestan dinero. Si no pagas a tiempo, pierdes la cosa.",
  },
  {
    id: "buro",
    palabra: "Buró de crédito",
    tema: "dinero",
    dicho: "el historial de cómo pagas",
    texto: "Guarda cómo has pagado tus créditos. No es una lista negra: si pagas a tiempo, te ayuda a conseguir préstamos más baratos.",
    tambien: ["buro"],
  },
  {
    id: "condusef",
    palabra: "CONDUSEF",
    tema: "dinero",
    dicho: "te defiende frente a los bancos",
    texto: "Comisión Nacional para la Protección y Defensa de los Usuarios de Servicios Financieros. Si tienes un problema con un banco, una tarjeta o un préstamo, ahí te orientan gratis.",
  },

  /* ------------------------------- Ahorro ------------------------------- */
  {
    id: "ahorro",
    palabra: "Ahorro",
    tema: "ahorro",
    dicho: "el dinero que apartas",
    texto: "Lo que guardas para después: para una meta o para un apuro. Aunque sea poco, apartarlo seguido es lo que hace la diferencia.",
  },
  {
    id: "guardadito",
    palabra: "Guardadito para emergencias",
    tema: "ahorro",
    dicho: "dinero para los apuros",
    texto: "Un ahorro que solo usas cuando pasa algo que no esperabas, como una enfermedad o perder un trabajo. Te ayuda a no pedir prestado.",
    tambien: ["emergencia", "fondo de emergencia"],
  },
  {
    id: "meta",
    palabra: "Meta de ahorro",
    tema: "ahorro",
    dicho: "para qué estás ahorrando",
    texto: "Una cosa que quieres con una cantidad y una fecha. Así sabes cuánto apartar cada semana o cada mes.",
  },
  {
    id: "tanda",
    palabra: "Tanda",
    tema: "ahorro",
    dicho: "ahorro entre varias personas",
    texto: "Cada persona pone la misma cantidad cada semana o cada quincena, y en cada turno una persona recibe todo. Si te toca de las primeras, es como un préstamo sin intereses; si te toca de las últimas, es un ahorro.",
    ejemplo: "10 personas ponen $200 cada semana: en tu turno recibes $2,000.",
    tambien: ["tandas"],
  },
  {
    id: "afore",
    palabra: "Afore",
    tema: "ahorro",
    dicho: "tu ahorro para el retiro",
    texto: "Administradora de Fondos para el Retiro. Es una cuenta a tu nombre donde se junta dinero para cuando dejes de trabajar. Si estás en el IMSS, ahí llegan las aportaciones de tus patrones.",
    fuente: "CONSAR",
  },
  {
    id: "cuenta-ahorro",
    palabra: "Cuenta de ahorro",
    tema: "ahorro",
    dicho: "un lugar seguro para guardar dinero",
    texto: "Una cuenta en un banco donde tu dinero está protegido. Algunas te pagan un poco por guardarlo.",
  },
  {
    id: "rendimiento",
    palabra: "Rendimiento",
    tema: "ahorro",
    dicho: "lo que gana tu ahorro",
    texto: "El dinero extra que te paga un banco o una inversión por guardar tu dinero ahí. Es lo contrario del interés que pagas cuando pides prestado.",
  },
  {
    id: "inflacion",
    palabra: "Inflación",
    tema: "ahorro",
    dicho: "cuando todo sube de precio",
    texto: "Con el tiempo los precios suben y el mismo dinero alcanza para menos. Por eso conviene que tu ahorro gane algo.",
  },
];

/** Quita acentos y mayúsculas para buscar: «Afore», «afore» y «áfore» son lo mismo. */
export const normalizar = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

export function buscarTerminos(q: string, tema: Tema | "todas" = "todas"): Termino[] {
  const nq = normalizar(q);
  return GLOSARIO.filter((t) => tema === "todas" || t.tema === tema)
    .filter((t) => !nq || [t.palabra, t.dicho, ...(t.tambien ?? [])].some((s) => normalizar(s).includes(nq)))
    .sort((a, b) => a.palabra.localeCompare(b.palabra, "es"));
}

export const terminoPorId = (id: string) => GLOSARIO.find((t) => t.id === id);
