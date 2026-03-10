/**
 * Kupuri Media – AI Agent Meeting Locations
 * Real locations in Mexico City and Xochimilco, modelled in Three.js
 */

export interface MeetingLocation {
  id: string;
  name: string;
  nameEs: string;
  neighborhood: string;
  description: string;
  descriptionEs: string;
  bgColor: number;
  ambientColor: number;
  fogColor: string;
  accentHex: string;
  /** Real-world reference image from Wikimedia Commons (CC-licensed, CORS-open) */
  referenceImageUrl: string;
  referenceImageCaption: string;
  /** Coordinates (used for map display) */
  lat: number;
  lng: number;
  /** Which agents typically meet here */
  defaultParticipants: string[];
}

export const MEETING_LOCATIONS: MeetingLocation[] = [
  {
    id: 'santa-maria-ribera',
    name: 'Kiosco Morisco – Santa María la Ribera',
    nameEs: 'Kiosco Morisco – Santa María la Ribera',
    neighborhood: 'Santa María la Ribera, CDMX',
    description:
      'A stunning Moorish cast-iron kiosk originally built for the 1884 New Orleans World\'s Fair. Now the crown jewel of Alameda de Santa María la Ribera, surrounded by ancient trees, benches, and Mexico City sky.',
    descriptionEs:
      'Kiosco de hierro forjado estilo morisco, construido para la Exposición Mundial de Nueva Orleans en 1884. Joya de la Alameda de Santa María la Ribera.',
    bgColor: 0x1a3a1a,
    ambientColor: 0x5aff88,
    fogColor: '#1a3a1a',
    accentHex: '#4CAF50',
    referenceImageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Kiosco_Morisco_-_Santa_Mar%C3%ADa_la_Ribera_-_M%C3%A9xico_D.F..jpg/1280px-Kiosco_Morisco_-_Santa_Mar%C3%ADa_la_Ribera_-_M%C3%A9xico_D.F..jpg',
    referenceImageCaption: 'Kiosco Morisco, Santa María la Ribera – Wikimedia Commons (CC BY-SA 3.0)',
    lat: 19.4478,
    lng: -99.1556,
    defaultParticipants: ['Synthia Prime', 'Agent-Marketing', 'Agent-Coder'],
  },
  {
    id: 'balcon-del-zocalo',
    name: 'Balcón del Zócalo – Rooftop',
    nameEs: 'Balcón del Zócalo – Azotea',
    neighborhood: 'Centro Histórico, CDMX',
    description:
      'Mexico City\'s most iconic rooftop dining experience, perched above the Zócalo with a front-row view of the Metropolitan Cathedral and the National Palace. Gold hour light, mezcal, and strategy.',
    descriptionEs:
      'La experiencia gastronómica más icónica de la Ciudad de México, sobre el Zócalo con vista directa a la Catedral Metropolitana y el Palacio Nacional.',
    bgColor: 0x1a0e04,
    ambientColor: 0xffc66d,
    fogColor: '#1a0e04',
    accentHex: '#d4af37',
    referenceImageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Zocalo_Mexico_City_Cathedral.jpg/1280px-Zocalo_Mexico_City_Cathedral.jpg',
    referenceImageCaption: 'Zócalo & Catedral Metropolitana, CDMX – Wikimedia Commons (CC BY-SA)',
    lat: 19.4326,
    lng: -99.1332,
    defaultParticipants: ['Synthia Prime', 'Agent-Marketing', 'Agent-Coder', 'Agent-Sales', 'Agent-Legal'],
  },
  {
    id: 'manantiales-xochimilco',
    name: 'Los Manantiales – Xochimilco',
    nameEs: 'Los Manantiales – Xochimilco',
    neighborhood: 'Xochimilco, CDMX',
    description:
      'The legendary 1958 Félix Candela hyperbolic paraboloid thin-shell concrete restaurant, floating above the waters of Xochimilco. Eight soaring shell "petals" frame a view of ancient chinampas and traditional trajineras.',
    descriptionEs:
      'El legendario restaurante de 1958 de Félix Candela: cubierta de paraboloide hiperbólico sobre las aguas de Xochimilco. Ocho "pétalos" de concreto enmarcan los canales y las trajineras.',
    bgColor: 0x061520,
    ambientColor: 0x00c9ff,
    fogColor: '#061520',
    accentHex: '#00c9ff',
    referenceImageUrl:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Manantiales_Restaurant_Xochimilco.jpg/1280px-Manantiales_Restaurant_Xochimilco.jpg',
    referenceImageCaption: 'Los Manantiales, Xochimilco (Félix Candela, 1958) – Wikimedia Commons',
    lat: 19.2655,
    lng: -99.1055,
    defaultParticipants: ['Synthia Prime', 'Agent-Coder', 'Agent-Creative'],
  },
];

/** Weekly meeting schedule – agents rotate through locations */
export interface ScheduledMeeting {
  id: string;
  locationId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday
  timeStart: string; // HH:MM
  timeEnd: string;
  title: string;
  titleEs: string;
  participants: string[];
  topic: string;
  topicEs: string;
}

export const WEEKLY_SCHEDULE: ScheduledMeeting[] = [
  {
    id: 'sm-mon-strategy',
    locationId: 'santa-maria-ribera',
    dayOfWeek: 1,
    timeStart: '09:00',
    timeEnd: '10:30',
    title: 'Monday Strategy Council',
    titleEs: 'Consejo Estratégico Lunes',
    participants: ['Synthia Prime', 'Agent-Marketing', 'Agent-Coder'],
    topic: 'Weekly objectives, campaign review, sprint planning',
    topicEs: 'Objetivos semanales, revisión de campañas, planificación de sprint',
  },
  {
    id: 'bz-tue-exec',
    locationId: 'balcon-del-zocalo',
    dayOfWeek: 2,
    timeStart: '18:00',
    timeEnd: '19:30',
    title: 'Executive Review – Zócalo Sunset',
    titleEs: 'Revisión Ejecutiva – Atardecer del Zócalo',
    participants: ['Synthia Prime', 'Agent-Marketing', 'Agent-Coder', 'Agent-Sales', 'Agent-Legal'],
    topic: 'Revenue targets, risk review, product decisions',
    topicEs: 'Objetivos de ingresos, revisión de riesgos, decisiones de producto',
  },
  {
    id: 'mx-wed-creative',
    locationId: 'manantiales-xochimilco',
    dayOfWeek: 3,
    timeStart: '11:00',
    timeEnd: '13:00',
    title: 'Creative Brainstorm – Manantiales',
    titleEs: 'Lluvia de ideas creativas – Manantiales',
    participants: ['Synthia Prime', 'Agent-Coder', 'Agent-Creative'],
    topic: 'New features, UX design, content strategy',
    topicEs: 'Nuevas funciones, diseño UX, estrategia de contenido',
  },
  {
    id: 'sm-thu-ops',
    locationId: 'santa-maria-ribera',
    dayOfWeek: 4,
    timeStart: '10:00',
    timeEnd: '11:00',
    title: 'Thursday Operations Sync',
    titleEs: 'Sincronización de Operaciones Jueves',
    participants: ['Synthia Prime', 'Agent-Marketing'],
    topic: 'Deployment status, client updates, blockers',
    topicEs: 'Estado de despliegue, actualizaciones de clientes, bloqueos',
  },
  {
    id: 'bz-fri-debrief',
    locationId: 'balcon-del-zocalo',
    dayOfWeek: 5,
    timeStart: '17:00',
    timeEnd: '18:00',
    title: 'Friday Debrief – Golden Hour',
    titleEs: 'Cierre Semanal – Hora Dorada',
    participants: ['Synthia Prime', 'Agent-Marketing', 'Agent-Coder', 'Agent-Sales'],
    topic: 'Week retrospective, wins, lessons learned',
    topicEs: 'Retrospectiva semanal, logros, lecciones aprendidas',
  },
  {
    id: 'mx-sat-vision',
    locationId: 'manantiales-xochimilco',
    dayOfWeek: 6,
    timeStart: '10:00',
    timeEnd: '12:00',
    title: 'Weekend Vision Session',
    titleEs: 'Sesión de Visión del Fin de Semana',
    participants: ['Synthia Prime', 'Agent-Creative'],
    topic: 'Roadmap planning, innovation research, personal brand',
    topicEs: 'Planificación de hoja de ruta, investigación de innovación, marca personal',
  },
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAY_NAMES_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
