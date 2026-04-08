import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Home, Star } from 'lucide-react';
import { motivationalQuotes } from '../lib/questions';

export default function QuizComplete({ score, total, wrongQuestions = [], xpEarned = 0, onRetryWrong, onGoHome }) {
  const percentage = Math.round((score / total) * 100);
  const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
  const allCorrect = wrongQuestions.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-4 py-8 text-center max-w-lg mx-auto"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl mb-6"
      >
        <Trophy className="h-12 w-12 text-white" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-black text-gray-900 mb-2"
      >
        {allCorrect ? 'Missão Cumprida! 🎖️' : 'Quase lá, soldado! 💪'}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-2xl px-6 py-3 shadow-md">
          <span className="text-4xl font-black text-blue-600">{score}</span>
          <span className="text-lg text-gray-600 font-medium">/ {total}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">{percentage}% de acertos</p>
      </motion.div>

      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3].map((star) => (
          <motion.div
            key={star}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ delay: 0.5 + star * 0.15, type: 'spring' }}
          >
            <Star
              className={`h-10 w-10 ${
                percentage >= star * 33
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-sm font-bold text-green-600 bg-green-100 px-4 py-2 rounded-xl inline-block mb-2"
      >
        +{xpEarned} XP ganhos!
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-sm text-gray-600 italic mt-4 mb-8 px-4"
      >
        "{quote}"
      </motion.p>

      <div className="space-y-3">
        {!allCorrect && (
          <button
            onClick={onRetryWrong}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl text-sm shadow-lg transition-all duration-200"
          >
            <RotateCcw className="h-4 w-4 mr-2 inline" />
            Revisar {wrongQuestions.length} questão(ões) errada(s)
          </button>
        )}
        <button
          onClick={onGoHome}
          className="w-full h-12 border border-gray-300 bg-white hover:bg-gray-50 font-bold rounded-xl text-sm shadow-md transition-all duration-200"
        >
          <Home className="h-4 w-4 mr-2 inline" />
          Voltar ao Início
        </button>
      </div>
    </motion.div>
  );
}
