import { FaqItem } from '../types';

export const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Do you ship across Nepal?',
    answer:
      'Yes. We deliver to all major cities and districts via our logistics partners, including Kathmandu, Pokhara, Biratpur, and Chitwan. Remote locations may take an extra day or two.',
    category: 'Shipping',
  },
  {
    id: 'faq-2',
    question: 'What payment methods do you accept?',
    answer:
      'We accept major credit/debit cards, eSewa, Khalti, bank transfer, and Cash on Delivery (COD) for orders below Rs. 50,000.',
    category: 'Payments',
  },
  {
    id: 'faq-3',
    question: 'Are the components genuine and warrantied?',
    answer:
      'All products sold by verified vendors on Circuit Bazaar come with the manufacturer\'s full warranty. We offer a 7-day return policy for dead-on-arrival items.',
    category: 'Warranty',
  },
  {
    id: 'faq-4',
    question: 'How can I track my order?',
    answer:
      'Once your order ships, we email you a tracking number and update the status in your Account > My Orders page in real time.',
    category: 'Orders',
  },
  {
    id: 'faq-5',
    question: 'Can I cancel or change my order after placing it?',
    answer:
      'Orders can be cancelled free of charge within 2 hours of placement, provided they have not yet entered the processing stage. Contact support with your order number.',
    category: 'Orders',
  },
  {
    id: 'faq-6',
    question: 'Do you offer bulk pricing for teams and institutions?',
    answer:
      'Yes. Reach out to our B2B team at biz@circuitbazaar.com for volume discounts, pro-forma invoices, and institutional procurement.',
    category: 'Business',
  },
];

export const FAQ_CATEGORIES = ['All', 'Shipping', 'Payments', 'Warranty', 'Orders', 'Business'];

export type { FaqItem };
