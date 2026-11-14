import React, { useRef, useState } from "react";
import "../css/Projects.css";
import { ScanEye, Smartphone } from "lucide-react";
import { BsStars } from "react-icons/bs";
import { FaGithub } from "react-icons/fa";
import { SiHuggingface } from "react-icons/si";
import { TbPhotoSearch } from "react-icons/tb";
import { useLocale } from "../locale";
import DailyPapers from "./DailyPapers";
import useNearViewport from "../hooks/useNearViewport";

const actionDetails = {
  app: { label: "App", Icon: Smartphone },
  github: { label: "GitHub", Icon: FaGithub },
  demo: { label: "Demo", Icon: SiHuggingface },
};

const metaIcons = {
  XR: BsStars,
  "Intelligent Transportation": ScanEye,
  "Object Recommendation": TbPhotoSearch,
  "AI SEARCH": TbPhotoSearch,
};

function ProjectMedia({ project }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.play().catch(() => setIsPlaying(false));
  };

  const resetVideo = () => {
    if (!videoRef.current) return;
    videoRef.current.pause();
    videoRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  if (project.video) {
    return (
      <div className={`project-video-shell ${isPlaying ? "is-playing" : ""}`}
        onMouseEnter={playVideo} onMouseLeave={resetVideo} onFocus={playVideo} onBlur={resetVideo}>
        <video ref={videoRef} className="project-media" src={project.video} muted loop playsInline
          preload="none" onPlaying={() => setIsPlaying(true)} aria-label={`${project.title} preview`} />
        <img className="project-video-poster" src={project.image} alt={`${project.title} preview`} loading="lazy" decoding="async" />
      </div>
    );
  }

  return <img className="project-media" src={project.image} alt={`${project.title} preview`} loading="lazy" decoding="async" />;
}

function ProjectMediaFrame({ project }) {
  const [ref, visible] = useNearViewport();
  return (
    <div className="project-media-frame" ref={ref}>
      {visible && <>
        <img className="project-media-backdrop" src={project.image} alt="" aria-hidden="true" loading="lazy" decoding="async" />
        <ProjectMedia project={project} />
      </>}
    </div>
  );
}

function ProjectAction({ project }) {
  if (!project.link) return null;
  const { label, Icon } = actionDetails[project.action];
  const content = <><Icon size={14} aria-hidden="true" /><span>{label}</span></>;

  if (!project.link) {
    return <span className="project-link is-disabled" aria-disabled="true">{content}</span>;
  }

  return <a className="project-link" href={project.link} target="_blank" rel="noreferrer">{content}</a>;
}

function ProjectMeta({ meta }) {
  const Icon = metaIcons[meta];

  return (
    <span className="project-meta">
      {Icon && <Icon aria-hidden="true" />}
      <span>{meta}</span>
    </span>
  );
}

export default function Projects() {
  const { content: { projects }, ui } = useLocale();
  return (
    <section className="card projects-section" id="projects">
      <div className="card-title">{ui.projectTitle}</div>
      <div className="project-grid">
        {projects.map((project) => (
          <article className="project-card" key={project.title}>
            <ProjectMediaFrame project={project} />
            <div className="project-body">
              <ProjectMeta meta={project.meta} />
              <h3>{project.title}</h3>
              <p>{project.text}</p>
              {project.note && <div className="project-note">{project.note}</div>}
              <div className="project-actions">
                <ProjectAction project={project} />
              </div>
            </div>
          </article>
        ))}
      </div>
      <DailyPapers />
    </section>
  );
}
