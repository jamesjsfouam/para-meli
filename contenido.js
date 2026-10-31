/* ==================================================================
   CONTENIDO DE LA WEB DE MELI
   Este es el único archivo que tenés que editar.

   Reglas rápidas:
   - Cada texto va entre comillas "así". Si necesitás comillas
     adentro, usá las tipográficas “así”.
   - Para poner una palabra en rojo, encerrala entre asteriscos: *juntos*
   - Para un salto de párrafo en la carta, agregá otra línea a la lista.
   - Las fotos van en la carpeta fotos/ y se escriben con su nombre.
   - Después de cada elemento va una coma.
   ================================================================== */


/* ---------- LÍNEA DE TIEMPO ----------
   fecha:   como querés que se lea (formato: 07 · 10 · 2025)
   titulo:  el título grande del momento
   citas:   mensajes del chat, tal cual (opcional)
   mensaje: lo que querés decirle de ese momento  ← ESCRIBILO VOS
   fotos:   nombres de archivos en fotos/ (opcional)
   pie:     texto chiquito debajo de las fotos (opcional)
   clave:   true para marcar el punto en rojo (opcional)            */

const LINEA = [
  {
    fecha: "07 · 10 · 2025",
    titulo: "El comienzo de todo",
    mensaje: "Ese día no imaginaba conocer a alguien tan especial para mí: una personita a la que le comencé a hablar solo porque no tenía a quién hablarle en el club ambiental.",
    clave: true,
  },
  {
    fecha: "10 · 10 · 2025",
    titulo: "Mi primer rally",
    mensaje: "Ese día quería que fueras conmigo al rally, pero te tocó irte al otro lado del país a dormir. Todavía me acuerdo de que me dejaste un paquete de galletas para pasar la noche. Tqm.",
  },
  {
    fecha: "18 · 02 · 2026",
    titulo: "Gira a León",
    mensaje: "Las fotos en las que más feliz salís.",
    fotos: ["linea-perritos-1.jpg", "linea-perritos-2.jpg"],
  },
  {
    fecha: "11 · 06 · 2026",
    titulo: "“Yo siempre estaré ahí para vos”",
    mensaje: "Y sí estuviste. durante todo el proceso de cambio que vivi",
  },
  {
    fecha: "12 · 08 · 2026",
    titulo: "Tu primer Substack",
    mensaje: " Al día siguiente ya estabas publicando.",
  },
  {
    fecha: "28 · 08 · 2026",
    titulo: "Rally Nacional",
    mensaje: "el dia de nuestro primer rally juntos. pero sobre todo quiero decirte gracias por toda esa ayuda que me distes cuando estaba en mi punto mas bajo ",   // ← escribí aquí lo que querés decirle de este rally
    fotos: ["linea-rally-nacional.jpg"],   // ← guardá la foto con este nombre en fotos/
  },
  {
    fecha: "16 · 10 · 2026",
    titulo: "Esta vez, *juntos*",
    mensaje: "Un año después del de las galletas, el Rally Latinoamericano lo hicimos juntos.",
    fotos: ["linea-rally-uam.webp", "linea-rally.webp"],
    pie: "El equipo, frente a la UAM · y la de adentro",
  },
  {
    fecha: "01 · 11 · 2026",
    titulo: "*Hoy*",
    mensaje: "Te toca a vos.",
    clave: true,
  },
];


/* ---------- LA CARTA ----------
   Escribila aquí. Cada línea de "parrafos" es un párrafo.
   Lo que está ahora es la carta anterior, para que no quede vacía.    */

const CARTA = {
  saludo: "Meli:",
  parrafos: [
    "Meli, ya practicamnete cumplimos 1 año de conocernos, año en el que han pasado demasiadas cosas tanto buenas como malas, hoy que es tu cumpleaños, solo quiero agradercerte muchisimo por lo que eres hoy en dia, pero en especial por seguir a mi lado y eso es algo que valoro muchisimo.  qro que sepas que sos la mejor persona que he podido conocer a lo largo de mi vida, y que solo quiero que asi como haces de feliz a los demas te hagan feliz a ti, asi como amas de intenso y fuerte a los demas, asi te puedan amar a ti, quiero que sepas que siempre estare, pase lo que pase, siempre me tendras. sos la persona mas especial que tengo en mi vida, una persona que amo muchisimo, sos mi lugar seguro para todo por que sos la persona a la que le tengo la mayor confianza de mi vida, te amo muchisimo y quiero que lo sepas, de principio a fin. solo quiero que el dia de hoy mires hacia el cielo y puedas ver una de esas estrellas que iluminan el cielo, quiero que sepas que tu eres una de esas estrellas en mi vida, pero eres una de esas estrellas que no se apagan ni de noche ni de dia. siempre brillan, siempre dan lo mejor de ellas, pero sobre todo. Son estrellas. te quiero muchisimo melissa, solo quiero que disfrutes al maximo tu cumpleaños mi niña linda. por que a como siempre te he dicho, despues de cada tormetan siempre hay un solecito al final de todo. Feliz cumpleaños",
  ],
  despedida: "Te adoro y te quiero muchísimo,",
  firma: "James",
  posdata: "",   // opcional: una p.d. al final de la carta
};


/* ---------- FOTOS DE DECORACIÓN ----------
   Las que aparecen regadas como pegatinas en la pantalla principal.
   Para cambiar una, poné otro nombre de archivo de la carpeta fotos/. */

const FOTOS_DECORACION = [
  "selfie.jpg",
  "linea-perritos-1.jpg",
  "lentes.jpg",
  "linea-rally-uam.webp",
  "osito.jpg",
  "sillon.jpg",
  "patio.jpg",
  "linea-perritos-2.jpg",
];


/* ---------- COSAS QUE ME RECUERDAN A TI ----------
   nombre: lo que sale grande
   imagen: archivo en fotos/cosas/ (fotos reales de Wikimedia Commons)
   nota:   una línea opcional tuya debajo del nombre  ← ESCRIBILA VOS
   logo:   true si la imagen es un logo o símbolo (se muestra sobre color)
   color:  color de fondo del logo (opcional)                          */

const COSAS = [
  { nombre: "Substack",       imagen: "substack.png",  logo: true, color: "#ff6a1f", nota: "" },
  { nombre: "Los cactus",     imagen: "cactus.jpg",    nota: "" },
  { nombre: "BTS",            imagen: "bts.jpg",       nota: "" },
  { nombre: "La psicología",  imagen: "psi.png",       logo: true, color: "#c8ff3d", nota: "" },
  { nombre: "Álvaro Díaz",    imagen: "alvaro.jpg",    nota: "" },
  { nombre: "Cerati",         imagen: "cerati.jpg",    nota: "" },
  { nombre: "El Mentalista",  imagen: "mentalista.jpg", nota: "" },
];
