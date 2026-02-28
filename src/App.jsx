import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, AlertCircle } from 'lucide-react';
import { analyzeMoodAndCurate } from './lib/gemini.js';
import PlaylistCard from './components/PlaylistCard.jsx';
import Loading from './components/Loading.jsx';
import styles from './App.module.css';

const QUICK_TAGS = [
    { label: '😊 설렘', value: '오늘 왠지 기분이 설레고 두근거려' },
    { label: '😢 위로받고 싶어', value: '힘든 하루였어, 위로가 필요해' },
    { label: '⚡ 에너지 충전', value: '지금 당장 신나는 음악이 듣고 싶어' },
    { label: '🌙 새벽감성', value: '새벽에 혼자 있는데 감성적인 기분이야' },
    { label: '☔ 비오는 날', value: '비가 내리는데 창밖을 보며 멍때리고 있어' },
    { label: '💪 집중모드', value: '공부하거나 일할 때 집중되는 음악 필요해' },
];

export default function App() {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [phase, setPhase] = useState('input');

    async function handleSubmit() {
        if (!input.trim()) return;
        setError('');
        setLoading(true);
        setPhase('loading');

        try {
            const data = await analyzeMoodAndCurate(input.trim());
            setResult(data);
            setPhase('result');
        } catch (err) {
            setError(err.message || '오류가 발생했어요. 다시 시도해주세요.');
            setPhase('input');
        } finally {
            setLoading(false);
        }
    }

    function handleReset() {
        setResult(null);
        setInput('');
        setError('');
        setPhase('input');
    }

    function handleQuickTag(value) {
        setInput(value);
    }

    function handleKeyDown(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSubmit();
        }
    }

    return (
        <div className={styles.app}>
            <AnimatePresence mode="wait">

                {/* ── INPUT PHASE ── */}
                {phase === 'input' && (
                    <motion.div
                        key="input"
                        className={styles.inputPhase}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <motion.header
                            className={styles.header}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                        >
                            <div className={styles.logo}>MOODTUNE</div>
                            <p className={styles.tagline}>K-POP 감성 큐레이터</p>
                        </motion.header>

                        <motion.div
                            className={styles.inputSection}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <h1 className={styles.mainQuestion}>
                                지금 이 순간,<br />
                                <span className={styles.highlight}>어떤 기분인가요?</span>
                            </h1>

                            <div className={styles.textareaWrapper}>
                                <textarea
                                    className={styles.textarea}
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="예) 오늘 퇴근길에 비가 내리는데 왠지 모르게 그리운 느낌이야..."
                                    rows={4}
                                    maxLength={500}
                                />
                                <div className={styles.charCount}>{input.length} / 500</div>
                            </div>

                            <div className={styles.quickTags}>
                                {QUICK_TAGS.map((tag) => (
                                    <button
                                        key={tag.label}
                                        className={styles.quickTag}
                                        onClick={() => handleQuickTag(tag.value)}
                                    >
                                        {tag.label}
                                    </button>
                                ))}
                            </div>

                            {error && (
                                <div className={styles.error}>
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <motion.button
                                className={styles.submitBtn}
                                onClick={handleSubmit}
                                disabled={!input.trim() || loading}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Sparkles size={18} />
                                <span>플레이리스트 만들기</span>
                            </motion.button>
                        </motion.div>
                    </motion.div>
                )}

                {phase === 'loading' && (
                    <motion.div key="loading" className={styles.loadingPhase}>
                        <Loading />
                    </motion.div>
                )}

                {phase === 'result' && result && (
                    <motion.div
                        key="result"
                        className={styles.resultPhase}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className={styles.resultHeader}
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className={styles.logo} style={{ marginBottom: '1.5rem' }}>MOODTUNE</div>

                            <div className={styles.emotionSummaryBox}>
                                <div className={styles.leftContent}>
                                    <span className={styles.emotionIcon}>✦</span>
                                    <p className={styles.emotionSummary}>{result.emotion_summary}</p>
                                </div>

                                <div className={styles.resetIconWrapper}
                                     onClick={handleSubmit}
                                     title="새로고침">
                                    <RotateCcw size={22}
                                               strokeWidth={10}
                                               className={styles.resetIcon}/>
                                </div>
                            </div>

                            <div className={styles.emotionTags}>
                                {result.emotion_tags?.map((tag, i) => (
                                    <span key={i} className={styles.emotionTag}>{tag}</span>
                                ))}
                            </div>

                            <p className={styles.inputPreview} onClick={handleReset} style={{ cursor: 'pointer' }}>
                                <span className={styles.inputQuote}>"</span>
                                {input}
                                <span className={styles.inputQuote}>"</span>
                                <span style={{ fontSize: '0.8rem', marginLeft: '8px', opacity: 0.6 }}>(수정하기)</span>
                            </p>
                        </motion.div>

                        <div className={styles.singleCardContainer}>
                            {result.playlist && (
                                <PlaylistCard playlist={result.playlist} index={0} />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}