# Para M.E.L.I.

Un regalo de cumpleaños hecho a mano: una página web con una entrada en 3D y, después, una carta, una línea de tiempo, las cosas que me recuerdan a ella y nuestras canciones.

**Ver:** https://jamesjsfouam.github.io/para-meli/

## Cómo se recorre

1. **Escritorio del caso.** Mientras carga, aparece la libreta del CBI con las pistas. "Tocá para entrar".
2. **La casa en el bosque.** Se baja del auto, pasa debajo de la cinta policial y entra a una casa abandonada.
3. **Dos cuartos.**
   - El de un caso de Red John.
   - El de BTS.
4. **El regalo.** Al fondo del pasillo, bajo un foco que parpadea. Tiene un candado de 4 letras con una pista en la etiqueta.
5. **La carta.** Se cae el candado, la tapa sale volando y el listón queda sobre la mesa. Del regalo sale un sobre, se rompe el sello y la carta sube dando vueltas en el aire, siempre en 3D, hasta llenar la pantalla. Ahí empieza *Entre Caníbales* y se abre la página principal:
   - La línea de tiempo.
   - Las cosas que me recuerdan a vos.
   - La carta.
   - Las canciones: cada una cambia la pantalla.

Detalles de la entrada:

- **Saltar la intro:** hay un botón que se mantiene presionado 5 s.
- **Calidad:** en compu arranca en alta, con un botón "Bajar calidad". En celular arranca en modo ligero (sin sombras, sin lluvia y con menos resolución) y el botón dice "Mejorar calidad". La elección se guarda.
- **Música:** la lluvia y el ambiente suenan durante la entrada. *Entre Caníbales* arranca recién cuando se abre la carta.
- **Si se recarga** después de haberla abierto, en la misma pestaña, va directo a la página.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | La página completa: estilos, sonido, el candado y las cuatro secciones. |
| `intro3d.js` | La entrada en 3D (Three.js r128): escritorio, escenas, recorrido de la cámara, regalo, candado y la carta. |
| `vendor/` | Three.js y sus complementos, servidos desde el propio sitio. |
| `og.jpg`, `favicon*`, `apple-touch-icon.png` | La vista previa al compartir el link (WhatsApp, etc.) y el ícono del sello. |
| `contenido.js` | **Lo único que hace falta editar:** la línea de tiempo, la carta, las cosas y las fotos de decoración. |
| `fotos/` | Fotos de la línea de tiempo y de decoración; `fotos/cosas/` son las imágenes de "Cosas que me recuerdan a vos". |
| `pbr/` | Texturas y modelos 3D (Poly Haven, CC0). Los `*_col_1k.jpg` son las versiones livianas que usa el celular. |
| `media/` | Sonidos grabados de la entrada. |

## Editar el contenido

Abrí `contenido.js`:

- **Texto en rojo:** encerrá la palabra entre asteriscos, `*así*`.
- **Fotos:** van en `fotos/` y se escriben solo con el nombre del archivo.
- **Fechas de la línea de tiempo:** usan el formato `dd · mm · aaaa`. Con ese formato la página calcula sola los "X días después…".

## Probar en la compu

```bash
python -m http.server 8765
```

Después abrí http://localhost:8765 en el navegador.

Para ver por qué falló el 3D en un celular, agregá `?diag=1` al link. Aparece un texto verde en la esquina con el motivo y la cantidad de reintentos.

Al cambiar `intro3d.js`, subí el número en `intro3d.js?v=…` dentro de `index.html`, para que los navegadores no usen la versión vieja guardada.

## Rendimiento

La entrada está pensada para correr bien en compus modestas y en celular:

- **Preparación en pasos.** Al terminar de descargar, los shaders se compilan zona por zona (también en celular), con respiros, antes de mostrar "Tocá para entrar": no hay tirones al entrar a cada parte.
- **Por zonas.** El escritorio, el exterior y el interior solo se dibujan y se iluminan cuando la cámara está ahí.
- **Matrices congeladas.** Los objetos quietos no recalculan su posición en cada cuadro. Si algo los mueve, se despiertan solos.
- **Sombras a demanda.** Solo se recalculan cuando se mueve algo que las proyecta: la cámara con la linterna, las puertas, la cinta o el regalo.
- **Ajuste automático.** La resolución baja sola si los fps caen. Si aun así no alcanza, se apaga el resplandor. En el escritorio la resolución no baja, para que las notas se lean.
- **En celular.** Las texturas y fotos se achican; las notas del escritorio conservan su resolución. No se cargan los muebles 3D ni el cielo HDR y no hay resplandor.
- **Safari (iPhone).** Texturas más chicas, menos gotas de lluvia, y las imágenes se sueltan de la memoria apenas están en la GPU.
- **Si el 3D se pierde.** Por ejemplo, Safari lo suelta al cambiar de app. La página recarga sola la escena, hasta 3 veces. Nunca cambia a una versión 2D.
- **La página principal.** No anima nada mientras está tapada por el 3D. Las secciones cerradas pausan sus animaciones.
- **Al terminar la intro.** Se libera toda la memoria de video antes de mostrar la página.

## Créditos

- **3D:** modelos, texturas y cielo HDR de [Poly Haven](https://polyhaven.com) (CC0).
- **Imágenes de "Cosas":** de Wikimedia Commons, con autor y licencia al pie de esa sección.
- **Sonidos de la entrada:** de Wikimedia Commons (dominio público y CC BY 4.0).
- **Canciones:** vistas previas de 30 s del catálogo de Apple Music / iTunes; © de sus artistas y sellos.
- **Fuentes:** Google Fonts (Unbounded, Inter Tight, JetBrains Mono, Reenie Beanie, Cormorant Garamond).
