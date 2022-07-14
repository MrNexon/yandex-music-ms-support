// ==UserScript==
// @name         Yandex Music Media Session API
// @namespace    https://mtdl.ru/
// @version      0.1
// @description  try to take over the world!
// @author       Belyakov Efim <belyakov.efim@gmail.com>
// @match        https://music.yandex.ru/*
// @exclude      https://music.yandex.ru/api/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const artworksArray = (baseUrl) => {
        const COVER_SIZES = [
            '30x30',
            '50x50',
            '80x80',
            '100x100',
            '200x200',
            '300x300',
            '400x400',
        ]
        return COVER_SIZES.map((size) => ({
            src: `${baseUrl}${size}`,
            sizes: size,
            type: 'image/png',
        }))
    }

    const updateMetadata = () => {
        const data = window.externalAPI.getCurrentTrack();
        if (!data) return;

        const title = data.title;
        const artists = data.artists.map(record => record.title);
        const album = data.album.title;

        const coverBase = `https://${data.cover.substring(0, data.cover.length - 2)}`;
        const artworks = artworksArray(coverBase);
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: title,
                artist: artists.join(', '),
                album: album,
                artwork: artworks
            });

            if (window.externalAPI.isPlaying()) navigator.mediaSession.playbackState = "playing";
            else navigator.mediaSession.playbackState = "paused";
        }
    }

    const updateProgress = () => {
        const progressData = window.externalAPI.getProgress();
        const speed = window.externalAPI.getSpeed();
        navigator.mediaSession.setPositionState({
            duration: progressData.duration,
            playbackRate: speed,
            position: progressData.position
        });
    }

    if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = "none";
        navigator.mediaSession.setActionHandler('play', function() { window.externalAPI.togglePause() });
        navigator.mediaSession.setActionHandler('pause', function() { window.externalAPI.togglePause() });
        navigator.mediaSession.setActionHandler('stop', function() { window.externalAPI.togglePause(true) });
        navigator.mediaSession.setActionHandler('seekbackward', function() { console.log('seekbackward') });
        navigator.mediaSession.setActionHandler('seekforward', function() { console.log('seekforward') });
        navigator.mediaSession.setActionHandler('seekto', function() { console.log('seekto') });
        navigator.mediaSession.setActionHandler('previoustrack', function() { window.externalAPI.prev() });
        navigator.mediaSession.setActionHandler('nexttrack', function() { window.externalAPI.next() });
        //navigator.mediaSession.setActionHandler('skipad', function() { console.log('skipad') });
    }

    window.externalAPI.on(window.externalAPI.EVENT_STATE, () => {
        updateMetadata();
    })

    window.externalAPI.on(window.externalAPI.EVENT_TRACK, () => {
        updateMetadata();
    })

    window.externalAPI.on(window.externalAPI.EVENT_PROGRESS, () => {
        updateProgress();
    })

    window.externalAPI.on(window.externalAPI.EVENT_SPEED, () => {
        updateProgress();
    })
})();
