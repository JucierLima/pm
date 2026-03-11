require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('./models/Question');

const questions = [
  // ===== LÍNGUA PORTUGUESA =====
  {
    materia: 'Língua Portuguesa',
    assunto: 'Gramática',
    dificuldade: 'Fácil',
    enunciado: 'Assinale a alternativa em que o termo destacado é um substantivo:',
    alternativas: [
      'Ele saiu depressa.',
      'A menina é muito doce.',
      'O aluno estudou muito.',
      'Ela veio correndo.',
      'O professor explicou a lição.'
    ],
    respostaCorreta: 2,
    explicacao: 'A palavra "aluno" é um substantivo, pois nomeia um ser. As outras alternativas apresentam advérbios (depressa, muito), adjetivos (doce) e verbos (estudou, veio, explicou).',
    anoConcurso: 2022
  },
  {
    materia: 'Língua Portuguesa',
    assunto: 'Interpretação de Texto',
    dificuldade: 'Médio',
    enunciado: 'No texto: "O policial demonstrou coragem ao enfrentar o bandido", o sujeito da oração é:',
    alternativas: [
      'O policial',
      'coragem',
      'o bandido',
      'demonstrou',
      'ao enfrentar'
    ],
    respostaCorreta: 0,
    explicacao: 'O sujeito é "o policial", pois é quem realiza a ação de demonstrar coragem. Trata-se de um sujeito simples, composto por um substantivo.',
    anoConcurso: 2021
  },
  {
    materia: 'Lígua Portuguesa',
    assunto: 'Ortografia',
    dificuldade: 'Difícil',
    enunciado: 'Assinale a alternativa em que todas as palavras estão corretas quanto à grafia:',
    alternativas: [
      'escroto, previlégio, beneficiente',
      'escroto, privilégio, beneficiente',
      'escroto, privilégio, beneficiente',
      'escróto, privilégio, beneficiente',
      'escroto, privilégio, benificiente'
    ],
    respostaCorreta: 2,
    explicacao: 'A grafia correta é: ESCROTO (sem acento), PRIVILÉGIO (com acento) e BENEFICENTE (sem "i" após o "c").',
    anoConcurso: 2020
  },
  {
    materia: 'Línguagem Escrita',
    assunto: 'Redação Oficial',
    dificuldade: 'Médio',
    enunciado: 'Em relação à estrutura de um Ofício, assinale a alternativa correta:',
    alternativas: [
      'O local e a data são opcionais.',
      'O destinatário deve ser colocado após o corpo do texto.',
      'O vocabulário deve ser rebuscado e literário.',
      'O tratamento "Senhor" é utilizado para autoridades de mesmo nível hierárquico.',
      'O assunto deve ser breve e objetivo.'
    ],
    respostaCorreta: 4,
    explicacao: 'O campo "Assunto" do ofício deve ser breve e objetivo, resumindo o tema da comunicação. As demais alternativas apresentam erros sobre a estrutura oficial.',
    anoConcurso: 2023
  },

  // ===== RACIOCÍNIO LÓGICO =====
  {
    materia: 'Raciocínio Lógico',
    assunto: 'Proposições',
    dificuldade: 'Fácil',
    enunciado: 'Qual das seguintes frases é uma proposição lógica?',
    alternativas: [
      'Que dia lindo!',
      'Feche a porta.',
      '3 + 5 = 8',
      'Espero que você venha.',
      'Quando ele chegar, saia.'
    ],
    respostaCorreta: 2,
    explicacao: 'Uma proposição lógica é uma frase declarative que pode ser classificada como verdadeira ou falsa. "3 + 5 = 8" é uma proposição verdadeira.',
    anoConcurso: 2022
  },
  {
    materia: 'Raciocínio Lógico',
    assunto: 'Silogismos',
    dificuldade: 'Médio',
    enunciado: 'Todo policial é honesto. Alguns militares são policiais. Logo:',
    alternativas: [
      'Todo militar é honesto.',
      'Alguns militares são honestos.',
      'Nenhum militar é honesto.',
      'Alguns policiais não são militares.',
      'Todos os honestos são policiais.'
    ],
    respostaCorreta: 1,
    explicacao: 'A conclusão válida é que alguns militares são honestos. A premissa "alguns militares são policiais" não abrange todos os militares, apenas uma parte.',
    anoConcurso: 2021
  },
  {
    materia: 'Raciocínio Lógico',
    assunto: 'Sequências',
    dificuldade: 'Difícil',
    enunciado: 'Observe a sequência: 2, 5, 10, 17, 26, ... O próximo número é:',
    alternativas: [
      '34',
      '35',
      '36',
      '37',
      '38'
    ],
    respostaCorreta: 3,
    explicacao: 'A sequência segue o padrão de n² + 1: 1²+1=2, 2²+1=5, 3²+1=10, 4²+1=17, 5²+1=26, 6²+1=37.',
    anoConcurso: 2023
  },
  {
    materia: 'Raciocínio Lógico',
    assunto: 'Tabelas Verdade',
    dificuldade: 'Difícil',
    enunciado: 'A tabela verdade da proposição "P ou Q" (P ∨ Q) é falsa quando:',
    alternativas: [
      'P é verdadeira e Q é verdadeira',
      'P é verdadeira e Q é falsa',
      'P é falsa e Q é verdadeira',
      'P é falsa e Q é falsa',
      'Em qualquer caso'
    ],
    respostaCorreta: 3,
    explicacao: 'A disjunção (ou) só é falsa quando ambas as proposições são falsas. Se pelo menos uma for verdadeira, o resultado é verdadeiro.',
    anoConcurso: 2020
  },

  // ===== INFORMÁTICA =====
  {
    materia: 'Informática',
    assunto: 'Hardware',
    dificuldade: 'Fácil',
    enunciado: 'Qual componente é considerado a "memória principal" do computador?',
    alternativas: [
      'HD (Disco Rígido)',
      'SSD',
      'Memória RAM',
      'Pen Drive',
      'CD-ROM'
    ],
    respostaCorreta: 2,
    explicacao: 'A memória RAM (Random Access Memory) é a memória principal do computador, onde são armazenados os dados que estão sendo processados no momento.',
    anoConcurso: 2022
  },
  {
    materia: 'Informática',
    assunto: 'Redes de Computadores',
    dificuldade: 'Médio',
    enunciado: 'O protocolo TCP/IP é dividido em camadas. A camada de Transporte utiliza quais protocolos?',
    alternativas: [
      'HTTP e FTP',
      'IP e ICMP',
      'TCP e UDP',
      'SMTP e POP3',
      'DNS e DHCP'
    ],
    respostaCorreta: 2,
    explicacao: 'A camada de Transporte do modelo TCP/IP utiliza os protocolos TCP (Transmission Control Protocol) e UDP (User Datagram Protocol).',
    anoConcurso: 2021
  },
  {
    materia: 'Informática',
    assunto: 'Segurança da Informação',
    dificuldade: 'Difícil',
    enunciado: 'Qual tipo de ataque de rede consiste em sobrecarregar um servidor com múltiplas requisições?',
    alternativas: [
      'Phishing',
      'Man-in-the-Middle',
      'DDoS',
      'SQL Injection',
      'XSS'
    ],
    respostaCorreta: 2,
    explicacao: 'DDoS (Distributed Denial of Service) é um ataque que sobrecarrega servidores com múltiplas requisições, tornando-os indisponíveis.',
    anoConcurso: 2023
  },
{
    materia: 'Informática',
    assunto: 'Microsoft Office',
    dificuldade: 'Fácil',
    enunciado: 'No Microsoft Excel, qual função é usada para calcular a média de um intervalo de células?',
    alternativas: [
      'SOMA()',
      'MEDIA()',
      'MÉDIA()',
      'MED()',
      'AVERAGE()'
    ],
    respostaCorreta: 2,
    explicacao: 'A função MÉDIA() do Excel calcula a média aritmética de um intervalo de células. A função AVERAGE() é a versão em inglês.',
    anoConcurso: 2020
  },

  // ===== DIREITO CONSTITUCIONAL =====
  {
    materia: 'Direito Constitucional',
    assunto: 'Direitos Fundamentais',
    dificuldade: 'Fácil',
    enunciado: 'São direitos sociais de segunda geração:',
    alternativas: [
      'Direito à vida e à propriedade',
      'Direito ao trabalho e à educação',
      'Direito à soberania',
      'Direito de petição',
      'Direito à segurança'
    ],
    respostaCorreta: 1,
    explicacao: 'Os direitos de segunda geração (direitos sociais) incluem direitos ao trabalho, educação, saúde, etc. São direitos que exigem prestações positivas do Estado.',
    anoConcurso: 2022
  },
  {
    materia: 'Direito Constitucional',
    assunto: 'Princípios Constitucionais',
    dificuldade: 'Médio',
    enunciado: 'O princípio da dignidade da pessoa humana está consagrado no artigo ___ da Constituição Federal:',
    alternativas: [
      '1º',
      '2º',
      '3º',
      '4º',
      '5º'
    ],
    respostaCorreta: 2,
    explicacao: 'A Constituição Federal de 1988 estabelece no artigo 3º que um dos objetivos fundamentais da República é "promover o bem de todos, sem preconceitos de origem, raça, sexo, cor, idade e quaisquer outras formas de discriminação", fundamentos na dignidade da pessoa humana.',
    anoConcurso: 2021
  },
  {
    materia: 'Direito Constitucional',
    assunto: 'Poderes do Estado',
    dificuldade: 'Difícil',
    enunciado: 'Compete privativamente ao Presidente da República:',
    alternativas: [
      'Iniciar lei sobre matéria de competência privativa do Congresso',
      'Sancionar projetos de lei',
      'Celebrar tratados internacionais',
      'Conceder indulto',
      'Todas as anteriores'
    ],
    respostaCorreta: 4,
    explicacao: 'O Presidente da República possui diversas competências privativas, incluindo iniciar leis em matéria de sua competência, sancionar projetos de lei, celebrar tratados (dependendo do tipo) e conceder indulto.',
    anoConcurso: 2023
  },

  // ===== DIREITOS HUMANOS =====
  {
    materia: 'Direitos Humanos',
    assunto: 'Direitos Civis e Políticos',
    dificuldade: 'Fácil',
    enunciado: 'A Declaração Universal dos Direitos Humanos foi promulgada em:',
    alternativas: [
      '1945',
      '1948',
      '1950',
      '1964',
      '1988'
    ],
    respostaCorreta: 1,
    explicacao: 'A Declaração Universal dos Direitos Humanos foi adotada pela Organização das Nações Unidas (ONU) em 10 de dezembro de 1948.',
    anoConcurso: 2022
  },
  {
    materia: 'Direitos Humanos',
    assunto: 'Tratados Internacionais',
    dificuldade: 'Médio',
    enumerado: 'Os tratados internacionais de direitos humanos, após a Emenda Constitucional nº 45, possuem:',
    alternativas: [
      'Hierarquia supralegal',
      'Hierarquia constitucional',
      'Hierarquia de lei ordinária',
      'Hierarquia de medida provisória',
      'Não possuem hierarquia definida'
    ],
    respostaCorreta: 0,
    explicacao: 'Após a EC 45/2004 (Reforma do Judiciary), os tratados internacionais de direitos humanos têm hierarquia supralegal, estando acima das leis mas abaixo da Constituição.',
    anoConcurso: 2021
  },
  {
    materia: 'Direitos Humanos',
    assunto: 'Direitos Fundamentais',
    dificuldade: 'Difícil',
    enunciado: 'O princípio da vedação do retrocesso em direitos sociais significa que:',
    alternativas: [
      'O Estado pode reduzir os direitos já conquistados em situações excepcionais',
      'Os direitos sociais não podem ser objeto de emendas constitucionais',
      'Uma vez estabelecidos, os direitos sociais não podem ser Eliminados ou reduzidos',
      'O retrocesso só é permitido mediante referendo popular',
      'Não existe vedação ao retrocesso no Brasil'
    ],
    respostaCorreta: 2,
    explicacao: 'O princípio da vedação do retrocesso (princípio da não-regressão) impede que o Estado elimine ou reduza os direitos sociais já conquistados, pois isso configuraria violação ao princípio da dignidade humana.',
    anoConcurso: 2023
  },

  // ===== HISTÓRIA DE PERNAMBUCO =====
  {
    materia: 'História de Pernambuco',
    assunto: 'Período Colonial',
    dificuldade: 'Fácil',
    enunciado: 'A Capitanía de Pernambuco foi fundada em:',
    alternativas: [
      '1534',
      '1537',
      '1549',
      '1555',
      '1563'
    ],
    respostaCorreta: 1,
    explicacao: 'A Capitania de Pernambuco foi fundada em 1537, sendo doada a Duarte Coelho, primeiro donatário.',
    anoConcurso: 2022
  },
  {
    materia: 'História de Pernambuco',
    assunto: 'Invasões Holandesas',
    dificuldade: 'Médio',
    enunciado: 'A participação dos holandeses em Pernambuco resultou na construção de:',
    alternativas: [
      'Palácio da Alvorada',
      'Forte do Brum',
      'Marco Zero',
      'Parque da Tamarineira',
      'Teatro Santa Isabel'
    ],
    respostaCorreta: 1,
    explicacao: 'Os holandeses construíram diversos fortes em Pernambuco, sendo o Forte do Brum (atual Museu Militar) um dos principais.',
    anoConcurso: 2021
  },
  {
    materia: 'História de Pernambuco',
    assunto: 'Revolução Praieira',
    dificuldade: 'Difícil',
    enunciado: 'A Revolução Praieira (1848-1850) foi:',
    alternativas: [
      'Uma revolta de escravizados',
      'Um movimento liberal-radical',
      'Uma guerra entre Pernambuco e Paraíba',
      'Uma invasão estrangeira',
      'Um levante militar sem ideologia definida'
    ],
    respostaCorreta: 1,
    explicacao: 'A Revolução Praieira foi o mais importante movimento liberal-radical do Brasil Imperial, exigindo constituição, federalismo e maior participação popular.',
    anoConcurso: 2023
  },

  // ===== LEGISLAÇÃO EXTRAVAGANTE =====
  {
    materia: 'Legislação Extravagante',
    assunto: 'Estatuto do Desarmamento',
    dificuldade: 'Fácil',
    enumerado: 'Conforme o Estatuto do Desarmamento (Lei nº 10.826/2003), é crime o porte de arma de fogo:',
    alternativas: [
      'Em área rural',
      'Para legítima defesa',
      'Com autorização válida',
      'Em locais públicos',
      'Para colecionadores'
    ],
    respostaCorreta: 3,
    explicacao: 'O porte de arma de fogo em locais públicos é crime, exceto para pessoas autorizadas (policiais, agentes de segurança, etc.) em exercício de suas funções.',
    anoConcurso: 2022
  },
  {
    materia: 'Legislação Extravagante',
    assunto: 'Lei Maria da Penha',
    dificuldade: 'Médio',
    enunciado: 'A Lei Maria da Penha (Lei nº 11.340/2006) criou mecanismos para:',
    alternativas: [
      'Punir crimes contra animais',
      'Combater a violência doméstica contra a mulher',
      'Proteger crianças e adolescentes',
      'Combater o tráfico de drogas',
      'Regular o direito do trabalho'
    ],
    respostaCorreta: 1,
    explicacao: 'A Lei Maria da Penha foi criada para coibir a violência doméstica e familiar contra a mulher, estabelecendo medidas protetivas e punições mais rígidas.',
    anoConcurso: 2021
  },
  {
    materia: 'Legislação Extravagante',
    assunto: 'Estatuto da Criança e do Adolescente',
    dificuldade: 'Difícil',
    enunciado: 'Segundo o ECA, a proteção integral à criança e ao adolescente compreende:',
    alternativas: [
      'Apenas direitos civis',
      'Apenas direitos sociais',
      'Direitos civis, sociais e emergentes',
      'Apenas direitos fundamentais',
      'Apenas direitos políticos'
    ],
    respostaCorreta: 2,
    explicacao: 'O ECA garante proteção integral compreendendo direitos civis, sociais e emergentes, além de medidas específicas de proteção.',
    anoConcurso: 2023
  },

  // ===== LEGISLAÇÃO PMPE =====
  {
    materia: 'Legislação PMPE',
    assunto: 'Estatuto do PMPE',
    dificuldade: 'Fácil',
    enunciado: 'A Polícia Militar de Pernambuco é uma instituição:',
    alternativas: [
      'Civil',
      'Militar estadual',
      'Federal',
      'Privada',
      'Mista'
    ],
    respostaCorreta: 1,
    explicacao: 'As Polícias Militares são instituições militares estaduais, conforme a Constituição Federal, responsáveis pelo policiamento ostensivo.',
    anoConcurso: 2022
  },
  {
    materia: 'Legislação PMPE',
    assunto: 'Código Penal Militar',
    dificuldade: 'Médio',
    enunciado: 'No Código Penal Militar, a extinção de punibilidade pode ocorrer por:',
    alternativas: [
      'Morte do agente',
      'Anistia',
      'Perdão judicial',
      'Prescrição',
      'Todas as anteriores'
    ],
    respostaCorreta: 4,
    explicacao: 'A extinção de punibilidade no CPM ocorre por diversos motivos, incluindo morte do agente, anistia, perdão judicial e prescrição.',
    anoConcurso: 2021
  },
  {
    materia: 'Legislação PMPE',
    assunto: 'Hierarquia Militar',
    dificuldade: 'Difícil',
    enumerado: 'A hierarquia na PMPE, do posto mais alto para o mais baixo, é:',
    alternativas: [
      'Coronel, Major, Tenente, Sargento, Cabo, Soldado',
      'Coronel, Tenente, Major, Sargento, Cabo, Soldado',
      'General, Coronel, Major, Tenente, Sargento, Cabo, Soldado',
      'Coronel, Major, Capitão, Tenente, Sargento, Cabo, Soldado',
      'Delegado, Coronel, Major, Tenente, Sargento, Cabo, Soldado'
    ],
    respostaCorreta: 0,
    explicacao: 'A hierarquia militar na PMPE (oficiais superiores: Coronel, Major; oficiais intermediários: Tenente; praça: Sargento, Cabo, Soldado).',
    anoConcurso: 2023
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/policial_estudos';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Clear existing questions
    await Question.deleteMany({});
    console.log('✅ Questões antigas removidas');

    // Insert new questions
    await Question.insertMany(questions);
    console.log(`✅ ${questions.length} questões inseridas com sucesso!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao seedar banco de dados:', error);
    process.exit(1);
  }
}

seedDatabase();

