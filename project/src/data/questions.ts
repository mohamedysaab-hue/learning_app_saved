import { Question } from '../types';

const questions: Question[] = [
  {
    id: '1',
    question: 'What is 5 + 3?',
    options: ['6', '7', '8', '9'],
    correctAnswer: '8',
    difficulty: 'Starter',
    ageRange: [5, 10],
    subject: 'Math',
    explanation: '5 plus 3 equals 8'
  },
  {
    id: '2',
    question: 'What is the capital of France?',
    options: ['London', 'Berlin', 'Paris', 'Madrid'],
    correctAnswer: 'Paris',
    difficulty: 'Starter',
    ageRange: [8, 15],
    subject: 'Geography',
    explanation: 'Paris is the capital and most populous city of France'
  },
  {
    id: '3',
    question: 'What is 12 × 4?',
    options: ['36', '44', '48', '52'],
    correctAnswer: '48',
    difficulty: 'Moderate',
    ageRange: [8, 14],
    subject: 'Math',
    explanation: '12 multiplied by 4 equals 48'
  },
  {
    id: '4',
    question: 'Which planet is known as the Red Planet?',
    options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
    correctAnswer: 'Mars',
    difficulty: 'Starter',
    ageRange: [8, 15],
    subject: 'Science',
    explanation: 'Mars appears red due to iron oxide on its surface'
  },
  {
    id: '5',
    question: 'What is the square root of 144?',
    options: ['10', '11', '12', '13'],
    correctAnswer: '12',
    difficulty: 'Moderate',
    ageRange: [10, 16],
    subject: 'Math',
    explanation: '12 × 12 = 144, so the square root of 144 is 12'
  },
];

export function getRandomQuestion(
  level: string,
  age: number,
  usedQuestionIds: string[]
): Question | null {
  const availableQuestions = questions.filter(
    q =>
      q.difficulty === level &&
      age >= q.ageRange[0] &&
      age <= q.ageRange[1] &&
      !usedQuestionIds.includes(q.id)
  );

  if (availableQuestions.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  return availableQuestions[randomIndex];
}

export { questions };
