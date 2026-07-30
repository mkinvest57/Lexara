import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@lexara.com' },
    update: {},
    create: {
      email: 'demo@lexara.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });

  console.log('✅ Created demo user:', user.email);

  // Create language profile (Spanish)
  const profile = await prisma.languageProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      targetLanguage: 'es',
      level: 'beginner',
      dailyGoalWords: 100,
      dailyGoalMinutes: 15,
      dailyGoalCards: 10,
    },
  });

  console.log('✅ Created language profile: Spanish');

  // Mini Stories - Beginner Level
  const beginnerStories = [
    {
      title: 'El Café',
      content: `María va al café todos los días. Ella pide un café con leche. El café está caliente. María se sienta cerca de la ventana. Mira a las personas en la calle. Es una mañana tranquila.`,
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400',
    },
    {
      title: 'En el Parque',
      content: `Pedro camina en el parque. Hay muchos árboles. Ve a un perro corriendo. El perro es grande y blanco. Pedro sonríe. Le gustan los perros. El día es soleado y hace calor.`,
      imageUrl: 'https://images.unsplash.com/photo-1552083375-1447ce886485?w=400',
    },
    {
      title: 'La Familia',
      content: `Ana vive con su familia. Tiene una madre, un padre y dos hermanos. Su hermano mayor se llama Carlos. Su hermana pequeña se llama Sofía. Todos cenan juntos cada noche. Ana está feliz con su familia.`,
      imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400',
    },
  ];

  // Intermediate Stories
  const intermediateStories = [
    {
      title: 'Un Día de Trabajo',
      content: `Laura trabaja en una oficina en el centro de la ciudad. Cada mañana toma el metro a las ocho. Su trabajo es interesante pero a veces estresante. Tiene muchas reuniones y debe completar varios proyectos. Durante el almuerzo, sale con sus colegas a un restaurante cercano. Por la tarde, revisa correos electrónicos y prepara presentaciones. Después del trabajo, le gusta caminar por el parque antes de regresar a casa.`,
      imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
    },
    {
      title: 'Vacaciones en la Playa',
      content: `Este verano, Marcos decidió visitar la costa mediterránea. Reservó un hotel pequeño cerca de la playa. El primer día, nadó en el mar cristalino y tomó el sol. Por la noche, probó comida típica en un restaurante local. El pescado estaba delicioso. Durante su estancia, también exploró pueblos antiguos en las montañas cercanas. Las vistas eran espectaculares. Marcos se sintió completamente relajado y no quería volver a la ciudad.`,
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    },
  ];

  // Advanced Stories
  const advancedStories = [
    {
      title: 'El Cambio Climático',
      content: `El cambio climático representa uno de los desafíos más significativos que enfrenta la humanidad en el siglo XXI. Los científicos han documentado un aumento constante en las temperaturas globales, atribuido principalmente a las emisiones de gases de efecto invernadero generadas por actividades humanas. Las consecuencias son evidentes: derretimiento acelerado de los glaciares, eventos climáticos extremos más frecuentes, y alteraciones en los ecosistemas. Muchos países han implementado políticas para reducir su huella de carbono, promoviendo energías renovables y tecnologías sostenibles. Sin embargo, la cooperación internacional sigue siendo fundamental para lograr cambios significativos. Los expertos advierten que el tiempo para actuar es limitado, y que las decisiones tomadas hoy determinarán el futuro del planeta para las próximas generaciones.`,
      imageUrl: 'https://images.unsplash.com/photo-1569163139394-de4798aa62b4?w=400',
    },
    {
      title: 'La Inteligencia Artificial',
      content: `La inteligencia artificial ha evolucionado de manera extraordinaria en las últimas décadas, transformando industrias enteras y redefiniendo nuestra relación con la tecnología. Desde asistentes virtuales hasta sistemas de diagnóstico médico avanzado, la IA está cada vez más integrada en nuestra vida cotidiana. Los algoritmos de aprendizaje automático pueden analizar cantidades masivas de datos, identificar patrones complejos y realizar predicciones con precisión sorprendente. No obstante, este progreso plantea cuestiones éticas importantes: ¿cómo garantizamos que los sistemas de IA sean justos y transparentes? ¿Qué impacto tendrá la automatización en el empleo? Los investigadores y legisladores trabajan para establecer marcos regulatorios que equilibren la innovación con la protección de derechos fundamentales. El futuro de la IA dependerá de nuestra capacidad para desarrollar estas tecnologías de manera responsable.`,
      imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
    },
  ];

  // Create all lessons
  const allStories = [
    ...beginnerStories.map((s) => ({ ...s, level: 'beginner' })),
    ...intermediateStories.map((s) => ({ ...s, level: 'intermediate' })),
    ...advancedStories.map((s) => ({ ...s, level: 'advanced' })),
  ];

  for (const story of allStories) {
    const wordCount = story.content.split(/\s+/).filter((w) => w.length > 0).length;
    const sentences = story.content.split(/[.!?]+/).filter((s) => s.trim().length > 0);

    const lesson = await prisma.lesson.create({
      data: {
        profileId: profile.id,
        title: story.title,
        content: story.content,
        type: 'story',
        level: story.level,
        imageUrl: story.imageUrl,
        wordCount,
      },
    });

    // Create sentences and tokens
    for (let i = 0; i < sentences.length; i++) {
      const sentenceText = sentences[i].trim() + '.';
      const sentence = await prisma.sentence.create({
        data: {
          lessonId: lesson.id,
          index: i,
          text: sentenceText,
        },
      });

      // Tokenize sentence
      const tokens = sentenceText
        .replace(/([.,!?;:])/g, ' $1 ')
        .split(/\s+/)
        .filter((t) => t.length > 0);

      for (let j = 0; j < tokens.length; j++) {
        await prisma.token.create({
          data: {
            sentenceId: sentence.id,
            index: j,
            form: tokens[j],
            lemma: tokens[j].toLowerCase().replace(/[.,!?;:]$/, ''),
          },
        });
      }
    }

    console.log(`✅ Created lesson: ${story.title} (${story.level})`);
  }

  console.log('\n🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
