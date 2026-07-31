export type MobileLesson = {
  id: string;
  title: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  type: 'Story' | 'Article';
  wordCount: number;
  content: string;
  imagePosition: string;
};

export const mobileLessons: MobileLesson[] = [
  {
    id: 'cafe-jueves',
    title: 'El café de los jueves',
    level: 'Beginner',
    type: 'Story',
    wordCount: 59,
    imagePosition: 'center',
    content: 'Cada jueves, Lucía visita un café pequeño cerca del parque. Pide un café con leche y abre su cuaderno. Mientras la ciudad despierta, escribe tres cosas por las que está agradecida. El camarero ya conoce su nombre y siempre le guarda una mesa junto a la ventana. Para Lucía, esa hora tranquila es la mejor parte de la semana.',
  },
  {
    id: 'tarde-madrid',
    title: 'Una tarde en Madrid',
    level: 'Beginner',
    type: 'Story',
    wordCount: 128,
    imagePosition: 'right',
    content: 'Clara salió de casa cuando la ciudad empezaba a despertar. En la esquina, el panadero ya había abierto y el aroma del pan llenaba la calle. Caminó sin prisa hacia el mercado.',
  },
  {
    id: 'ciudad-escucha',
    title: 'La ciudad que escucha',
    level: 'Intermediate',
    type: 'Article',
    wordCount: 214,
    imagePosition: 'left',
    content: 'Las ciudades también cuentan historias. Algunas aparecen en los edificios, otras viven en las conversaciones que escuchamos al caminar. Aprender una lengua es aprender a prestar atención.',
  },
];

export const wordMeanings: Record<string, string> = {
  agradecida: 'grateful',
  aroma: 'aroma',
  café: 'coffee',
  camarero: 'waiter',
  ciudad: 'city',
  jueves: 'Thursday',
  mercado: 'market',
  pequeño: 'small',
  tranquila: 'calm',
  ventana: 'window',
};
