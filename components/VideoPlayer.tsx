"use client";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";

interface VideoPlayerProps {
  src: string;
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

const VideoPlayer = ({ src }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const changeSpeed = (newSpeed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = newSpeed;
    setSpeed(newSpeed);
  };

  const seek = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  };

  // ✅ متابعة الوقت والمدة
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const setVideoDuration = () => setDuration(video.duration);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", setVideoDuration);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", setVideoDuration);
    };
  }, []);

  // ✅ متابعة وضع fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // ✅ التحكم في شريط التقدم
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const newTime = Number(e.target.value);
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-3xl mx-auto bg-black"
    >
      {/* الفيديو */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full rounded-lg shadow"
      />

      {/* العلامة المائية */}
      <div className="absolute top-[50%] right-[50%] text-white pointer-events-none select-none">
        <Image src={"/logo.png"} width={40} height={40} alt="logo" />
      </div>

      {/* الكنترولز */}
      <div className="flex flex-col gap-2 p-2 bg-gray-800 text-white absolute bottom-2 left-2 right-2">
        {/* زر التكبير دائمًا موجود */}
        <div className="flex gap-4">
          <button onClick={toggleFullscreen}>⛶ تكبير</button>

          {/* باقي الكنترولز تظهر فقط في fullscreen */}
          {isFullscreen && (
            <>
              <button onClick={togglePlay}>
                {isPlaying ? "⏸️ إيقاف" : "▶️ تشغيل"}
              </button>
              <button onClick={toggleMute}>🔇 كتم/تشغيل الصوت</button>

              {/* السرعة */}
              <select
                value={speed}
                onChange={(e) => changeSpeed(Number(e.target.value))}
                className="bg-gray-700 text-white px-2 py-1 rounded"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>

              {/* أزرار التقديم والتأخير */}
              <button onClick={() => seek(-10)}>⏪ رجوع 10 ث</button>
              <button onClick={() => seek(10)}>⏩ تقديم 10 ث</button>
              <button onClick={() => seek(-30)}>⏪ رجوع 30 ث</button>
              <button onClick={() => seek(30)}>⏩ تقديم 30 ث</button>
            </>
          )}
        </div>

        {/* شريط التقدم + الوقت */}
        {isFullscreen && (
          <div className="flex items-center gap-2">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration}
              value={currentTime}
              onChange={handleProgressChange}
              className="flex-1"
            />
            <span>{formatTime(duration)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;
