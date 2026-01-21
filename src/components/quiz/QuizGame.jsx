import React, { useMemo, useState } from 'react';
import SocialShare from '../common/SocialShare.jsx';

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

function hashStringToSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
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
    const list = Array.isArray(products) ? products : [];
    if (list.length === 0) return null;

    const byId = list.find((p) => p.id === result.suggestedProductId);
    if (byId) return byId;

    const seed = hashStringToSeed(String(result.id || 'result'));
    const idx = seed % list.length;
    return list[idx] || null;
  }, [products, result]);

  const suggestedRecipes = useMemo(() => {
    if (!result) return [];
    const list = Array.isArray(recipes) ? recipes : [];
    if (list.length === 0) return [];

    const slugs = Array.isArray(result.suggestedRecipes) ? result.suggestedRecipes : [];
    const unique = Array.from(new Set(slugs));
    const resolved = unique
      .map((slug) => list.find((r) => r.slug === slug || r.id === slug))
      .filter(Boolean)
      .slice(0, 2);
    if (resolved.length === 2) return resolved;

    const seed = hashStringToSeed(String(result.id || 'result'));
    const rand = mulberry32(seed);

    const pool = list.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = pool[i];
      pool[i] = pool[j];
      pool[j] = tmp;
    }

    const picks = pool.filter((r) => !resolved.includes(r)).slice(0, Math.max(0, 2 - resolved.length));
    return [...resolved, ...picks].slice(0, 2);
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
    <div className="min-h-screen bg-transparent relative">
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-16">
        <div className="grid grid-cols-3 items-center gap-2 sm:gap-3">
          <div className="flex justify-start">
            <a href={goHomeHref} className="inline-flex items-center gap-2 bg-white/15 text-white font-bold rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-white/20 transition border border-white/20">
              <span className="inline-flex w-5 h-5 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9.5 12 3l9 6.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z" />
              </svg>
              </span>
              <span className="hidden sm:inline">{ui.home}</span>
            </a>
          </div>

          <div className="flex justify-center">
            <img
              src="/images/es/logo/logobanner.png"
              alt="Ranchitas"
              className="h-8 sm:h-9 md:h-10 w-auto max-w-[180px]"
              loading="eager"
            />
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={onRestart} className="inline-flex items-center gap-2 bg-white/15 text-white font-bold rounded-full px-3 sm:px-4 py-2 text-xs sm:text-sm hover:bg-white/20 transition border border-white/20">
              <span className="inline-flex w-5 h-5 items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <path d="M21 3v6h-6" />
              </svg>
              </span>
              <span className="hidden sm:inline">{ui.restart}</span>
            </button>
          </div>
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
                <div className="bg-white/10 border border-white/20 rounded-2xl px-6 py-5 text-center font-bold text-white text-lg md:text-xl">
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
                        className={`text-left bg-white/10 border border-white/20 rounded-xl px-5 py-4 transition ${active ? 'ring-2 ring-white/60' : 'hover:bg-white/15'}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`mt-1 w-2.5 h-2.5 rounded-full ${active ? 'bg-white' : 'bg-white/70'}`} />
                          <span className="text-white font-semibold">{opt.text}</span>
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
                    className="w-40 sm:w-48 rounded-full bg-white/15 text-white font-bold py-3 disabled:opacity-50 hover:bg-white/20 transition border border-white/20"
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
                <div className="bg-white/10 border border-white/20 rounded-3xl p-6">
                  <div className="bg-white/10 border border-white/20 rounded-3xl p-6 flex items-center justify-center">
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
                <div className="mt-6 space-y-4">
                  <div className="text-center">
                    <div className="text-white/90 font-bold">{ui.resultTitle}</div>
                    <div className="mt-1 text-white font-title font-bold italic text-2xl md:text-3xl">
                      {result?.title} {result?.emoji}
                    </div>
                  </div>

                  <div className="bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl shadow-black/20">
                    <div className="text-white/90 leading-relaxed">{result?.description}</div>
                  </div>

                  <div className="bg-white/10 border border-white/20 rounded-3xl p-6 shadow-2xl shadow-black/20">
                    <div className="text-white/90 font-bold mb-3 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <g clip-path="url(#clip0_33_2)">
                          <path d="M15 6.66667C16.3807 6.66667 17.5 5.54738 17.5 4.16667C17.5 2.78596 16.3807 1.66667 15 1.66667C13.6193 1.66667 12.5 2.78596 12.5 4.16667C12.5 5.54738 13.6193 6.66667 15 6.66667Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M5 12.5C6.38071 12.5 7.5 11.3807 7.5 10C7.5 8.61929 6.38071 7.5 5 7.5C3.61929 7.5 2.5 8.61929 2.5 10C2.5 11.3807 3.61929 12.5 5 12.5Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M15 18.3333C16.3807 18.3333 17.5 17.214 17.5 15.8333C17.5 14.4526 16.3807 13.3333 15 13.3333C13.6193 13.3333 12.5 14.4526 12.5 15.8333C12.5 17.214 13.6193 18.3333 15 18.3333Z" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M7.15833 11.2583L12.85 14.575" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M12.8417 5.425L7.15833 8.74167" stroke="white" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_33_2">
                            <rect width="20" height="20" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                      {ui.shareTitle}
                    </div>
                    <SocialShare
                      shareId={shareId}
                      url={typeof window !== 'undefined' ? window.location.href : ''}
                      title={`${ui.resultTitle} ${result?.title || ''}`}
                      description={result?.description || ''}
                      platforms={['facebook', 'x', 'instagram', 'tiktok']}
                      showLabels={true}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <div className="text-[#F86509] font-bold">{ui.recipesTitle}</div>
              <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-4">
                  <div className="text-white font-title font-bold italic text-5xl leading-none whitespace-pre-line">{ui.recipesHeading}</div>
                  <div className="mt-1 text-white">{ui.recipesDescription}</div>
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
                      className="bg-[#F86509] rounded-3xl p-4 shadow-2xl shadow-black/25 hover:opacity-95 transition"
                    >
                      <div className="relative">
                        <img src={r.image} alt={r.title} className="rounded-2xl w-full h-48 object-cover" loading="lazy" />
                      </div>
                      <div className="p-6">
                        <div className="text-white font-title font-bold italic text-lg leading-snug">{r.title}</div>
                        <div className="mt-3 text-white/90 text-sm italic leading-relaxed">{r.description}</div>
                        <div className="mt-5 text-white font-bold">{lang === 'es' ? 'Leer más' : 'Read more'}</div>
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
