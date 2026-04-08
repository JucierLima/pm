const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Extrai o primeiro array JSON válido do texto, ignorando qualquer lixo ao redor
const extractJsonArray = (text) => {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('Nenhum array JSON encontrado na resposta da IA');
  }
  return JSON.parse(text.slice(start, end + 1));
};

const generateQuestions = async (materia, dificuldade = 'Médio', modo = 'estudo') => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `
    Atue como um professor especialista em concursos da PM-PE (Polícia Militar de Pernambuco).
    Gere 5 questões de múltipla escolha (A, B, C, D, E) sobre a matéria: ${materia}.
    Nível de dificuldade: ${dificuldade}.
    Contexto: ${modo === 'simulado' ? 'Simulado Geral' : 'Estudo focado'}.
    
    REQUISITOS OBRIGATÓRIOS:
    1. Baseie-se em provas reais da PM-PE dos últimos 7 anos (bancas como IAUPE ou similares).
    2. Retorne APENAS um array JSON puro, sem comentários, no seguinte formato:
    [
      {
        "pergunta": "Texto da pergunta aqui...",
        "opcoes": ["A) ...", "B) ...", "C) ...", "D) ...", "E) ..."],
        "correta": 0,
        "explicacao": "Explicação detalhada da resposta...",
        "materia": "${materia}",
        "dificuldade": "${dificuldade}"
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsed = extractJsonArray(text);

    if (!Array.isArray(parsed)) {
      throw new Error('A IA não retornou um array de questões');
    }

    return parsed;
  } catch (error) {
    console.error('Erro crítico no processamento da IA:', error.message);
    throw error; // Deixa o questionService decidir o fallback
  }
};

module.exports = { generateQuestions };
