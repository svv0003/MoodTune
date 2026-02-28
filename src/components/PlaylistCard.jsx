import { useState, useEffect } from 'react';
import {motion, AnimatePresence, px} from 'framer-motion';
import { ExternalLink, ListMusic, Calendar, Play, X } from 'lucide-react';
import styles from './PlaylistCard.module.css';

export default function PlaylistCard({ playlist, index }) {
    const [albumArts, setAlbumArts] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSong, setSelectedSong] = useState(null);

    const bgColor = playlist.background_color || '#1a1a2e';
    const accentColor = playlist.accent_color || '#e94560';

    useEffect(() => {
        const fetchAlbumArts = async () => {
            const newArts = {};
            await Promise.all(
                playlist.songs.map(async (song) => {
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
    }, [playlist.songs]);

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
        setSelectedSong(song);
        setIsModalOpen(true);
    };

    // 모바일 클릭 효과를 인지시키기 위한 딜레이 핸들러
    const handlePlatformClick = (e, platform, song) => {
        e.preventDefault();
        const url = getPlatformUrl(platform, song);
        setTimeout(() => {
            window.open(url, '_blank', 'noopener,noreferrer');
        }, 150);
    };

    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20, background: '#121212' }}
            animate={{
                opacity: 1,
                y: 0,
                background: `linear-gradient(135deg, ${bgColor} 0%, #121212 100%)`,
                borderColor: `${accentColor}4D`
            }}
            transition={{
                delay: index * 0.1,
                background: { duration: 0.8 }
            }}
        >
            <div className={styles.header}>
                <span className={styles.vibeTag} style={{ backgroundColor: accentColor }}>
                    {playlist.vibe}
                </span>
                <h3 className={styles.theme}>{playlist.theme}</h3>
            </div>

            <p className={styles.description}>{playlist.description}</p>

            <div className={styles.songListContainer}>
                <div className={styles.listHeader}>
                    <ListMusic size={16} />
                    <span>추천 큐레이션 (10곡)</span>
                </div>

                <div className={styles.songGrid}>
                    {playlist.songs.map((song, i) => {
                        const artwork = albumArts[song.title] || `https://ui-avatars.com/api/?name=${encodeURIComponent(song.title)}&background=random`;

                        return (
                            <motion.div
                                key={i}
                                className={styles.songItem}
                                style={{ border: `1px solid ${accentColor}26` }}
                                onClick={() => openModal(song)}
                            >
                                <div className={styles.albumArtWrapper}>
                                    <img src={artwork} alt={song.title} className={styles.albumArt} />
                                    <div className={styles.playOverlay}>
                                        <Play size={20} fill="white" />
                                    </div>
                                </div>

                                <div className={styles.songDetails}>
                                    <div className={styles.songMain}>
                                        <span className={styles.songTitle}>{song.title}</span>
                                        <span className={styles.artistName}>{song.artist}</span>
                                    </div>

                                    <div className={styles.songFooter}>
                                        <div className={styles.releaseDate}>
                                            <Calendar size={12} />
                                            <span>{song.release_date || '2024'}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* 플랫폼 선택 모달 */}
            <AnimatePresence>
                {isModalOpen && selectedSong && (
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
                                <a href={getPlatformUrl('youtube', selectedSong)}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className={styles.platformItem}>
                                    <div className={`${styles.iconBox} ${styles.youtube}`}>
                                        <img src="https://simpleicons.org/icons/youtube.svg" alt="YouTube" className={styles.brandIcon} />
                                    </div>
                                    <span>YouTube</span>
                                </a>

                                <a href={getPlatformUrl('spotify', selectedSong)}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className={styles.platformItem}>
                                    <div className={`${styles.iconBox} ${styles.spotify}`}>
                                        <img src="https://simpleicons.org/icons/spotify.svg" alt="Spotify" className={styles.brandIcon} />
                                    </div>
                                    <span>Spotify</span>
                                </a>

                                <a href={getPlatformUrl('melon', selectedSong)}
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   className={styles.platformItem}>
                                    <div className={`${styles.iconBox} ${styles.melon}`}>
                                        <img src="/images/Frame%201-3.svg"
                                             alt="Melon"
                                             className={`${styles.brandIcon} ${styles.melonIcon}`}/>
                                    </div>
                                    <span>Melon</span>
                                </a>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}