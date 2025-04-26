export type NoteId =
  | "first-note"
  | "second-note"
  | "third-note"
  | "fourth-note"
  | "fifth-note"
  | "ghost_find_player";

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

NotesMap.set(
  "third-note",
  `Uri,

Las marcas que dejé... ya no están. O no las encuentro. Cada vez que creo reconocer una esquina o un corredor, algo cambia. Las paredes giran. Los techos respiran. No sé cómo explicarlo sin sonar como un loco.

Estoy bajando, lo sé. Lo siento en los huesos. Pero también siento que algo sube. Como si el dungeon me respondiera. Como si me observara.

He tenido que quedarme quieto más tiempo del que me gustaría. No por miedo, sino porque el silencio a veces es lo único que me mantiene cuerdo. No todos los sonidos acá abajo provienen de criaturas. Algunos son... pensamientos. Y no todos son míos.

Si sigues adelante, no confíes en lo que veas.

— A`
);

NotesMap.set(
  "fourth-note",
  `Uri,

Hoy vi mi reflejo en el agua. Me miró... y no era yo.

Hay pasajes que se pliegan sobre sí mismos, y otros que parecen repetir lo que digo. Escuché mi voz llamándome desde un túnel que juraría haber cerrado detrás de mí. Cada vez que cierro los ojos, sueño con lugares que no recorrí, pero reconozco.

No sé cuánto más voy a poder escribir. Mis manos tiemblan. No de miedo. De agotamiento. De algo más profundo.

Sigo bajando. No por elección, sino porque ya no hay forma de subir. A veces me cuesta recordar por qué empecé esto. Pero tu nombre sigue apareciendo en mi mente, como un faro. Uri. Uri. Uri.

Si llegas hasta acá, que no sea por mí. Que sea por ti.

— A`
);

NotesMap.set(
  "fifth-note",
  `Uri,

no qda mucho...
el aire arde
la luz ya no lga

casi no siento los dds
pero tenía que decirlo

no vengas

— A`
);

NotesMap.set(
  "ghost_find_player",
  `Uri,
Tarde, como siempre...

No sabes cuánto esperé este momento.

No para pedirte nada. No para reprocharte.

Sólo... para verte una última vez.

Me voy, hermano.

Esta vez, de verdad.`
);
