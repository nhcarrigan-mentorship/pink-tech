import type { UserProfile } from "../types/UserProfile";

export const profiles: UserProfile[] = [
  {
    id: crypto.randomUUID(),
    displayName: "Dr. Amara Johnson",
    username: "amarajohnson",
    featured: true,
    lastUpdated: new Date().toISOString(),
    image:
      "https://images.unsplash.com/photo-1562935345-5080389daccd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvbWFuJTIwZXhlY3V0aXZlfGVufDF8fHx8MTc2ODgwNTIzMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    bio: "Pioneering artificial intelligence research with a focus on ethical AI development and implementation in healthcare technology.",
    role: "Chief AI Officer",
    company: "TechVision AI",
    location: "San Francisco, CA",
    website: "#",
    linkedin: "#",
    github: "#",
    expertise: [
      "Artificial Intelligence",
      "Machine Learning",
      "Healthcare Tech",
      "Ethics in AI",
    ],
    content: `# Dr. Amara Johnson

**Dr. Amara Johnson** (born March 15, 1992) is an American computer scientist and entrepreneur, currently serving as the Chief AI Officer at TechVision AI. She is widely recognized for her pioneering work in ethical artificial intelligence and healthcare technology.

## Early Life and Education

Johnson was born in Oakland, California, to a family of educators. She showed an early aptitude for mathematics and computer science, building her first neural network simulator at age 16. She earned her B.S. in Computer Science from Stanford University in 2014, where she graduated summa cum laude.

Johnson completed her Ph.D. in Artificial Intelligence at MIT in 2019, under the supervision of Professor Regina Barzilay. Her doctoral dissertation, "Ethical Frameworks for Medical AI Systems," received the ACM Doctoral Dissertation Award and laid the groundwork for her future career.

## Career

### Early Career (2019-2021)

After completing her doctorate, Johnson joined Google Brain as a Research Scientist, where she worked on natural language processing and computer vision applications. During this period, she co-authored several influential papers on bias detection in machine learning models.

### TechVision AI (2021-Present)

In 2021, Johnson joined TechVision AI as Director of AI Research. She was promoted to Chief AI Officer in 2023, making her one of the youngest executives in the company's history. Under her leadership, the company developed MediScan AI, a diagnostic tool now used in over 500 hospitals worldwide.

## Major Achievements

Johnson has published over 50 peer-reviewed papers in top-tier conferences including NeurIPS, ICML, and CVPR. Her research focuses on:
- Ethical AI development and deployment
- Medical imaging analysis using deep learning
- Bias detection and mitigation in AI systems
- Interpretable machine learning for healthcare

### Recognition and Awards

- **Forbes 30 Under 30** in Technology (2023)
- **ACM Doctoral Dissertation Award** (2020)
- **MIT Technology Review's 35 Innovators Under 35** (2024)
- **TED Speaker** on AI Ethics (2024)

## Impact and Legacy

Johnson is a vocal advocate for increasing diversity in AI research and has mentored over 100 women and underrepresented minorities in technology. She serves on the advisory board of AI4ALL and regularly speaks at universities about careers in AI.

Her work on ethical AI frameworks has been adopted by several Fortune 500 companies and cited in policy discussions at the national level. The MediScan AI system she led has helped diagnose over 2 million patients, with a diagnostic accuracy rate exceeding traditional methods by 15%.

## Personal Life

Johnson is based in San Francisco and serves on the board of several nonprofit organizations focused on STEM education. She is an avid runner and has completed five marathons.`,
  },
];
