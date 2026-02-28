import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ListMusic, Calendar, Play } from 'lucide-react';
import styles from './PlaylistCard.module.css';

export default function PlaylistCard({ playlist, index }) {
    const [albumArts, setAlbumArts] = useState({});

    // AI가 반환한 색상 사용 (데이터가 없을 경우를 대비한 기본값 설정)
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

    return (
        <motion.div
            className={styles.card}
            initial={{ opacity: 0, y: 20, background: '#121212' }}
            animate={{
                opacity: 1,
                y: 0,
                // 그라데이션에 AI가 추천한 배경색 적용
                background: `linear-gradient(135deg, ${bgColor} 0%, #121212 100%)`,
                borderColor: `${accentColor}4D` // 투명도 30% 적용
            }}
            transition={{
                delay: index * 0.1,
                background: { duration: 0.8 } // 배경색 변경 시 부드럽게 전환
            }}
        >
            <div className={styles.header}>
                {/* Vibe 태그에 강조색 배경 적용 */}
                <span
                    className={styles.vibeTag}
                    style={{ backgroundColor: accentColor }}
                >
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
                        const individualYoutubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(song.artist + ' ' + song.title)}`;
                        const artwork = albumArts[song.title] || `https://ui-avatars.com/api/?name=${encodeURIComponent(song.title)}&background=random`;

                        return (
                            <motion.div
                                key={i}
                                className={styles.songItem}
                                // 곡 리스트 테두리에 아주 연하게 강조색 적용
                                style={{ border: `1px solid ${accentColor}26` }}
                            >
                                <div className={styles.albumArtWrapper}>
                                    <img src={artwork} alt={song.title} className={styles.albumArt} />
                                    <a href={individualYoutubeUrl} target="_blank" rel="noopener noreferrer" className={styles.playOverlay}>
                                        <Play size={20} fill="white" />
                                    </a>
                                </div>

                                <div className={styles.songDetails}>
                                    <div className={styles.songMain}>
                                        <span className={styles.songTitle}>{song.title}</span>
                                        <span className={styles.artistName}>{song.artist}</span>
                                    </div>

                                    <div className={styles.songFooter}>
                                        <div className={styles.releaseDate}>
                                            <Calendar size={12} />
                                            <span>2024</span>
                                        </div>
                                        <a
                                            href={individualYoutubeUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={styles.linkIcon}
                                            style={{ color: accentColor }} // 아이콘을 강조색으로 변경
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}