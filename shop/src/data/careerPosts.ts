import { CareerPost } from '../types';

export const CAREER_POSTS: CareerPost[] = [
  {
    id: 'career-1',
    slug: 'frontend-engineer',
    title: 'Frontend Engineer (React/Next.js)',
    department: 'Engineering',
    location: 'Kathmandu (Hybrid)',
    type: 'Full-time',
    level: 'Mid / Senior',
    description:
      'Build delightful storefront experiences for thousands of Nepali hardware enthusiasts. You will work closely with designers and backend engineers to ship fast, accessible, and conversion-focused features.',
    requirements: [
      '3+ years building production React applications',
      'Strong TypeScript and Next.js App Router experience',
      'Experience with Tailwind CSS and performance optimization',
      'Understanding of e-commerce flows (cart, checkout, payments)',
    ],
    responsibilities: [
      'Implement pixel-perfect, responsive UI components',
      'Optimize Core Web Vitals and real-world performance',
      'Collaborate on the design system and reusable primitives',
      'Write maintainable, tested code with the team',
    ],
    postedAt: '2026-08-20',
  },
  {
    id: 'career-2',
    slug: 'devops-engineer',
    title: 'DevOps / SRE Engineer',
    department: 'Platform',
    location: 'Kathmandu (Remote-friendly)',
    type: 'Full-time',
    level: 'Senior',
    description:
      'Keep our services up, fast, and secure. Own the infrastructure that powers Circuit Bazaar\'s marketplace, vendor portal, and logistics pipelines.',
    requirements: [
      'Experience with Docker, Kubernetes, and cloud providers',
      'Strong grasp of networking, security, and observability',
      'Experience with CI/CD pipelines and infrastructure-as-code',
    ],
    responsibilities: [
      'Design and maintain scalable, observable infrastructure',
      'Implement monitoring, alerting, and incident response',
      'Automate deployments and disaster recovery procedures',
    ],
    postedAt: '2026-08-15',
  },
  {
    id: 'career-3',
    slug: 'customer-success-associate',
    title: 'Customer Success Associate',
    department: 'Operations',
    location: 'Kathmandu',
    type: 'Full-time',
    level: 'Entry / Junior',
    description:
      'Be the voice our customers love. Support buyers and vendors through chat, phone, and email, resolving orders, payments, and trust issues.',
    requirements: [
      'Excellent written and verbal communication (English/Nepali)',
      'Empathy and patience when handling customer issues',
      'Basic understanding of computer hardware is a plus',
    ],
    responsibilities: [
      'Respond to customer inquiries within SLA',
      'Troubleshoot order, payment, and vendor issues',
      'Document common issues to improve self-service',
    ],
    postedAt: '2026-08-01',
  },
];

export type { CareerPost };
