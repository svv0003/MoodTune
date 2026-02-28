// src/components/PlaylistCard.jsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ListMusic, Calendar, Play, X, Download, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import styles from './PlaylistCard.module.css';

const PlaylistCard = ({ playlist, index, emoji, isHistoryView = false }) => {
    const [albumArts, setAlbumArts] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);
    const cardRef = useRef(null); // 이미지 캡처를 위한 ref

    const bgColor = playlist.background_color || '#1a1a2e';
    const accentColor = playlist.accent_color || '#e94560';

    useEffect(() => {
        const fetchAlbumArts = async () => {
            const newArts = {};
            // 히스토리 뷰에서는 상위 5곡만 로드하여 성능 최적화
            const songsToLoad = isHistoryView ? playlist.songs.slice(0, 5) : playlist.songs;

            await Promise.all(
                songsToLoad.map(async (song) => {
                    try {
                        const response = await fetch(
                            `https://itunes.apple.com/search?term=${encodeURIComponent(
                                song.artist + ' ' + song.title
                            )}&entity=song&limit=1`
                        );
                        const data = await response.json();
                        if (data.results && data.results[0]) {
                            newArts[song.title] = data.results[0].artworkUrl100.replace('100x100bb', '600x600bb');
                        }
                    } catch (error) {
                        console.error("아트웍 로드 실패:", error);
                    }
                })
            );
            setAlbumArts(newArts);
        };
        fetchAlbumArts();
    }, [playlist.songs, isHistoryView]);

    const getPlatformUrl = (platform, song) => {
        const query = encodeURIComponent(`${song.artist} ${song.title}`);
        switch (platform) {
            case 'youtube': return `https://www.youtube.com/results?search_query=${query}`;
            case 'spotify': return `https://open.spotify.com/search/${query}`;
            case 'melon': return `https://www.melon.com/search/total/index.htm?q=${query}`;
            default: return '#';
        }
    };

    const openModal = (song) => {
        if (isHistoryView) return; // 히스토리 뷰에서는 모달 비활성화
        setSelectedSong(song);
        setIsModalOpen(true);
    };

    // 이미지로 저장하는 함수
    const handleSaveImage = async () => {
        if (!cardRef.current) return;

        try {
            // 외부 이미지(앨범 아트) 로딩을 위한 useCORS 옵션 필수
            const canvas = await html2canvas(cardRef.current, {
                useCORS: true,
                backgroundColor: null, // 투명 배경 유지
                scale: 2, // 고해상도 다운로드
                logging: false,
            });

            const image = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = image;
            link.download = `MOODTUNE_${playlist.vibe}_${playlist.theme}.png`;
            link.click();
        } catch (error) {
            console.error("이미지 생성 실패:", error);
            alert("이미지 생성에 실패했습니다. 다시 시도해주세요.");
        }
    };

    // 히스토리 뷰일 때는 5곡만 표시
    const displayedSongs = isHistoryView ? playlist.songs.slice(0, 5) : playlist.songs;

    const cardVariants = {
        hidden: { opacity: 0, y: 20, background: '#121212' },
        visible: {
            opacity: 1,
            y: 0,
            background: `linear-gradient(135deg, ${bgColor} 0%, #121212 100%)`,
            borderColor: `${accentColor}4D`,
            transition: {
                delay: index * 0.1,
                background: { duration: 0.8 },
                y: { type: 'spring', stiffness: 100, damping: 15 }
            }
        }
    };

    return (
        <div className={`${styles.wrapper} ${isHistoryView ? styles.historyWrapper : ''}`}>
            {/* 상단 액션 버튼 영역 (히스토리 뷰가 아닐 때만 표시) */}
            {!isHistoryView && (
                <div className={styles.actionHeader}>
                    <button onClick={handleSaveImage} className={styles.saveBtn}>
                        <Download size={16} />
                        이미지로 저장
                    </button>
                    {/* 공유 기능은 Web Share API 등을 추가로 구현해야 함 */}
                    <button className={styles.shareBtn} onClick={() => alert('공유 기능은 준비 중입니다!')}>
                        <Share2 size={16} />
                        공유하기
                    </button>
                </div>
            )}

            <motion.div
                ref={cardRef} // 캡처 대상 지정
                className={`${styles.card} ${isHistoryView ? styles.historyCard : ''}`}
                initial="hidden"
                animate="visible"
                variants={cardVariants}
            >
                <div className={styles.header}>
                    <div className={styles.titleArea}>
                        <span className={styles.vibeTag} style={{ backgroundColor: accentColor }}>
                            #{playlist.vibe}
                        </span>
                        <h3 className={styles.theme}>{playlist.theme}</h3>
                    </div>
                    {/* AI가 생성한 3D 이모지 표시 영역 */}
                    {emoji && <div className={styles.emoji3d}>{emoji}</div>}
                </div>

                <p className={styles.description}>{playlist.description}</p>

                <div className={styles.songListContainer}>
                    <div className={styles.listHeader}>
                        <ListMusic size={16} />
                        <span>추천 큐레이션 ({displayedSongs.length}곡)</span>
                    </div>

                    <div className={styles.songGrid}>
                        {displayedSongs.map((song, i) => {
                            const artwork = albumArts[song.title] || `https://ui-avatars.com/api/?name=${encodeURIComponent(song.title)}&background=random`;

                            return (
                                <motion.div
                                    key={i}
                                    className={`${styles.songItem} ${isHistoryView ? styles.historySongItem : ''}`}
                                    style={{ border: `1px solid ${accentColor}26` }}
                                    onClick={() => openModal(song)}
                                    whileHover={!isHistoryView ? { translateX: 4, background: 'rgba(255, 255, 255, 0.1)' } : {}}
                                >
                                    <div className={styles.albumArtWrapper}>
                                        <img src={artwork} alt={song.title} className={styles.albumArt} crossOrigin="anonymous" /> {/* CORS 설정 추가 */}
                                        {!isHistoryView && (
                                            <div className={styles.playOverlay}>
                                                <Play size={20} fill="white" />
                                            </div>
                                        )}
                                    </div>

                                    <div className={styles.songDetails}>
                                        <div className={styles.songMain}>
                                            <span className={styles.songTitle}>{song.title}</span>
                                            <span className={styles.artistName}>{song.artist}</span>
                                        </div>

                                        {!isHistoryView && (
                                            <div className={styles.songFooter}>
                                                <div className={styles.releaseDate}>
                                                    <Calendar size={12} />
                                                    <span>{song.release_date}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* 캡처 시 워터마크 (선택사항) */}
                <div className={styles.watermark}>MOODTUNE ✦ AI Curated</div>
            </motion.div>

            {/* 플랫폼 선택 모달 (기존 코드 유지) */}
            <AnimatePresence>
                {isModalOpen && selectedSong && !isHistoryView && (
                    <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                        <motion.div
                            className={styles.modalContent}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className={styles.closeBtn} onClick={() => setIsModalOpen(false)}>
                                <X size={20} />
                            </button>

                            <h4>어디에서 감상할까요?</h4>
                            <p className={styles.modalSongInfo}>{selectedSong.artist} - {selectedSong.title}</p>


                            <div className={styles.platformGrid}>
                                <a href={getPlatformUrl('youtube', selectedSong)} target="_blank" rel="noopener noreferrer" className={styles.platformItem}>
                                    <div className={`${styles.iconBox} ${styles.youtube}`}>
                                        <img src="https://simpleicons.org/icons/youtube.svg" alt="YouTube" className={styles.brandIcon} />
                                    </div>
                                    <span>YouTube</span>
                                </a>

                                <a href={getPlatformUrl('spotify', selectedSong)} target="_blank" rel="noopener noreferrer" className={styles.platformItem}>
                                    <div className={`${styles.iconBox} ${styles.spotify}`}>
                                        <img src="https://simpleicons.org/icons/spotify.svg" alt="Spotify" className={styles.brandIcon} />
                                    </div>
                                    <span>Spotify</span>
                                </a>

                                <a href={getPlatformUrl('melon', selectedSong)} target="_blank" rel="noopener noreferrer" className={styles.platformItem}>
                                    <div className={`${styles.iconBox} ${styles.melon}`}>
                                        <img src="/images/Frame%201-3.svg" alt="Melon" className={`${styles.brandIcon} ${styles.melonIcon}`}/>
                                    </div>
                                    <span>Melon</span>
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PlaylistCard;
