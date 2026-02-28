import { motion } from 'framer-motion';
import styles from './Loading.module.css';

export default function Loading() {
    return (
        <motion.div
            className={styles.wrapper}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className={styles.visualizer}>
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={styles.bar}
                        animate={{
                            scaleY: [0.3, 1.5, 0.3],
                            opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: i * 0.12,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </div>

            <motion.p
                className={styles.message}
                key={0}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
                당신의 감성을 분석하는 중...
            </motion.p>
        </motion.div>
    );
}
