import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RotateCcw, UserPlus, History, Trophy, AlertCircle, Coins, ArrowRight, Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Round {
  id: string;
  scores: number[];
  timestamp: number;
}

interface Player {
  name: string;
}

type Language = 'zh' | 'en';

const translations = {
  zh: {
    title: '麻雀計分板',
    subtitle: '記錄每一局的輸贏，保證結算平衡',
    editNames: '修改玩家名',
    cancelEdit: '取消修改',
    reset: '重設',
    resetConfirm: '確定要清除所有紀錄嗎？',
    saveNames: '儲存名稱',
    player: '玩家',
    unnamed: '未命名',
    addRound: '新增局數',
    balanceZero: '總和為 0 (平衡)',
    sum: '總和',
    recordRound: '記錄此局',
    history: '歷史紀錄',
    noHistory: '尚無紀錄，開始第一局吧！',
    finalSettlement: '最後結算',
    chipValue: '每個籌碼價值:',
    settlementAmount: '結算金額',
    paymentAdvice: '支付建議',
    noPayment: '目前無須支付',
    footer: '麻雀計分板 © 2026 • 保持平衡，公平競技',
  },
  en: {
    title: 'Mahjong Scoreboard',
    subtitle: 'Track every round and ensure balance.',
    editNames: 'Edit Names',
    cancelEdit: 'Cancel',
    reset: 'Reset',
    resetConfirm: 'Are you sure you want to clear all records?',
    saveNames: 'Save Names',
    player: 'Player',
    unnamed: 'Unnamed',
    addRound: 'Add Round',
    balanceZero: 'Sum is 0 (Balanced)',
    sum: 'Sum',
    recordRound: 'Record Round',
    history: 'History',
    noHistory: 'No records yet. Start your first round!',
    finalSettlement: 'Final Settlement',
    chipValue: 'Value per chip:',
    settlementAmount: 'Settlement Amount',
    paymentAdvice: 'Payment Advice',
    noPayment: 'No payment needed.',
    footer: 'Mahjong Scoreboard © 2026 • Stay balanced, play fair.',
  }
};

export default function App() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('mj-lang') : null;
    return (saved as Language) || 'zh';
  });

  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('mj-players') : null;
    return saved ? JSON.parse(saved) : [
      { name: '玩家 1' },
      { name: '玩家 2' },
      { name: '玩家 3' },
      { name: '玩家 4' }
    ];
  });

  const [rounds, setRounds] = useState<Round[]>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('mj-rounds') : null;
    return saved ? JSON.parse(saved) : [];
  });

  const [currentScores, setCurrentScores] = useState<string[]>(['', '', '', '']);
  const [isEditingNames, setIsEditingNames] = useState(false);
  const [tempNames, setTempNames] = useState<string[]>(players.map(p => p.name));
  const [chipValue, setChipValue] = useState<number>(1);

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('mj-lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('mj-players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('mj-rounds', JSON.stringify(rounds));
  }, [rounds]);

  const totalScores = players.map((_, idx) => 
    rounds.reduce((sum, round) => sum + round.scores[idx], 0)
  );

  const currentSum = currentScores.reduce((sum, val) => sum + (Number(val) || 0), 0);
  const isValid = currentSum === 0 && currentScores.every(s => s !== '' && s !== '-' && !isNaN(Number(s)));

  const handleAddRound = () => {
    if (!isValid) return;

    const newRound: Round = {
      id: crypto.randomUUID(),
      scores: currentScores.map(Number),
      timestamp: Date.now()
    };

    setRounds([newRound, ...rounds]);
    setCurrentScores(['', '', '', '']);
  };

  const handleDeleteRound = (id: string) => {
    setRounds(rounds.filter(r => r.id !== id));
  };

  const handleReset = () => {
    if (confirm(t.resetConfirm)) {
      setRounds([]);
      setCurrentScores(['', '', '', '']);
    }
  };

  const handleSaveNames = () => {
    setPlayers(tempNames.map(name => ({ name: name || t.unnamed })));
    setIsEditingNames(false);
  };

  const calculatePayments = () => {
    const balances = totalScores.map((score, idx) => ({
      name: players[idx].name,
      amount: score * chipValue
    }));

    const winners = balances.filter(b => b.amount > 0).map(b => ({ ...b })).sort((a, b) => b.amount - a.amount);
    const losers = balances.filter(b => b.amount < 0).map(b => ({ ...b, amount: Math.abs(b.amount) })).sort((a, b) => b.amount - a.amount);

    const payments: { from: string, to: string, amount: number }[] = [];

    let wIdx = 0;
    let lIdx = 0;

    while (wIdx < winners.length && lIdx < losers.length) {
      const winner = winners[wIdx];
      const loser = losers[lIdx];
      const amount = Math.min(winner.amount, loser.amount);

      if (amount > 0) {
        payments.push({ from: loser.name, to: winner.name, amount });
      }

      winner.amount -= amount;
      loser.amount -= amount;

      if (winner.amount < 0.01) wIdx++;
      if (loser.amount < 0.01) lIdx++;
    }

    return payments;
  };

  const payments = calculatePayments();

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#212529] font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <Trophy className="text-amber-500" />
              {t.title}
            </h1>
            <p className="text-gray-500 mt-1 italic">{t.subtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium cursor-pointer"
            >
              <Languages size={18} />
              {lang === 'zh' ? 'English' : '中文'}
            </button>
            <button
              onClick={() => setIsEditingNames(!isEditingNames)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium cursor-pointer"
            >
              <UserPlus size={18} />
              {isEditingNames ? t.cancelEdit : t.editNames}
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors shadow-sm text-sm font-medium cursor-pointer"
            >
              <RotateCcw size={18} />
              {t.reset}
            </button>
          </div>
        </header>

        {/* Player Names Editing */}
        <AnimatePresence>
          {isEditingNames && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-4 gap-4">
                {tempNames.map((name, idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{t.player} {idx + 1}</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        const next = [...tempNames];
                        next[idx] = e.target.value;
                        setTempNames(next);
                      }}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      placeholder={`${t.player} ${idx + 1}`}
                    />
                  </div>
                ))}
                <div className="md:col-span-4 flex justify-end mt-2">
                  <button
                    onClick={handleSaveNames}
                    className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium shadow-sm cursor-pointer"
                  >
                    {t.saveNames}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {players.map((player, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center space-y-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{player.name}</span>
              <span className={`text-2xl font-black ${totalScores[idx] > 0 ? 'text-emerald-600' : totalScores[idx] < 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                {totalScores[idx] > 0 ? `+${totalScores[idx]}` : totalScores[idx]}
              </span>
            </div>
          ))}
        </section>

        {/* Input Form */}
        <section className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Plus className="text-amber-500" />
              {t.addRound}
            </h2>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${currentSum === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {currentSum === 0 ? (
                <>{t.balanceZero}</>
              ) : (
                <>
                  <AlertCircle size={14} />
                  {t.sum}: {currentSum > 0 ? `+${currentSum}` : currentSum}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {players.map((player, idx) => (
              <div key={idx} className="space-y-2">
                <label className="text-sm font-medium text-gray-600 truncate block">{player.name}</label>
                <input
                  type="text"
                  value={currentScores[idx]}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Allow empty, single minus, or valid number
                    if (val === '' || val === '-' || !isNaN(Number(val))) {
                      const next = [...currentScores];
                      next[idx] = val;
                      setCurrentScores(next);
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition-all text-lg font-semibold text-center"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleAddRound}
            disabled={!isValid}
            className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 ${
              isValid 
                ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.98] cursor-pointer' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Plus size={24} />
            {t.recordRound}
          </button>
        </section>

        {/* History */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 px-2">
            <History className="text-amber-500" />
            {t.history}
          </h2>
          
          <div className="space-y-3">
            {rounds.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300 text-gray-400">
                {t.noHistory}
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {rounds.map((round, rIdx) => (
                  <motion.div
                    key={round.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 group"
                  >
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 bg-gray-50 rounded-full">
                      <span className="text-[10px] font-bold text-gray-400">#{rounds.length - rIdx}</span>
                      <span className="text-[8px] text-gray-400">{new Date(round.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="grid grid-cols-4 flex-grow gap-2">
                      {round.scores.map((score, sIdx) => (
                        <div key={sIdx} className="flex flex-col items-center">
                          <span className="text-[10px] text-gray-400 uppercase font-bold truncate w-full text-center">{players[sIdx].name}</span>
                          <span className={`font-bold ${score > 0 ? 'text-emerald-600' : score < 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                            {score > 0 ? `+${score}` : score}
                          </span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => handleDeleteRound(round.id)}
                      className="p-2 text-gray-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </section>

        {/* Final Settlement Section */}
        <section className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Coins className="text-amber-500" />
              {t.finalSettlement}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{t.chipValue}</span>
              <input
                type="number"
                value={chipValue}
                onChange={(e) => setChipValue(Number(e.target.value))}
                className="w-20 px-2 py-1 border border-gray-200 rounded-lg text-center font-bold outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Money Summary */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t.settlementAmount}</h3>
              <div className="space-y-2">
                {players.map((player, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <span className="font-medium">{player.name}</span>
                    <span className={`font-bold ${totalScores[idx] > 0 ? 'text-emerald-600' : totalScores[idx] < 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                      ${(totalScores[idx] * chipValue).toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t.paymentAdvice}</h3>
              <div className="space-y-2">
                {payments.length === 0 ? (
                  <div className="p-4 text-center text-gray-400 bg-gray-50 rounded-xl italic">
                    {t.noPayment}
                  </div>
                ) : (
                  payments.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-rose-600">{p.from}</span>
                        <ArrowRight size={14} className="text-gray-400" />
                        <span className="font-bold text-emerald-600">{p.to}</span>
                      </div>
                      <span className="font-black text-amber-700">${p.amount.toFixed(1)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-12 text-center text-gray-400 text-xs pb-8">
        {t.footer}
      </footer>
    </div>
  );
}
