"use client";

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = [{
    question: 'How do I get started with Aranya?',
    answer: 'Getting started is easy! Simply connect your wallet, browse our course catalog, and enroll in any course that interests you. For creators, you can start building your course right away after connecting.'
  }, {
    question: 'How do I create my own course?',
    answer: 'Head to the "Teaching" tab on the "My Courses" page. Our intuitive course builder allows you to add modules lessons quizzes, and multimedia content. You can preview your course before publishing it to our platform.'
  }, {
    question: 'Can I get a certificate after completing a course?',
    answer: 'With Aranya you will mint a seed when you enroll in a course. This seed will grow into a tree when you progress through the course. After you complete the course you will have a mature tree in your on-chain wallet that serves as an easy-to-verify proof of your skill.'
  }, {
    question: 'How can I grow my reputation as a teacher?',
    answer: 'Your on-chain tree will grow as more learners complete your course. Showing off your on-chain forest of course trees will serve as easily verifiable proof to your skills as a teacher'
  }];
  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  return <div className="py-16 bg-stone-50">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-stone-800 sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-4 text-xl text-stone-600">
          Find answers to common questions about Aranya
        </p>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, index) => <div key={index} className="bg-white rounded-lg border border-stone-200 overflow-hidden">
          <button className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none" onClick={() => toggleFAQ(index)}>
            <span className="font-medium text-stone-800">
              {faq.question}
            </span>
            {openIndex === index ? <ChevronUpIcon className="h-5 w-5 text-amber-700" /> : <ChevronDownIcon className="h-5 w-5 text-amber-700" />}
          </button>
          {openIndex === index && <div className="px-6 pb-4 text-stone-600">{faq.answer}</div>}
        </div>)}
      </div>
    </div>
  </div>;
};
export default FAQSection;