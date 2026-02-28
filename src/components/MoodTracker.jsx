import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react'; // 아이콘 추가
import PlaylistCard from './PlaylistCard';
import styles from './MoodTracker.module.css';

const MoodTracker = ({ onBack }) => {
    const [history, setHistory] = useState([]);
    const [selectedDateData, setSelectedDateData] = useState(null);
    // 어떤 기록이 펼쳐져 있는지 관리하는 상태 (index 저장)
    const [openToggles, setOpenToggles] = useState({});

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('moodHistory') || '[]');
        setHistory(saved);
    }, []);

    const daysInMonth = 28;
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const groupedHistory = history.reduce((acc, item) => {
        const date = new Date(item.savedAt).getDate();
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
    }, {});

    const handleDayClick = (day) => {
        if (groupedHistory[day]) {
            setSelectedDateData({ day, playlists: groupedHistory[day] });
            setOpenToggles({}); // 패널 열릴 때 토글 상태 초기화
        }
    };

    const togglePlaylist = (idx) => {
        setOpenToggles(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };

    const getDayCircleStyle = (dayData) => {
        if (!dayData || dayData.length === 0) return { background: '#1e293b' };
        const colors = dayData.map(item => item.playlist.accent_color).slice(0, 4);
        if (colors.length === 1) return { background: colors[0] };
        return { background: `linear-gradient(135deg, ${colors.join(', ')})` };
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                {/*<button onClick={onBack} className={styles.backBtn}>*/}
                {/*    다른 기분 입력하기*/}
                {/*</button>*/}
                <div className={styles.titleWrapper}>
                    <CalendarDays size={24} className={styles.titleIcon} />
                    <h2>Mood Tracker</h2>
                </div>
                <p className={styles.subTitle}>이번 달 나의 감정 기록</p>
            </header>

            <div className={styles.calendarGrid}>
                {daysArray.map(day => {
                    const dayData = groupedHistory[day];
                    return (
                        <motion.div
                            key={day}
                            className={`${styles.dayCircle} ${dayData ? styles.hasData : ''}`}
                            style={getDayCircleStyle(dayData)}
                            onClick={() => handleDayClick(day)}
                            whileHover={dayData ? { scale: 1.1 } : {}}
                            whileTap={dayData ? { scale: 0.95 } : {}}
                        >
                            {day}
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {selectedDateData && (
                    <motion.div
                        className={styles.slidePanel}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                    >
                        <div className={styles.panelHeader}>
                            <h3>{selectedDateData.day}일의 감정 기록</h3>
                            <button className={styles.closeBtn} onClick={() => setSelectedDateData(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.panelContent}>
                            {selectedDateData.playlists.map((item, idx) => (
                                <div key={idx} className={styles.historyCardWrapper}>
                                    {/* 토글 버튼 역할을 하는 헤더 */}
                                    <div
                                        className={styles.toggleHeader}
                                        onClick={() => togglePlaylist(idx)}
                                    >
                                        <p className={styles.savedTime}>
                                            {new Date(item.savedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                            {/*<span className={styles.moodBadge}>추천 큐레이션 보기</span>*/}
                                        </p>
                                        {openToggles[idx] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>

                                    {/* 토글 애니메이션 영역 */}
                                    <AnimatePresence>
                                        {openToggles[idx] && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                                style={{ overflow: 'hidden' }}
                                            >
                                                <PlaylistCard
                                                    playlist={item.playlist}
                                                    emoji={item.emoji_3d}
                                                    isHistoryView={true}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedDateData && <div className={styles.overlay} onClick={() => setSelectedDateData(null)} />}
        </div>
    );
};

export default MoodTracker;