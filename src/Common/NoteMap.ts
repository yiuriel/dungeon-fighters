export type NoteId = "first-note" | "second-note";

export const NotesMap = new Map<NoteId, string>();

NotesMap.set(
  "first-note",
  `Uri,

Llegó el momento. Lo encontramos. El acceso al dungeon del que tantos hablaban... está abierto. No sé por cuánto tiempo.

Desde fuera ya se siente algo distinto, como si el lugar respirara. Cada vez que entro, el camino cambia. Nada se mantiene igual. Es como si no quisiera ser comprendido.

No te voy a mentir, no es un lugar seguro. Pero también hay cosas ahí abajo que no vas a encontrar en ningún otro lado. He visto puertas que no deberían existir, cofres con símbolos que no reconozco. Hay algo grande esperándonos.

Te espero adentro. No tardes.
— A`
);

NotesMap.set(
  "second-note",
  `Uri,

Sigo adelante. Llegué hasta aquí sin problemas serios, aunque tuve que enfrentarme a algo... más grande de lo que esperaba. No fue fácil, pero salí ileso. El dungeon está vivo, de alguna forma. Cambia, se pliega sobre sí mismo. A veces siento que no estoy bajando, sino girando en círculos dentro de una cosa enorme.

Vi símbolos nuevos en las paredes, y escuché ruidos que no eran de ninguna criatura que conozca. Aun así, creo que hay un patrón. Estoy marcando el camino de forma sutil, quizás lo notes.

No estoy lejos. Te esperaré más adelante, donde el aire se vuelva más denso. Vas bien.

— A`
);
