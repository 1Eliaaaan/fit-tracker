// ─────────────────────────────────────────────
// FitTrack — Comprehensive Exercise Library
// ─────────────────────────────────────────────

export type MuscleGroup =
    | 'Pecho'
    | 'Espalda'
    | 'Hombros'
    | 'Bíceps'
    | 'Tríceps'
    | 'Piernas'
    | 'Glúteos'
    | 'Abdomen'
    | 'Cardio';

export interface ExerciseInfo {
    id: string;
    name: string;
    category: MuscleGroup;
    description: string;
    icon: string;
}

export const MUSCLE_GROUP_ICONS: Record<MuscleGroup, string> = {
    Pecho: '🫁',
    Espalda: '🔙',
    Hombros: '🏋️',
    Bíceps: '💪',
    Tríceps: '🦾',
    Piernas: '🦵',
    Glúteos: '🍑',
    Abdomen: '🧱',
    Cardio: '❤️‍🔥',
};

export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
    Pecho: '#EF4444',
    Espalda: '#3B82F6',
    Hombros: '#F59E0B',
    Bíceps: '#8B5CF6',
    Tríceps: '#EC4899',
    Piernas: '#10B981',
    Glúteos: '#F97316',
    Abdomen: '#06B6D4',
    Cardio: '#E11D48',
};

export const EXERCISE_LIBRARY: ExerciseInfo[] = [
    // ═══════════════════════════════════════
    //  PECHO
    // ═══════════════════════════════════════
    {
        id: 'press-banca-barra',
        name: 'Press Banca con Barra',
        category: 'Pecho',
        description: 'Acuéstate en el banco plano, agarra la barra con las manos a la anchura de los hombros. Baja la barra controladamente hasta el pecho y empuja hacia arriba extendiendo los brazos.',
        icon: '🫁',
    },
    {
        id: 'press-inclinado-mancuernas',
        name: 'Press Inclinado con Mancuernas',
        category: 'Pecho',
        description: 'En banco inclinado a 30-45°, sostén las mancuernas a la altura del pecho. Empuja hacia arriba juntando ligeramente las mancuernas en la parte superior. Baja de forma controlada.',
        icon: '🫁',
    },
    {
        id: 'press-plano-maquina',
        name: 'Press Plano en Máquina',
        category: 'Pecho',
        description: 'Siéntate en la máquina con la espalda apoyada y los pies en el suelo. Empuja las asas hacia adelante extendiendo los brazos sin bloquear los codos. Regresa lentamente.',
        icon: '🫁',
    },
    {
        id: 'press-inclinado-maquina',
        name: 'Press Inclinado en Máquina',
        category: 'Pecho',
        description: 'Similar al press plano en máquina pero con ángulo inclinado para enfatizar la porción clavicular del pectoral. Mantén la espalda pegada al respaldo.',
        icon: '🫁',
    },
    {
        id: 'press-plano-mancuerna',
        name: 'Press Plano con Mancuerna',
        category: 'Pecho',
        description: 'Acuéstate en banco plano con mancuernas a los lados del pecho. Empuja hacia arriba extendiendo los brazos, junta las mancuernas arriba y baja controladamente.',
        icon: '🫁',
    },
    {
        id: 'press-declinado-barra',
        name: 'Press Declinado con Barra',
        category: 'Pecho',
        description: 'En banco declinado, baja la barra hasta la parte baja del pecho. Presiona hacia arriba. Enfatiza la porción inferior del pectoral.',
        icon: '🫁',
    },
    {
        id: 'aperturas-mancuerna',
        name: 'Aperturas con Mancuerna',
        category: 'Pecho',
        description: 'Acuéstate en banco plano con los brazos extendidos arriba. Baja las mancuernas en arco abriendo los brazos con los codos ligeramente flexionados. Vuelve a la posición inicial.',
        icon: '🫁',
    },
    {
        id: 'cruces-polea',
        name: 'Cruces en Polea',
        category: 'Pecho',
        description: 'De pie entre las poleas altas, da un paso al frente. Junta las manos frente al pecho en un movimiento de arco con los codos ligeramente flexionados. Controla el regreso.',
        icon: '🫁',
    },
    {
        id: 'peck-deck',
        name: 'Peck Deck',
        category: 'Pecho',
        description: 'Siéntate en la máquina con los antebrazos en las almohadillas. Junta los brazos frente a ti apretando el pecho. Abre lentamente hasta sentir estiramiento sin forzar.',
        icon: '🫁',
    },
    {
        id: 'fondos-pecho',
        name: 'Fondos en Paralelas (Pecho)',
        category: 'Pecho',
        description: 'En las barras paralelas, inclina el torso hacia adelante. Baja el cuerpo flexionando los codos hasta que los hombros estén al nivel de los codos. Empuja hacia arriba.',
        icon: '🫁',
    },
    {
        id: 'pullover-mancuerna',
        name: 'Pullover con Mancuerna',
        category: 'Pecho',
        description: 'Acuéstate perpendicular al banco con una mancuerna sobre el pecho. Baja los brazos por detrás de la cabeza manteniendo los codos ligeramente flexionados. Regresa arriba con control.',
        icon: '🫁',
    },

    // ═══════════════════════════════════════
    //  ESPALDA
    // ═══════════════════════════════════════
    {
        id: 'dominadas',
        name: 'Dominadas',
        category: 'Espalda',
        description: 'Cuélgate de la barra con agarre prono (palmas hacia afuera) a la anchura de los hombros o más. Tira del cuerpo hacia arriba hasta que la barbilla pase la barra. Baja controladamente.',
        icon: '🔙',
    },
    {
        id: 'jalon-pecho',
        name: 'Jalón al Pecho',
        category: 'Espalda',
        description: 'Siéntate en la máquina de jalones con los muslos asegurados. Agarra la barra ancha y tira hacia el pecho superior apretando los omóplatos. Extiende los brazos lentamente.',
        icon: '🔙',
    },
    {
        id: 'jalon-agarre-cerrado',
        name: 'Jalón Agarre Cerrado',
        category: 'Espalda',
        description: 'Igual que el jalón al pecho pero con agarre estrecho y neutro (palmas enfrentadas). Enfatiza la parte central de la espalda y los bíceps.',
        icon: '🔙',
    },
    {
        id: 'remo-polea',
        name: 'Remo en Polea',
        category: 'Espalda',
        description: 'Siéntate frente a la polea baja, los pies apoyados. Tira del agarre hacia el abdomen retrayendo los omóplatos. Mantén el torso erguido. Extiende los brazos lentamente.',
        icon: '🔙',
    },
    {
        id: 'remo-barra',
        name: 'Remo con Barra',
        category: 'Espalda',
        description: 'Inclínate hacia adelante con la espalda recta y las rodillas ligeramente flexionadas. Tira de la barra hacia el abdomen inferior apretando los omóplatos. Baja controladamente.',
        icon: '🔙',
    },
    {
        id: 'remo-mancuerna',
        name: 'Remo con Mancuerna',
        category: 'Espalda',
        description: 'Apoya una rodilla y mano en el banco. Con la otra mano, tira la mancuerna hacia la cadera retrayendo el omóplato. Baja lentamente. Alterna ambos lados.',
        icon: '🔙',
    },
    {
        id: 'pull-over-polea',
        name: 'Pull Over en Polea',
        category: 'Espalda',
        description: 'De pie frente a la polea alta, agarra la barra recta con los brazos extendidos. Tira hacia abajo en arco hasta las caderas manteniendo los codos rectos. Regresa lentamente.',
        icon: '🔙',
    },
    {
        id: 'peso-muerto',
        name: 'Peso Muerto',
        category: 'Espalda',
        description: 'Con los pies a la anchura de las caderas, agarra la barra. Levántala extendiendo caderas y rodillas simultáneamente, espalda recta. Baja la barra por el mismo recorrido.',
        icon: '🔙',
    },
    {
        id: 'peso-muerto-rumano',
        name: 'Peso Muerto Rumano',
        category: 'Espalda',
        description: 'De pie con la barra, empuja las caderas hacia atrás con las piernas casi rectas. Baja la barra por la parte frontal de las piernas hasta sentir estiramiento en isquiotibiales. Sube apretando glúteos.',
        icon: '🔙',
    },
    {
        id: 'remo-t-barra',
        name: 'Remo en T',
        category: 'Espalda',
        description: 'Usa la barra tipo T o la esquina. Inclínate con el torso a 45°, tira del peso hacia el pecho apretando los omóplatos. Baja con control.',
        icon: '🔙',
    },
    {
        id: 'face-pull',
        name: 'Face Pull',
        category: 'Espalda',
        description: 'Con la polea a la altura de la cara y cuerda, tira hacia la cara separando las manos. Aprieta los omóplatos y rota los hombros externamente al final. Regresa lentamente.',
        icon: '🔙',
    },

    // ═══════════════════════════════════════
    //  HOMBROS
    // ═══════════════════════════════════════
    {
        id: 'press-militar-barra',
        name: 'Press Militar con Barra',
        category: 'Hombros',
        description: 'De pie o sentado, presiona la barra desde los hombros hacia arriba hasta extender los brazos. Baja la barra de forma controlada hasta la altura de la barbilla.',
        icon: '🏋️',
    },
    {
        id: 'press-militar-mancuerna',
        name: 'Press Militar con Mancuernas',
        category: 'Hombros',
        description: 'Sentado en banco con respaldo, presiona las mancuernas desde los hombros hacia arriba. Baja hasta que los brazos formen 90° a los lados.',
        icon: '🏋️',
    },
    {
        id: 'elevaciones-laterales-mancuerna',
        name: 'Elevaciones Laterales con Mancuerna',
        category: 'Hombros',
        description: 'De pie con mancuernas a los lados, eleva los brazos lateralmente hasta la altura de los hombros con los codos ligeramente flexionados. Baja controladamente.',
        icon: '🏋️',
    },
    {
        id: 'elevaciones-laterales-polea',
        name: 'Elevaciones Laterales en Polea',
        category: 'Hombros',
        description: 'De pie al lado de la polea baja, eleva el brazo lateralmente lejos de la polea hasta la altura del hombro. Mantén el codo ligeramente flexionado. Baja con control.',
        icon: '🏋️',
    },
    {
        id: 'elevaciones-laterales-sentado',
        name: 'Elevaciones Laterales Sentado con Mancuerna',
        category: 'Hombros',
        description: 'Sentado en el borde del banco con mancuernas, eleva los brazos lateralmente hasta los hombros. Al estar sentado reduces el impulso del cuerpo.',
        icon: '🏋️',
    },
    {
        id: 'elevaciones-frontales',
        name: 'Elevaciones Frontales',
        category: 'Hombros',
        description: 'De pie, eleva las mancuernas al frente con los brazos casi rectos hasta la altura de los hombros. Baja controladamente. Trabaja el deltoides anterior.',
        icon: '🏋️',
    },
    {
        id: 'pajaros-mancuerna',
        name: 'Pájaros con Mancuerna',
        category: 'Hombros',
        description: 'Inclínate hacia adelante con la espalda recta. Eleva las mancuernas lateralmente apretando los omóplatos. Trabaja el deltoides posterior. Baja controladamente.',
        icon: '🏋️',
    },
    {
        id: 'pajaros-maquina',
        name: 'Pájaros en Máquina',
        category: 'Hombros',
        description: 'Siéntate de frente a la máquina peck deck invertida. Abre los brazos hacia atrás enfocándote en apretar los omóplatos. Regresa lentamente.',
        icon: '🏋️',
    },
    {
        id: 'remo-al-menton',
        name: 'Remo al Mentón',
        category: 'Hombros',
        description: 'De pie con la barra o mancuernas, tira hacia arriba pegando el peso al cuerpo hasta la altura del mentón. Los codos suben por encima de las manos. Baja con control.',
        icon: '🏋️',
    },
    {
        id: 'press-arnold',
        name: 'Press Arnold',
        category: 'Hombros',
        description: 'Sentado con mancuernas al frente (palmas hacia ti), presiona hacia arriba rotando las muñecas hasta que las palmas miren al frente arriba. Invierte el movimiento al bajar.',
        icon: '🏋️',
    },

    // ═══════════════════════════════════════
    //  BÍCEPS
    // ═══════════════════════════════════════
    {
        id: 'curl-barra',
        name: 'Curl con Barra',
        category: 'Bíceps',
        description: 'De pie con la barra y agarre supino (palmas arriba), flexiona los codos subiendo la barra hacia los hombros. Mantén los codos pegados al cuerpo. Baja controladamente.',
        icon: '💪',
    },
    {
        id: 'curl-mancuerna-alterno',
        name: 'Curl Alterno con Mancuerna',
        category: 'Bíceps',
        description: 'De pie con mancuernas, alterna la flexión de cada brazo rotando la muñeca (supinación) al subir. Mantén los codos fijos. Baja lentamente.',
        icon: '💪',
    },
    {
        id: 'curl-martillo',
        name: 'Curl Martillo',
        category: 'Bíceps',
        description: 'De pie con mancuernas y agarre neutro (pulgares arriba), flexiona los codos sin rotar la muñeca. Trabaja bíceps y braquiorradial. Baja controladamente.',
        icon: '💪',
    },
    {
        id: 'curl-predicador',
        name: 'Curl Predicador',
        category: 'Bíceps',
        description: 'Apoya los brazos en el banco predicador. Flexiona los codos subiendo la barra o mancuerna. Aísla el bíceps eliminando el balanceo. Baja controladamente sin extender del todo.',
        icon: '💪',
    },
    {
        id: 'curl-concentrado',
        name: 'Curl Concentrado',
        category: 'Bíceps',
        description: 'Sentado, apoya el codo en la parte interna del muslo. Flexiona el brazo subiendo la mancuerna hacia el hombro. Aísla completamente el bíceps.',
        icon: '💪',
    },
    {
        id: 'curl-polea-baja',
        name: 'Curl en Polea Baja',
        category: 'Bíceps',
        description: 'De pie frente a la polea baja con barra recta o cuerda, flexiona los codos manteniendo los codos pegados al cuerpo. Aprieta arriba y baja controladamente.',
        icon: '💪',
    },
    {
        id: 'curl-barra-z',
        name: 'Curl con Barra Z',
        category: 'Bíceps',
        description: 'Similar al curl con barra pero con barra EZ que reduce tensión en las muñecas. Flexiona los codos hasta los hombros. Baja controladamente.',
        icon: '💪',
    },
    {
        id: 'curl-inclinado',
        name: 'Curl Inclinado con Mancuerna',
        category: 'Bíceps',
        description: 'Acuéstate en banco inclinado a 45° con mancuernas colgando. Flexiona los codos subiendo las mancuernas. El ángulo estira más el bíceps en su porción larga.',
        icon: '💪',
    },

    // ═══════════════════════════════════════
    //  TRÍCEPS
    // ═══════════════════════════════════════
    {
        id: 'press-frances',
        name: 'Press Francés',
        category: 'Tríceps',
        description: 'Acuéstate en banco con la barra arriba. Flexiona los codos bajando la barra hacia la frente sin mover los hombros. Extiende los brazos para volver arriba.',
        icon: '🦾',
    },
    {
        id: 'extension-triceps-polea-alta',
        name: 'Extensión de Tríceps en Polea Alta',
        category: 'Tríceps',
        description: 'De pie frente a la polea alta con barra recta o cuerda, extiende los codos empujando hacia abajo. Mantén los codos pegados al cuerpo. Regresa lentamente.',
        icon: '🦾',
    },
    {
        id: 'extension-triceps-polea-baja',
        name: 'Extensión de Tríceps en Polea Baja',
        category: 'Tríceps',
        description: 'De espaldas a la polea baja, agarra la cuerda y extiende los brazos hacia arriba y adelante. Los codos apuntan al frente. Baja controladamente.',
        icon: '🦾',
    },
    {
        id: 'extension-triceps-unilateral',
        name: 'Extensión de Tríceps Unilateral en Polea',
        category: 'Tríceps',
        description: 'De pie frente a la polea con un asa, extiende un brazo a la vez empujando hacia abajo. Mantén el codo fijo pegado al cuerpo. Alterna brazos.',
        icon: '🦾',
    },
    {
        id: 'fondos-triceps',
        name: 'Fondos en Paralelas (Tríceps)',
        category: 'Tríceps',
        description: 'En las barras paralelas con el torso erguido, baja el cuerpo flexionando los codos hasta 90°. Empuja hacia arriba extendiendo los codos. Codos cerca del cuerpo.',
        icon: '🦾',
    },
    {
        id: 'patada-triceps',
        name: 'Patada de Tríceps',
        category: 'Tríceps',
        description: 'Inclínate con un brazo apoyado. Con el codo a 90°, extiende el brazo hacia atrás apretando el tríceps al final. Baja controladamente sin mover el hombro.',
        icon: '🦾',
    },
    {
        id: 'press-cerrado',
        name: 'Press Banca Agarre Cerrado',
        category: 'Tríceps',
        description: 'Acuéstate en banco plano con agarre más estrecho que los hombros. Baja la barra al pecho y empuja hacia arriba. Énfasis en tríceps por el agarre cerrado.',
        icon: '🦾',
    },
    {
        id: 'extension-triceps-overhead',
        name: 'Extensión de Tríceps Overhead con Mancuerna',
        category: 'Tríceps',
        description: 'Sentado o de pie, sostén una mancuerna con ambas manos detrás de la cabeza. Extiende los brazos hacia arriba sin mover los codos. Baja controladamente.',
        icon: '🦾',
    },

    // ═══════════════════════════════════════
    //  PIERNAS
    // ═══════════════════════════════════════
    {
        id: 'sentadilla-barra',
        name: 'Sentadilla con Barra',
        category: 'Piernas',
        description: 'Con la barra en los trapecios, baja flexionando caderas y rodillas hasta que los muslos estén paralelos al suelo o más abajo. Sube empujando desde los talones.',
        icon: '🦵',
    },
    {
        id: 'sentadilla-hack',
        name: 'Sentadilla Hack en Máquina',
        category: 'Piernas',
        description: 'En la máquina hack, apoya la espalda en la almohadilla. Baja flexionando las rodillas y empuja hacia arriba. Pies a la anchura de los hombros en la plataforma.',
        icon: '🦵',
    },
    {
        id: 'prensa-piernas',
        name: 'Prensa de Piernas',
        category: 'Piernas',
        description: 'Siéntate en la prensa con los pies a la anchura de los hombros en la plataforma. Baja la plataforma flexionando rodillas a 90° y empuja hacia arriba sin bloquear las rodillas.',
        icon: '🦵',
    },
    {
        id: 'bulgaras',
        name: 'Sentadilla Búlgara',
        category: 'Piernas',
        description: 'Con un pie elevado en un banco detrás de ti, baja la rodilla trasera hacia el suelo flexionando la pierna delantera. Empuja hacia arriba desde el pie delantero.',
        icon: '🦵',
    },
    {
        id: 'extension-cuadriceps',
        name: 'Extensión de Cuádriceps',
        category: 'Piernas',
        description: 'Siéntate en la máquina con las piernas detrás del rodillo. Extiende las rodillas levantando el peso. Aprieta los cuádriceps arriba y baja controladamente.',
        icon: '🦵',
    },
    {
        id: 'curl-femoral',
        name: 'Curl Femoral',
        category: 'Piernas',
        description: 'Acuéstate boca abajo en la máquina con los tobillos bajo el rodillo. Flexiona las rodillas llevando los talones hacia los glúteos. Baja controladamente.',
        icon: '🦵',
    },
    {
        id: 'zancadas',
        name: 'Zancadas',
        category: 'Piernas',
        description: 'Da un paso largo al frente y baja la rodilla trasera casi al suelo. La rodilla delantera no debe sobrepasar la punta del pie. Empuja hacia arriba y alterna piernas.',
        icon: '🦵',
    },
    {
        id: 'peso-muerto-sumo',
        name: 'Peso Muerto Sumo',
        category: 'Piernas',
        description: 'Con los pies más anchos que los hombros y punteras hacia afuera, agarra la barra entre las piernas. Levanta extendiendo caderas y rodillas. Énfasis en aductores y glúteos.',
        icon: '🦵',
    },
    {
        id: 'aduptores',
        name: 'Aductores en Máquina',
        category: 'Piernas',
        description: 'Siéntate en la máquina de aductores con las piernas abiertas. Junta las piernas apretando los aductores internos del muslo. Abre lentamente con control.',
        icon: '🦵',
    },
    {
        id: 'abductores',
        name: 'Abductores en Máquina',
        category: 'Piernas',
        description: 'Siéntate en la máquina de abductores con las piernas juntas. Abre las piernas hacia afuera contra la resistencia. Regresa lentamente a la posición inicial.',
        icon: '🦵',
    },
    {
        id: 'pantorrilla-sentado',
        name: 'Pantorrilla Sentado',
        category: 'Piernas',
        description: 'Siéntate en la máquina de pantorrillas con las rodillas bajo las almohadillas. Eleva los talones contrayendo las pantorrillas. Baja estirando hasta sentir el estiramiento.',
        icon: '🦵',
    },
    {
        id: 'pantorrilla-pie',
        name: 'Pantorrilla de Pie',
        category: 'Piernas',
        description: 'De pie en la máquina con los hombros bajo las almohadillas, eleva los talones contrayendo las pantorrillas. Baja controladamente hasta el estiramiento completo.',
        icon: '🦵',
    },
    {
        id: 'sentadilla-goblet',
        name: 'Sentadilla Goblet',
        category: 'Piernas',
        description: 'De pie sosteniendo una mancuerna o kettlebell frente al pecho. Baja en sentadilla profunda manteniendo el torso erguido y los codos entre las rodillas.',
        icon: '🦵',
    },

    // ═══════════════════════════════════════
    //  GLÚTEOS
    // ═══════════════════════════════════════
    {
        id: 'hip-thrust',
        name: 'Hip Thrust',
        category: 'Glúteos',
        description: 'Con la espalda superior apoyada en un banco y la barra sobre las caderas, empuja las caderas hacia arriba apretando los glúteos al máximo. Baja controladamente.',
        icon: '🍑',
    },
    {
        id: 'patada-gluteo',
        name: 'Patada de Glúteo en Máquina',
        category: 'Glúteos',
        description: 'En la máquina o en cuadrupedia, extiende una pierna hacia atrás apretando el glúteo al final del movimiento. No arquees la espalda. Alterna piernas.',
        icon: '🍑',
    },
    {
        id: 'puente-gluteo',
        name: 'Puente de Glúteo',
        category: 'Glúteos',
        description: 'Acuéstate boca arriba con las rodillas flexionadas y los pies en el suelo. Eleva las caderas apretando los glúteos arriba. Mantén 2 segundos y baja controladamente.',
        icon: '🍑',
    },
    {
        id: 'peso-muerto-una-pierna',
        name: 'Peso Muerto a Una Pierna',
        category: 'Glúteos',
        description: 'De pie sobre una pierna, inclínate hacia adelante con la mancuerna mientras la otra pierna sube detrás. Mantén la espalda recta. Sube apretando glúteo. Alterna.',
        icon: '🍑',
    },

    // ═══════════════════════════════════════
    //  ABDOMEN
    // ═══════════════════════════════════════
    {
        id: 'abdominales-rueda',
        name: 'Abdominales con Rueda',
        category: 'Abdomen',
        description: 'De rodillas con la rueda abdominal, extiéndete hacia adelante controlando la bajada con el core. No dejes que la cadera caiga. Tira del abdomen para regresar.',
        icon: '🧱',
    },
    {
        id: 'plancha-abdominal',
        name: 'Plancha Abdominal',
        category: 'Abdomen',
        description: 'Apóyate sobre los antebrazos y puntas de los pies. Mantén el cuerpo en línea recta, core activado. No dejes que las caderas suban o bajen. Mantén el tiempo indicado.',
        icon: '🧱',
    },
    {
        id: 'encogimiento-abdominal',
        name: 'Encogimiento Abdominal (Crunch)',
        category: 'Abdomen',
        description: 'Acuéstate boca arriba con las rodillas flexionadas. Sube los hombros del suelo contrayendo el abdomen. No tires del cuello. Baja controladamente.',
        icon: '🧱',
    },
    {
        id: 'elevacion-piernas-colgado',
        name: 'Elevación de Piernas Colgado',
        category: 'Abdomen',
        description: 'Cuélgate de la barra con los brazos extendidos. Eleva las piernas rectas o con rodillas flexionadas hasta 90°. Baja controladamente sin balancearte.',
        icon: '🧱',
    },
    {
        id: 'russian-twist',
        name: 'Russian Twist',
        category: 'Abdomen',
        description: 'Sentado con el torso inclinado hacia atrás y los pies elevados, gira el torso de lado a lado tocando el suelo con el peso. Mantén el core activado.',
        icon: '🧱',
    },
    {
        id: 'mountain-climbers',
        name: 'Mountain Climbers',
        category: 'Abdomen',
        description: 'En posición de plancha alta, lleva alternadamente las rodillas hacia el pecho de forma rápida como si corrieras en el sitio. Mantén la cadera baja y estable.',
        icon: '🧱',
    },
    {
        id: 'bicicleta-abdominal',
        name: 'Bicicleta Abdominal',
        category: 'Abdomen',
        description: 'Acuéstate boca arriba con las manos detrás de la cabeza. Lleva el codo derecho hacia la rodilla izquierda mientras extiendes la pierna derecha. Alterna lados.',
        icon: '🧱',
    },
    {
        id: 'plancha-lateral',
        name: 'Plancha Lateral',
        category: 'Abdomen',
        description: 'Apóyate sobre un antebrazo de costado. Eleva las caderas formando línea recta del tobillo al hombro. Mantén el core activado durante el tiempo indicado. Alterna lados.',
        icon: '🧱',
    },

    // ═══════════════════════════════════════
    //  CARDIO
    // ═══════════════════════════════════════
    {
        id: 'cinta-correr',
        name: 'Cinta de Correr',
        category: 'Cardio',
        description: 'Corre o camina en la cinta a la velocidad e inclinación deseada. Mantén una postura erguida, brazos balanceándose naturalmente.',
        icon: '❤️‍🔥',
    },
    {
        id: 'bicicleta-estatica',
        name: 'Bicicleta Estática',
        category: 'Cardio',
        description: 'Pedalea a la intensidad y resistencia deseada. Ajusta el asiento para que la rodilla quede ligeramente flexionada en la parte baja del pedaleo.',
        icon: '❤️‍🔥',
    },
    {
        id: 'eliptica',
        name: 'Elíptica',
        category: 'Cardio',
        description: 'Movimiento suave y de bajo impacto que simula correr. Usa los brazos móviles para trabajo de cuerpo completo. Ajusta resistencia según necesidad.',
        icon: '❤️‍🔥',
    },
    {
        id: 'saltar-cuerda',
        name: 'Saltar la Cuerda',
        category: 'Cardio',
        description: 'Salta con ambos pies o alternando mientras giras la cuerda con las muñecas. Mantén los codos cerca del cuerpo y los saltos bajos.',
        icon: '❤️‍🔥',
    },
    {
        id: 'remo-ergometro',
        name: 'Remo (Ergómetro)',
        category: 'Cardio',
        description: 'Siéntate en el remo máquina. Empuja con las piernas, luego tira con la espalda y brazos. Invierte el orden al regresar. Movimiento fluido y controlado.',
        icon: '❤️‍🔥',
    },
    {
        id: 'burpees',
        name: 'Burpees',
        category: 'Cardio',
        description: 'De pie, baja a sentadilla, pon las manos al suelo, salta a posición de plancha, haz una flexión, salta los pies al frente y salta arriba con las manos sobre la cabeza.',
        icon: '❤️‍🔥',
    },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Get all unique muscle groups */
export const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
    'Pecho', 'Espalda', 'Hombros', 'Bíceps', 'Tríceps',
    'Piernas', 'Glúteos', 'Abdomen', 'Cardio',
];

/** Get exercises by muscle group */
export function getExercisesByCategory(category: MuscleGroup): ExerciseInfo[] {
    return EXERCISE_LIBRARY.filter((e) => e.category === category);
}

/** Search exercises by name */
export function searchExercises(query: string): ExerciseInfo[] {
    const q = query.toLowerCase().trim();
    if (!q) return EXERCISE_LIBRARY;
    return EXERCISE_LIBRARY.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
}

/** Find exercise info by name (for existing records) */
export function findExerciseByName(name: string): ExerciseInfo | undefined {
    return EXERCISE_LIBRARY.find(
        (e) => e.name.toLowerCase() === name.toLowerCase()
    );
}
