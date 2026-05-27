// src/lib/portfolio-data.ts
import { PortfolioData } from './portfolio-types';

export const portfolioData: PortfolioData = {
  hero: {
    name: "Parinya Sawatdee",
    nickname: "Toey",
    title: "Full-Stack Developer & Cloud Engineer",
    headline: "Architecting edge-optimized cloud infrastructures and high-performance web applications with absolute technical control.",
    availability: "Open for Full-time (Remote / Hybrid)",
    resumeUrl: "/resume", 
  },
  metrics: [
    { label: "Projects Completed", value: "15+" },
    { label: "Cloud Latency Reduced", value: "40%" },
    { label: "Uptime Achieved", value: "99.9%" },
    { label: "Coding Experience", value: "2+ Years" }
  ],
  skills: [
    {
      category: "Languages",
      skills: ["TypeScript", "Python", "JavaScript", "HTML", "CSS"]
    },
    {
      category: "Frameworks & Developer Tools",
      skills: ["Next.js", "Node.js", "Vite", "Docker", "Git/GitHub"]
    },
    {
      category: "Cloud & DevOps (IaC)",
      skills: ["Amazon Web Services (AWS)", "Google Cloud", "Terraform", "GitHub Actions", "AWS SSM"]
    },
    {
      category: "Databases",
      skills: ["DynamoDB", "MongoDB"]
    },
    {
      category: "Networking & Systems",
      skills: ["TCP/IP", "DNS", "DHCP", "NAT", "VPN (WireGuard/IPsec)", "SSL/TLS", "Linux OS", "VMware", "Windows Server", "Wireshark", "Tailscale"]
    }
  ],
  experiences: [
    {
      company: "Cloud Infrastructure Project",
      role: "Lead Cloud Engineer",
      period: "Jan 2024 - Present",
      achievements: [
        "Architected a multi-region AWS environment using Terraform, reducing deployment lead time by 60%.",
        "Optimized global asset delivery via CloudFront edge locations, improving user load times by 40%.",
        "Implemented secure remote access using Tailscale and AWS SSM, eliminating the need for public SSH ports."
      ]
    },
    {
      company: "Web Development Lab",
      role: "Full-Stack Developer",
      period: "Jun 2022 - Dec 2023",
      achievements: [
        "Developed a custom Network Toolset with Next.js and TypeScript, aiding in rapid CIDR calculation and subnet planning.",
        "Integrated AWS DynamoDB for real-time state management, handling 1,000+ concurrent requests with sub-100ms latency.",
        "Engineered a responsive dashboard using Tailwind CSS and Radix UI, increasing mobile engagement by 25%."
      ]
    }
  ],
  projects: [
    {
      title: "myweb Infrastructure Dashboard (toey-sawatdee.me)",
      description: "A production-grade cloud monitoring and management platform built with a high-availability architecture and absolute infrastructure control.",
      techStack: [
        "AWS (EC2, CloudFront, Route 53, Cognito, API Gateway, Lambda, DynamoDB, SSM)",
        "Terraform",
        "Next.js (SSR)",
        "Docker",
        "GitHub Actions",
        "GHCR"
      ],
      githubUrl: "https://github.com/ttser123/toey-sawatdee",
      liveUrl: "https://toey-sawatdee.me",
      impact: "Architected 100% IaC environment with Zero-SSH secure CI/CD pipelines."
    }
  ],
  education: [
    {
      institution: "King Mongkut's Institute of Technology Ladkrabang",
      degree: "Bachelor of Engineering (Information Engineering)",
      period: "2019 - 2023",
      gpa: "3.20"
    }
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      date: "2024",
      url: "#"
    }
  ],
  contacts: [
    {
      platform: "Email",
      value: "parinya.zawatdee@gmail.com"
    },
    {
      platform: "LinkedIn",
      value: "https://www.linkedin.com/in/parinya-sawatdee"
    },
    {
      platform: "GitHub",
      value: "https://github.com/ttser123"
    },
    {
      platform: "YouTube",
      value: "https://www.youtube.com/@toeysawatdee"
    }
  ]
};
