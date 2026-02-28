import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ListMusic, Calendar, Play } from 'lucide-react';
import styles from './PlaylistCard.module.css';

export default function PlaylistCard({ playlist, index }) {
    const [albumArts, setAlbumArts] = useState({});

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <div className={styles.header}>
                <span className={styles.vibeTag}>{playlist.vibe}</span>
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
                            <motion.div key={i} className={styles.songItem}>
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
                                            <span>{song.release_date || '2024'}</span>
                                        </div>
                                        <a href={individualYoutubeUrl} target="_blank" rel="noopener noreferrer" className={styles.linkIcon}>
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