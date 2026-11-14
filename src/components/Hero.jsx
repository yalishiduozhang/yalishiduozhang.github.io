import React, { lazy, Suspense, useState } from "react";
import "../css/Hero.css";
import { FaGithub, FaLinkedin, FaOrcid } from "react-icons/fa";
import { FaGoogleScholar } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { RiInstagramFill } from "react-icons/ri";
import { TbBrandOpenai } from "react-icons/tb";
import { Camera, Sparkles, BrainCircuit, Layers3, Cpu, BookOpen } from "lucide-react";
import { useLocale } from "../locale";
const loadResumePreview = () => import("./ResumePreview");
const ResumePreview = lazy(loadResumePreview);

import mask from "../assets/portrait-mask.png";

const descriptionIcons = {
  brain: BrainCircuit, layers: Layers3, cpu: Cpu,
  openai: TbBrandOpenai,
  sparkles: Sparkles,
  camera: Camera,
};

const socialIcons = {
  openreview: BookOpen, orcid: FaOrcid, acl: BookOpen,
  email: MdEmail,
  github: FaGithub,
  scholar: FaGoogleScholar,
  linkedin: FaLinkedin,
  instagram: RiInstagramFill,
};

export default function Hero() {
  const { content: { hero }, ui } = useLocale();
  const [preview, setPreview] = useState(null);
  return (
    <div className="hero-grid"><div className="hero-left">
      <img src={hero.profileImage} alt={hero.name} className="profile-pic" style={{ maskImage: `url(${mask})`, maskMode: "luminance", maskSize: "100% 100%" }} draggable={false} fetchPriority="high" />
      <div className="hero-meta">
        <div className="meta-name">{hero.name} <span className="bilingual-name">{ui.secondaryName}</span></div><div>{hero.title}</div>
        <div className="meta-description">
          {hero.descriptions.map((item) => {
            const Icon = descriptionIcons[item.icon];
            return <div className="meta-description-row" key={item.text}>{Icon && <Icon aria-hidden="true" />}<span>{item.text}</span></div>;
          })}
        </div>
        <div className="meta-link">
          {hero.primaryLinks.map((link) => <a className="meta-linkitem" href={link.url} target="_blank" rel="noreferrer" key={link.label}
            aria-haspopup={link.preview === "pdf" ? "dialog" : undefined}
            onPointerEnter={() => { if (link.preview === "pdf") void loadResumePreview(); }}
            onFocus={() => { if (link.preview === "pdf") void loadResumePreview(); }}
            onClick={event => { if (link.preview === "pdf" && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey) { event.preventDefault(); setPreview(link); } }}>{link.label}</a>)}
        </div>
        <div className="contact-small">{hero.socialLinks.map((item) => {
          const Icon = socialIcons[item.icon];
          return <a key={item.label} aria-label={item.label} title={item.label} href={item.url} target="_blank" rel="noreferrer" className="icon-link">{Icon && <Icon />}</a>;
        })}</div>
        <div className="small-text">{ui.lastUpdated}</div>
      </div>
    </div>{preview && <Suspense fallback={null}><ResumePreview url={preview.url} name={hero.name} onClose={() => setPreview(null)} /></Suspense>}</div>
  );
}
