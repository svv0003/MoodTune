// src/components/MoodTracker.jsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarDays } from 'lucide-react';
import PlaylistCard from './PlaylistCard';
import styles from './MoodTracker.module.css';

const MoodTracker = ({ onBack }) => {
    const [history, setHistory] = useState([]);
    const [selectedDateData, setSelectedDateData] = useState(null);

    useEffect(() => {
        // 로컬 스토리지에서 히스토리 불러오기
        const saved = JSON.parse(localStorage.getItem('moodHistory') || '[]');
        setHistory(saved);
    }, []);

    // 현재 달의 일 수 계산 (예시로 30일로 고정, 실제로는 현재 달에 맞게 계산 가능)
    const daysInMonth = 30;
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
        }
    };

    const getDayCircleStyle = (dayData) => {
        if (!dayData || dayData.length === 0) return { background: '#1e293b' }; // 데이터 없는 날 기본색

        const colors = dayData.map(item => item.playlist.accent_color).slice(0, 4); // 최대 4개 색상

        if (colors.length === 1) {
            return { background: colors[0] };
        } else {
            // 그라데이션 적용
            return { background: `linear-gradient(135deg, ${colors.join(', ')})` };
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button onClick={onBack} className={styles.backBtn}>
                    ← 다른 기분 입력하기
                </button>
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

            {/* 우측 슬라이드 패널 */}
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
                                    <p className={styles.savedTime}>
                                        {new Date(item.savedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <PlaylistCard playlist={item.playlist} emoji={item.emoji_3d} isHistoryView={true} />
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 패널 열렸을 때 오버레이 */}
            {selectedDateData && <div className={styles.overlay} onClick={() => setSelectedDateData(null)} />}
        </div>
    );
};

export default MoodTracker;