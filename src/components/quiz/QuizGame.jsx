import React, { useMemo, useState } from 'react';

function interpolate(template, vars) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ''));
}

function computeScores(questions, answers) {
  const scores = {};
  for (const q of questions) {
    const optionId = answers[q.id];
    if (!optionId) continue;
    const opt = q.options.find((o) => o.id === optionId);
    if (!opt || !opt.scores) continue;
    for (const [k, v] of Object.entries(opt.scores)) {
      scores[k] = (scores[k] || 0) + (typeof v === 'number' ? v : 0);
    }
  }
  return scores;
}

function pickResult(results, scores) {
  let best = results[0];
  let bestScore = -Infinity;
  for (const r of results) {
    const s = scores[r.id] ?? 0;
    if (s > bestScore) {
      best = r;
      bestScore = s;
    }
  }
  return best;
}

export default function QuizGame({ lang, quizData, products, recipes, shareId }) {
  const ui = quizData.ui;
  const quiz = quizData.quiz;

  const questions = quiz.questions || [];
  const total = questions.length;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isFinished, setIsFinished] = useState(false);

  const currentQuestion = questions[step];

  const scores = useMemo(() => computeScores(questions, answers), [questions, answers]);
  const result = useMemo(() => (isFinished ? pickResult(quiz.results || [], scores) : null), [isFinished, quiz.results, scores]);

  const suggestedProduct = useMemo(() => {
    if (!result) return null;
    return (products || []).find((p) => p.id === result.suggestedProductId) || null;
  }, [products, result]);

  const suggestedRecipes = useMemo(() => {
    if (!result) return [];
    const slugs = Array.isArray(result.suggestedRecipes) ? result.suggestedRecipes : [];
    const unique = Array.from(new Set(slugs));
    return unique
      .map((slug) => (recipes || []).find((r) => r.slug === slug || r.id === slug))
      .filter(Boolean)
      .slice(0, 2);
  }, [recipes, result]);

  const progressPct = total > 0 ? Math.round(((step + 1) / total) * 100) : 0;

  const goHomeHref = `/${lang}/`;

  const onSelect = (optionId) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const canNext = currentQuestion && Boolean(answers[currentQuestion.id]);

  const onNext = () => {
    if (!canNext) return;
    if (step === total - 1) {
      setIsFinished(true);
      const r = pickResult(quiz.results || [], computeScores(questions, { ...answers, [currentQuestion.id]: answers[currentQuestion.id] }));
      const title = `${ui.resultTitle} ${r.title}`;
      const url = window.location.href;
      window.dispatchEvent(
        new CustomEvent('quiz:share-update', {
          detail: { shareId, url, title, description: r.description }
        })
      );
      return;
    }
    setStep((s) => Math.min(s + 1, total - 1));
  };

  const onPrev = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

  const onRestart = () => {
    setStep(0);
    setAnswers({});
    setIsFinished(false);
  };

  if (!currentQuestion && !isFinished) return null;

  return (
    <div className="min-h-screen bg-[#0B3DBE] relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 40%), radial-gradient(circle at 80% 60%, rgba(255,255,255,0.20), transparent 45%)" }} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-16">
        <div className="flex items-center justify-between gap-3">
          <a href={goHomeHref} className="inline-flex items-center gap-2 bg-white text-black font-bold rounded-full px-4 py-2 text-sm hover:opacity-90 transition">
            <span className="inline-flex w-5 h-5 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z" />
              </svg>
            </span>
            {ui.home}
          </a>

          <div className="text-white font-title font-bold italic text-2xl md:text-3xl">{ui.brandTitle}</div>

          <button type="button" onClick={onRestart} className="inline-flex items-center gap-2 bg-white text-black font-bold rounded-full px-4 py-2 text-sm hover:opacity-90 transition">
            <span className="inline-flex w-5 h-5 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <path d="M21 3v6h-6" />
              </svg>
            </span>
            {ui.restart}
          </button>
        </div>

        {!isFinished ? (
          <>
            <div className="mt-6">
              <div className="flex items-center justify-between text-white/90 text-sm mb-2">
                <div>{interpolate(ui.questionLabel, { current: step + 1, total })}</div>
                <div>{progressPct}%</div>
              </div>
              <div className="h-2 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-[#F86509]" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            <div className="mt-10 flex items-center justify-center">
              <div className="w-full max-w-3xl">
                <div className="bg-white rounded-2xl px-6 py-5 text-center font-bold text-[#F86509] text-lg md:text-xl shadow-xl">
                  {currentQuestion.text}
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {currentQuestion.options.map((opt) => {
                    const active = answers[currentQuestion.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onSelect(opt.id)}
                        className={`text-left bg-white rounded-xl px-5 py-4 shadow-lg border-2 transition ${active ? 'border-[#0B3DBE]' : 'border-transparent hover:border-[#0B3DBE]/40'}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`mt-1 w-2.5 h-2.5 rounded-full ${active ? 'bg-[#0B3DBE]' : 'bg-[#0B3DBE]'}`} />
                          <span className="text-black font-semibold">{opt.text}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={onPrev}
                    disabled={step === 0}
                    className="w-40 sm:w-48 rounded-full bg-[#1E4ED8] text-white font-bold py-3 disabled:opacity-50 hover:opacity-90 transition"
                  >
                    {ui.previous}
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    disabled={!canNext}
                    className="w-40 sm:w-48 rounded-full bg-[#F86509] text-white font-bold py-3 disabled:opacity-50 hover:opacity-90 transition"
                  >
                    {ui.next}
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5">
                <div className="bg-[#1447C9] rounded-3xl p-6 shadow-2xl">
                  <div className="bg-[#0B3DBE] rounded-3xl p-6 flex items-center justify-center">
                    {suggestedProduct?.image ? (
                      <img src={suggestedProduct.image} alt={suggestedProduct.name} className="max-h-[260px] w-auto object-contain" />
                    ) : (
                      <div className="text-white">{suggestedProduct?.name || ''}</div>
                    )}
                  </div>
                  <a
                    href={`/${lang}/${lang === 'es' ? 'productos' : 'products'}/${suggestedProduct?.id || ''}`}
                    className="mt-5 block bg-[#F86509] text-white font-bold rounded-full text-center py-3 hover:opacity-90 transition"
                  >
                    {suggestedProduct?.name || ''}
                  </a>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="flex items-center justify-between gap-3">
                  <a href={goHomeHref} className="inline-flex items-center gap-2 bg-white text-black font-bold rounded-full px-4 py-2 text-sm hover:opacity-90 transition">
                    <span className="inline-flex w-5 h-5 items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z" />
                      </svg>
                    </span>
                    {ui.goHome}
                  </a>
                  <button type="button" onClick={onRestart} className="inline-flex items-center gap-2 bg-white text-black font-bold rounded-full px-4 py-2 text-sm hover:opacity-90 transition">
                    <span className="inline-flex w-5 h-5 items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                        <path d="M21 3v6h-6" />
                      </svg>
                    </span>
                    {ui.repeatQuiz}
                  </button>
                </div>

                <div className="mt-6 bg-[#1447C9] rounded-3xl p-6 shadow-2xl">
                  <div className="text-white/90 font-bold">{ui.resultTitle}</div>
                  <div className="mt-1 text-white font-title font-bold italic text-2xl md:text-3xl">
                    {result?.title} {result?.emoji}
                  </div>
                  <div className="mt-4 text-white/90 leading-relaxed">{result?.description}</div>

                  <div className="mt-6 bg-[#0B3DBE] rounded-2xl p-5">
                    <div className="text-white/90 font-bold mb-3">{ui.shareTitle}</div>
                    <div id="quiz-share-slot" data-share-id={shareId} />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <div className="text-[#F86509] font-bold">{ui.recipesTitle}</div>
              <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4">
                  <div className="text-white font-title font-bold italic text-5xl leading-none whitespace-pre-line">{ui.recipesHeading}</div>
                  <a
                    href={`/${lang}/${lang === 'es' ? 'recetas' : 'recipes'}`}
                    className="mt-6 inline-flex items-center justify-center bg-[#F86509] text-white font-bold rounded-full px-6 py-3 hover:opacity-90 transition"
                  >
                    {ui.recipesCta}
                  </a>
                </div>

                <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {suggestedRecipes.map((r) => (
                    <a
                      key={r.slug || r.id}
                      href={`/${lang}/${lang === 'es' ? 'recetas' : 'recipes'}/${r.slug || r.id}`}
                      className="bg-[#F86509] rounded-3xl overflow-hidden shadow-2xl hover:opacity-95 transition"
                    >
                      <div className="relative">
                        <img src={r.image} alt={r.title} className="w-full h-44 object-cover" loading="lazy" />
                      </div>
                      <div className="p-5">
                        <div className="text-white font-bold">{r.title}</div>
                        <div className="mt-2 text-white/90 text-sm">{r.description}</div>
                        <div className="mt-4 text-white font-bold underline">{lang === 'es' ? 'Leer más' : 'Read more'}</div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
