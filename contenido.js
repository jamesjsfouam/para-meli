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
    fecha: "01 · 11 · 2007",
    titulo: "Una persona muy especial nació",
    mensaje: "Hoy va a cumplir 19.",
    fotos: ["meli-chiquita.jpg"],
    clave: true,
  },
  {
    fecha: "06 · 10 · 2025 · 10:00 p. m.",
    titulo: "El comienzo de todo",
    mensaje: "Nos comenzamos a hablar el 6 de octubre de 2025 a las 10 de la noche. Ese día no imaginaba conocer a alguien tan especial para mí: una personita a la que le comencé a hablar solo porque no tenía a quién hablarle en el club ambiental.",
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
    mensaje: "Y sí estuviste, durante todo el proceso de cambio que viví.",
  },
  {
    fecha: "12 · 08 · 2026",
    titulo: "Tu primer Substack",
    mensaje: "Al día siguiente ya estabas publicando.",
  },
  {
    fecha: "28 · 08 · 2026",
    titulo: "Rally Nacional",
    mensaje: "El día de nuestro primer rally juntos. Pero sobre todo, quiero decirte gracias por toda esa ayuda que me diste cuando estaba en mi punto más bajo.",   // ← escribí aquí lo que querés decirle de este rally
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
    "Meli, ya prácticamente cumplimos 1 año de conocernos, año en el que han pasado demasiadas cosas, tanto buenas como malas. Hoy que es tu cumpleaños, solo quiero agradecerte muchísimo por lo que eres hoy en día, pero en especial por seguir a mi lado, y eso es algo que valoro muchísimo.",
    "Quiero que sepas que sos la mejor persona que he podido conocer a lo largo de mi vida, y que solo quiero que así como haces de feliz a los demás te hagan feliz a ti, así como amas de intenso y fuerte a los demás, así te puedan amar a ti. Quiero que sepas que siempre estaré, pase lo que pase; siempre me tendrás.",
    "Sos la persona más especial que tengo en mi vida, una persona que amo muchísimo. Sos mi lugar seguro para todo, porque sos la persona a la que le tengo la mayor confianza de mi vida. Te amo muchísimo y quiero que lo sepas, de principio a fin.",
    "También quiero agradecerte por todas esas noches en las que me ahogaba sobrepensando y no podía ni dormir, porque aunque fueran las peores horas, siempre estuviste ahí para mí, sin juzgarme y sin soltarme. Quiero que sepas que gran parte de la persona que soy hoy es gracias a vos, a tu paciencia y a tu cariño, y eso es algo que nunca voy a terminar de agradecerte.",
    "Y si algún día te da miedo no ser suficiente, quiero que sepas que para mí siempre lo vas a ser, y de sobra. Nunca vas a tener que cambiar nada de quién sos para que te quieran, porque así como sos ya sos demasiado. Yo siempre voy a estar para vos, en tus días buenos y en los feos, pase lo que pase.",
    "Solo quiero que el día de hoy mires hacia el cielo y puedas ver una de esas estrellas que iluminan el cielo. Quiero que sepas que tú eres una de esas estrellas en mi vida, pero eres una de esas estrellas que no se apagan ni de noche ni de día: siempre brillan, siempre dan lo mejor de ellas, pero sobre todo, son estrellas.",
    "Te quiero muchísimo, Melissa. Solo quiero que disfrutes al máximo tu cumpleaños, mi niña linda, porque a como siempre te he dicho, después de cada tormenta siempre hay un solecito al final de todo. Feliz cumpleaños.",
  ],
  despedida: "",   // opcional: una línea antes de la firma
  firma: "James",
  posdata: "",   // opcional: una p.d. al final de la carta
};


/* ---------- FOTOS DE DECORACIÓN ----------
   Las que aparecen regadas como pegatinas en la pantalla principal.
   Para cambiar una, poné otro nombre de archivo de la carpeta fotos/. */

const FOTOS_DECORACION = [
  "meli-sonrisa.jpg",
  "meli-pelirroja.jpg",
  "meli-feria.jpg",
  "selfie.jpg",
  "meli-bosque.jpg",
  "lentes.jpg",
  "linea-perritos-1.jpg",
  "meli-dorado.jpg",
];


/* ---------- COSAS QUE ME RECUERDAN A TI ----------
   nombre: lo que sale grande
   imagen: archivo en fotos/cosas/ (fotos reales de Wikimedia Commons)
   nota:   una línea opcional tuya debajo del nombre  ← ESCRIBILA VOS
   logo:   true si la imagen es un logo o símbolo (se muestra sobre color)
   color:  color de fondo del logo (opcional)                          */

const COSAS = [
  { nombre: "Substack",       imagen: "substack.png",  logo: true, color: "#ff6a1f", nota: "Porque escribís bonito y te atreviste: abriste el tuyo y al día siguiente ya estabas publicando." },
  { nombre: "Los cactus",     imagen: "cactus.jpg",    nota: "Porque son como vos: aguantan lo que sea y aun así florecen." },
  { nombre: "BTS",            imagen: "bts.jpg",       nota: "Porque sos ARMY de corazón, y no hay forma de pensar en vos sin que aparezcan los siete." },
  { nombre: "La psicología",  imagen: "psi.png",       logo: true, color: "#c8ff3d", nota: "Porque entendés a la gente como nadie. Me acompañaste en más de una noche de sobrepensar sin juzgarme." },
  { nombre: "Álvaro Díaz",    imagen: "alvaro.jpg",    nota: "Porque cada vez que suena me acuerdo de vos, y «No podemos ser amigos» ya quedó en nuestra lista." },
  { nombre: "Cerati",         imagen: "cerati.jpg",    nota: "Porque Soda Stereo suena distinto desde que te conozco. «Entre Caníbales» siempre va a ser tuya." },
  { nombre: "El Mentalista",  imagen: "mentalista.jpg", nota: "Porque es tu serie, y por eso este regalo empezó como un caso de Red John." },
];
