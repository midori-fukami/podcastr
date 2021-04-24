import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import { usePlayer } from '../../contexts/PlayerContext';

import styles from './styles.module.scss';
import { convertDurationToTime } from '../../utils/convertDurationToTime';

export function Player() {
    const audioRef = useRef<HTMLAudioElement>();
    const [progress, setProgress] = useState(0);

    const {
        episodeList,
        currentEpisodeIndex,
        isPlaying,
        togglePlay,
        setPlayingState,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious,
        toggleLoop,
        isLooping,
        toggleShuffle,
        isShuffling,
        clearPlayerState
    } = usePlayer()

    useEffect(() => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }
    }, [isPlaying])

    function setupProgressListener() {
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(audioRef.current.currentTime);
        })
    }

    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }

    function handleEpisodesEnded() {
        if (hasNext) {
            playNext();
        } else {
            clearPlayerState();
        }
    }

    const episode = episodeList[currentEpisodeIndex]

    return (
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="Playing now" />
                <strong>Now playing</strong>
            </header>

            { episode ? (
                <div className={styles.currentEpisode}>
                    <Image
                        width={592}
                        height={592}
                        src={episode.thumbnail}
                        objectFit="cover"
                    />
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>Select a podcast to listen</strong>
                </div>
            )}

            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTime(progress)}</span>
                    <div className={styles.slider}>
                        {episode ? (
                            <Slider
                                max={episode.duration}
                                onChange={handleSeek}
                                value={progress}
                                trackStyle={{ backgroundColor: '#04d361' }}
                                railStyle={{ backgroundColor: '#9f75ff' }}
                                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
                            />
                        )
                            : (
                                <div className={styles.emptySlider}></div>
                            )}
                    </div>
                    <span>{convertDurationToTime(episode?.duration ?? 0)}</span>
                </div>

                {episode && (
                    <audio
                        src={episode.url}
                        autoPlay
                        ref={audioRef}
                        loop={isLooping}
                        onEnded={handleEpisodesEnded}
                        onPlay={() => setPlayingState(true)}
                        onPause={() => setPlayingState(false)}
                        onLoadedMetadata={setupProgressListener}
                    />
                )}

                <div className={styles.buttons}>
                    <button
                        type="button"
                        disabled={!episode || episodeList.length === 1}
                        onClick={toggleShuffle}
                        className={isShuffling ? styles.isActive : ''}>
                        <img src="/shuffle.svg" alt="Shuffle" />
                    </button>
                    <button type="button"
                        disabled={!episode || !hasPrevious}
                        onClick={playPrevious}>
                        <img src="/play-previous.svg" alt="Previous" />
                    </button>
                    <button
                        type="button"
                        className={styles.playButton}
                        disabled={!episode}
                        onClick={togglePlay}>
                        {isPlaying
                            ? <img src="/pause.svg" alt="Pause" />
                            : <img src="/play.svg" alt="Play" />}
                    </button>
                    <button type="button"
                        disabled={!episode || !hasNext}
                        onClick={playNext}>
                        <img src="/play-next.svg" alt="Next" />
                    </button>
                    <button type="button"
                        disabled={!episode}
                        onClick={toggleLoop}
                        className={isLooping ? styles.isActive : ''}>
                        <img src="/repeat.svg" alt="Repeat" />
                    </button>
                </div>
            </footer>
        </div >
    );
}