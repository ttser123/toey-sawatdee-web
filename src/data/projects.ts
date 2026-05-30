// src/data/projects.ts

export interface ProjectSection {
  heading?: string;     // หัวข้อย่อย (เช่น "1. The Background Service Worker")
  body: string;         // เนื้อหา (ใช้ \n เพื่อขึ้นบรรทัดใหม่ได้)
  imageUrl?: string;    // รูปประกอบเฉพาะหัวข้อนี้ (ดึงจาก S3 / CloudFront)
}

export interface ProjectItem {
  id: string;
  title: string;
  category: 'System Architecture' | 'Web App' | 'Tooling' | 'Automation' | 'Automation & AI Generated Content';
  description: string;
  techStack: string[];
  imageUrl?: string; // S3 / CloudFront Image Location
  githubUrl?: string;
  liveUrl?: string;
  featured?: boolean;
  details?: {        // Detailed Case Study structure
    problem: string;
    solution: string;
    deepDive: ProjectSection[]; // 🛠️ Block-Based Deep Dive engine!
  };
}

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'env-tracker',
    title: 'Env-Tracker Diagnostic Suite',
    category: 'Tooling',
    description: 'In-Memory AST parser running fully client-side via Web Workers. Analyzes Next.js environment variable blast radius with zero network footprint.',
    techStack: ['Next.js', 'React Flow', 'ts-morph', 'Web Worker'],
    imageUrl: 'https://d3fs8bw8fuf5n4.cloudfront.net/assets/projects/ENV-Tracker/env-tracker-preview.webp', 
    githubUrl: 'https://github.com/ttser123/toey-sawatdee',
    liveUrl: '/tools/env-tracker',
    featured: false
  },
  {
    id: 'social-planner-automation-for-chrome',
    title: 'Extension: Social Planner And AI Automation for Chrome',
    category: 'Automation & AI Generated Content',
    description: 'A Manifest V3 automation extension for Google Flow. Features a Side Panel UI to manage workflows, sync events to Google Calendar, publish posts via Facebook Page, export media to Drive, and log data to Sheets.',
    techStack: ['TypeScript', 'Chrome Extension', 'Google Flow', 'Generative AI', 'Google OAuth2', 'Facebook Graph API'],
    imageUrl: 'https://d3fs8bw8fuf5n4.cloudfront.net/assets/projects/extension-social-planner/flow.webp',
    githubUrl: 'https://github.com/ttser123/social-planner-automation-for-chrome',
    featured: false,
    details: {
      problem: 'Manual social media planning, asset scheduling, and cross-platform content publishing are highly repetitive and time-consuming for content creators.',
      solution: 'A Manifest V3 web automation tool for the Google Flow platform. Integrates a Side Panel UI with secure Google OAuth2 to streamline multi-platform workflows—including Google Calendar scheduling, Facebook content automation, Drive asset exporting, and Sheets data logging.',
      deepDive: [
        {
          heading: "1. Robust Manifest V3 Web Automation & Asset Pipeline",
          body: "Engineered high-performance Content Scripts and an asynchronous Background Service Worker to automate complex batch AI-generation workflows on the Google Labs platform and Developed a seamless data pipeline that automatically captures generated media assets, extracts raw data, and streams them directly into Google Drive and Google Sheets APIs",
          imageUrl: "https://d3fs8bw8fuf5n4.cloudfront.net/assets/projects/extension-social-planner/1.webp"
        },
        {
          heading: "2. Non-Intrusive Multi-Platform Integration & Analytics Hub",
          body: "Leveraged the Chrome Side Panel API to build a streamlined, non-intrusive control interface that completely eliminates tab-switching and avoids host DOM distortion and Integrated secure Google OAuth2 and Facebook Graph API to orchestrate multi-page content publishing, schedule automated posts via Google Calendar, and sync real-time performance tracking onto a custom analytics dashboard",
            imageUrl: "https://d3fs8bw8fuf5n4.cloudfront.net/assets/projects/extension-social-planner/2.webp"
          },
          {
          heading: "3. End-to-End Automated Content Creation & Publishing Engine",
          body: "Automated the entire media creation lifecycle for content creators by transforming manual prompts into scalable, template-driven batch generations and Streamlined the publishing pipeline by utilizing AI to auto-generate engaging post captions and seamlessly queuing finalized assets directly to multi-platform social media schedules.",
            imageUrl: "https://d3fs8bw8fuf5n4.cloudfront.net/assets/projects/extension-social-planner/flow.webp"
          }
      ]
    }
  },
];
