// src/App.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw, AlertCircle, Menu } from 'lucide-react';
import { analyzeMoodAndCurate } from './lib/gemini.js';
import PlaylistCard from './components/PlaylistCard.jsx';
import MoodTracker from './components/MoodTracker.jsx'; // 신규 컴포넌트 임포트
import Loading from './components/Loading.jsx';
import styles from './App.module.css';

const QUICK_TAGS = [
    { label: '😊 설렘', value: ['오늘 왠지 기분이 설레고 두근거려', '좋아하는 사람과 연락하는 듯한 두근거림', '소개팅 가기 전, 설레는 마음을 더해줄 노래'] },
    { label: '😢 위로받고 싶어', value: ['힘든 하루였어, 따뜻한 위로가 필요해', '지친 마음을 달래줄 포근한 노래 들려줘', '오늘 하루 너무 고생한 나에게 주는 선물'] },
    { label: '⚡ 에너지 충전', value: ['지금 당장 텐션 올릴 신나는 음악이 필요해', '지루한 오후를 깨워줄 강력한 에너지가 필요해', '운동할 때 듣기 좋은 신나는 K-POP 플레이리스트'] },
    { label: '🌙 새벽감성', value: ['새벽에 혼자 있는데 감성적인 기분이야', '조용한 밤, 깊은 생각에 잠기게 하는 노래', '잠들기 전 마음이 차분해지는 플레이리스트'] },
    { label: '☔ 비오는 날', value: ['비가 내리는데 창밖을 보며 멍때리고 있어', '빗소리와 잘 어울리는 잔잔한 노래', '비 오는 날의 쓸쓸함과 차분함을 채워줄 음악'] },
    { label: '💪 집중모드', value: ['공부하거나 일할 때 집중력을 높여줄 음악', '가사 없는 연주곡이나 차분한 비트가 필요해', '방해받지 않고 작업에 몰입하고 싶어'] },
];

const App = () => { // const 선언 방식으로 변경
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    // phase: input, loading, result, history (무드 트래커 뷰)
    const [phase, setPhase] = useState('input');

    // 데이터를 로컬 스토리지에 저장하는 함수
    const saveToHistory = (data) => {
        const savedHistory = JSON.parse(localStorage.getItem('moodHistory') || '[]');

        // 최신 데이터가 맨 앞으로 오게 저장 (날짜 정보 추가)
        const newEntry = {
            ...data,
            savedAt: new Date().toISOString(), // 현재 시간 저장
        };

        const updatedHistory = [newEntry, ...savedHistory].slice(0, 30); // 최대 30개까지만 저장
        localStorage.setItem('moodHistory', JSON.stringify(updatedHistory));
    };

    const handleSubmit = async () => { // const 선언 방식
        if (!input.trim()) return;
        setError('');
        setLoading(true);
        setPhase('loading');

        try {
            const data = await analyzeMoodAndCurate(input.trim());
            setResult(data);

            // 결과가 성공적이면 로컬 스토리지에 저장
            saveToHistory(data);

            setPhase('result');
        } catch (err) {
            setError(err.message || '오류가 발생했어요. 다시 시도해주세요.');
            setPhase('input');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => { // const 선언 방식
        setResult(null);
        setInput('');
        setError('');
        setPhase('input');
    };

    const handleQuickTag = (values) => { // const 선언 방식
        if (Array.isArray(values)) {
            const randomIndex = Math.floor(Math.random() * values.length);
            setInput(values[randomIndex]);
        } else {
            setInput(values);
        }
    };

    const handleKeyDown = (e) => { // const 선언 방식
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSubmit();
        }
    };

    return (
        <div className={styles.app}>
            {phase !== 'loading' && (
                <button className={styles.menuBtn} onClick={() => setPhase('history')}>
                    <Menu size={24} color="white" />
                </button>
            )}

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

                {/* ── LOADING PHASE ── */}
                {phase === 'loading' && (
                    <motion.div key="loading" className={styles.loadingPhase}>
                        <Loading />
                    </motion.div>
                )}

                {/* ── RESULT PHASE ── */}
                {phase === 'result' && result && (
                    <motion.div
                        key="result"
                        className={styles.resultPhase}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div className={styles.resultHeader}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}>
                            <div className={styles.logo}
                                 style={{ marginBottom: '1.5rem', cursor: 'pointer' , paddingTop: "0.4rem"}}
                                 onClick={handleReset}>
                                MOODTUNE
                            </div>

                            <div className={styles.emotionSummaryBox}>
                                <div className={styles.leftContent}>
                                    <span className={styles.emotionIcon}>✦</span>
                                    <p className={styles.emotionSummary}>{result.emotion_summary}</p>
                                </div>

                                <div className={styles.resetIconWrapper}
                                     onClick={handleSubmit}
                                     title="새로고침">
                                    <RotateCcw size={18} strokeWidth={2} className={styles.resetIcon}/>
                                </div>
                            </div>

                            <div className={styles.resultSubTitle}>
                                <div className={styles.emotionTags}>
                                    {result.emotion_tags?.map((tag, i) => (
                                        <span key={i} className={styles.emotionTag}>{tag}</span>
                                    ))}
                                </div>

                                <p className={styles.inputPreview}>
                                    <span className={styles.inputQuote}>" </span>
                                    {input}
                                    <span className={styles.inputQuote}> "</span>
                                </p>
                                <button type="button" onClick={handleReset} className={styles.backToMain}>
                                    다른 기분 입력하기
                                </button>
                            </div>
                        </motion.div>

                        <div className={styles.singleCardContainer}>
                            {result.playlist && (
                                // emoji prop 추가
                                <PlaylistCard playlist={result.playlist} index={0} emoji={result.emoji_3d} />
                            )}
                        </div>
                    </motion.div>
                )}

                {/* ── HISTORY PHASE (무드 트래커) ── */}
                {phase === 'history' && (
                    <motion.div
                        key="history"
                        className={styles.historyPhase}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        <MoodTracker onBack={() => setPhase('input')} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default App; // const 선언 방식으로 변경에 따른 export 방식