import { format, parseISO } from 'date-fns'
import enUS from 'date-fns/locale/en-US';
import { GetStaticProps } from 'next';
import { GetStaticPaths } from 'next';
import Head from 'next/Head'
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { usePlayer } from '../../contexts/PlayerContext';
import { api } from '../../services/api'
import { convertDurationToTime } from '../../utils/convertDurationToTime';

import styles from './episode.module.scss'

type Episode = {
    id: string;
    title: string;
    members: string;
    thumbnail: string;
    publishedAt: string;
    duration: number;
    durationString: string;
    description: string;
    url: string;
}

type EpisodeProps = {
    episode: Episode
}

export default function Episode({ episode }: EpisodeProps) {
    const { play } = usePlayer();

    return (
        <div className={styles.episode}>
            <Head>
                <title>{episode.title} | Podcastr</title>
            </Head>

            <div className={styles.thumbnailContainer}>
                <Link href="/">
                    <button type="button">
                        <img src="/arrow-left.svg" alt="Back" />
                    </button>
                </Link>
                <Image
                    width={1000}
                    height={200}
                    src={episode.thumbnail}
                    objectFit="cover" />
                <button type="button" onClick={() => play(episode)}>
                    <img src="/play.svg" alt="Play Episode" />
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationString}</span>
            </header>

            <div className={styles.description}
                dangerouslySetInnerHTML={{ __html: episode.description }}>
            </div>
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    const { data } = await api.get('episodes?', {
        params: {
            _limit: 2,
            _sort: 'published_at',
            _order: 'desc'
        }
    })

    const paths = data.map(episode => {
        return {
            params: {
                slug: episode.id
            }
        }
    })

    return {
        paths,
        fallback: 'blocking'
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
    const { slug } = ctx.params;

    const { data } = await api.get(`episodes/${slug}`)

    const episode = {
        id: data.id,
        title: data.title,
        members: data.members,
        thumbnail: data.thumbnail,
        publishedAt: format(parseISO(data.published_at), 'MMM d, yy ', { locale: enUS }),
        duration: Number(data.file.duration),
        durationString: convertDurationToTime(Number(data.file.duration)),
        description: data.description,
        url: data.file.url
    }

    return {
        props: {
            episode
        },
        revalidate: 60 * 60 * 24 // 24 hours
    }
}