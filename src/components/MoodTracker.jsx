// src/components/MoodTracker.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarDays, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import PlaylistCard from './PlaylistCard';
import styles from './MoodTracker.module.css';

const MoodTracker = ({ onBack }) => {
    const [history, setHistory] = useState([]);
    const [selectedDateData, setSelectedDateData] = useState(null);
    const [openToggles, setOpenToggles] = useState({});

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('moodHistory') || '[]');
        setHistory(saved);

        // 스크롤 막기 (모달 오픈 시 배경 고정용)
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    // 캘린더 생성 로직 (현재 달 기준 혹은 고정 28일)
    const daysInMonth = 31; // 예시로 31일 설정
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // 날짜별로 데이터 그룹화
    const groupedHistory = history.reduce((acc, item) => {
        const date = new Date(item.savedAt).getDate();
        if (!acc[date]) acc[date] = [];
        acc[date].push(item);
        return acc;
    }, {});

    const handleDayClick = (day) => {
        if (groupedHistory[day]) {
            setSelectedDateData({ day, playlists: groupedHistory[day] });
            setOpenToggles({}); // 새로운 날짜 클릭 시 토글 초기화
        }
    };

    const togglePlaylist = (idx) => {
        setOpenToggles(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };

    const getDayCircleStyle = (dayData) => {
        if (!dayData || dayData.length === 0) return { background: '#1e293b', opacity: 0.3 };

        const colors = dayData.map(item => item.playlist.accent_color).slice(0, 4);
        if (colors.length === 1) return { background: colors[0], boxShadow: `0 0 15px ${colors[0]}4D` };

        return {
            background: `linear-gradient(135deg, ${colors.join(', ')})`,
            boxShadow: `0 0 15px ${colors[0]}4D`
        };
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.titleWrapper}>
                        <CalendarDays size={22} className={styles.titleIcon} />
                        <h2>Mood Tracker</h2>
                    </div>
                    {/* App.jsx의 setIsHistoryOpen(false)를 실행함 */}
                    <button onClick={onBack} className={styles.closeBtnMain} title="닫기">
                        <X size={24} />
                    </button>
                </div>
                <p className={styles.subTitle}>이번 달 나의 감정 기록들을 확인해보세요.</p>
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
                            whileHover={dayData ? { scale: 1.1, y: -2 } : {}}
                            whileTap={dayData ? { scale: 0.95 } : {}}
                        >
                            <span className={styles.dayNumber}>{day}</span>
                            {dayData && <div className={styles.dotIndicator} />}
                        </motion.div>
                    );
                })}
            </div>

            {/* 상세 기록 사이드 패널 (Slide-in) */}
            <AnimatePresence>
                {selectedDateData && (
                    <motion.div
                        className={styles.slidePanel}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    >
                        <div className={styles.panelHeader}>
                            <h3>{selectedDateData.day}일의 기록 <span className={styles.count}>{selectedDateData.playlists.length}</span></h3>
                            <button className={styles.closeBtn} onClick={() => setSelectedDateData(null)}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className={styles.panelContent}>
                            {selectedDateData.playlists.map((item, idx) => (
                                <div key={idx} className={styles.historyCardWrapper}>
                                    <div
                                        className={`${styles.toggleHeader} ${openToggles[idx] ? styles.active : ''}`}
                                        onClick={() => togglePlaylist(idx)}
                                        style={{ borderLeft: `4px solid ${item.playlist.accent_color}` }}
                                    >
                                        <div className={styles.timeInfo}>
                                            <Clock size={14} />
                                            <span>{new Date(item.savedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className={styles.summaryInfo}>
                                            <span className={styles.vibeText}>#{item.playlist.vibe}</span>
                                            {openToggles[idx] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {openToggles[idx] && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className={styles.playlistInHistory}
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

            {/* 패널이 열렸을 때의 어두운 배경 */}
            <AnimatePresence>
                {selectedDateData && (
                    <motion.div
                        className={styles.overlay}
                        onClick={() => setSelectedDateData(null)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MoodTracker;