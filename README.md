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
5. **La carta.** Sale del regalo y abre la página principal:
   - La línea de tiempo.
   - Las cosas que me recuerdan a vos.
   - La carta.
   - Las canciones: cada una cambia la pantalla.

Detalles de la entrada:

- **Saltar la intro:** hay un botón que se mantiene presionado 5 s.
- **Modo ligero:** sin sombras, sin lluvia y con menos resolución. En celular viene activado.

## Estructura

| Archivo | Qué es |
|---|---|
| `index.html` | La página completa: estilos, la escena 2D de respaldo, el candado y las cuatro secciones. |
| `intro3d.js` | La entrada en 3D (Three.js r128): escenas, recorrido de la cámara, regalo y candado. |
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

## Rendimiento

La entrada está pensada para correr bien en compus modestas y en celular:

- **Por zonas.** El escritorio, el exterior y el interior solo se dibujan y se iluminan cuando la cámara está ahí. Las combinaciones de luces se compilan antes de entrar.
- **Ajuste automático.** La resolución baja sola si los fps caen. Si aun así no alcanza, se apaga el resplandor.
- **En celular.** Las texturas son de 1024 px como máximo y no se carga el cielo HDR. Con 2 GB de RAM o menos, se usa el regalo dibujado en 2D.
- **Al terminar la intro.** Se libera toda la memoria de video antes de mostrar la página.

## Créditos

- **3D:** texturas, muebles, cielo HDR y linterna de [Poly Haven](https://polyhaven.com) (CC0).
- **Imágenes de "Cosas":** de Wikimedia Commons, con autor y licencia al pie de esa sección.
- **Sonidos de la entrada:** de Wikimedia Commons (dominio público y CC BY 4.0).
- **Canciones:** vistas previas de 30 s del catálogo de Apple Music / iTunes; © de sus artistas y sellos.
- **Fuentes:** Google Fonts (Unbounded, Inter Tight, JetBrains Mono, Reenie Beanie, Cormorant Garamond).
