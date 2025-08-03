"use client";

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';
const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const faqs = [{
    question: 'How do I get started with Aranya?',
    answer: 'Getting started is easy! Simply create an account, browse our course catalog, and enroll in any course that interests you. For creators, you can start building your course right away after signing up.'
  }, {
    question: 'Are the courses free?',
    answer: 'We offer both free and premium courses. Free courses provide access to basic content, while premium courses offer in-depth materials quizzes certificates, and direct instructor support.'
  }, {
    question: 'How do I create my own course?',
    answer: 'After signing up, navigate to the "Create" section in your dashboard. Our intuitive course builder allows you to add modules lessons quizzes, and multimedia content. You can preview your course before publishing it to our platform.'
  }, {
    question: 'Can I get a certificate after completing a course?',
    answer: "Yes! Upon completing all required modules and passing the final assessments, you' ll receive a shareable certificate that you can add to your resume or LinkedIn profile ., ':"
  }, {
    question: 'How do I track my progress in a course?',
    answer: 'Your progress is automatically tracked as you complete lessons and quizzes. You can view your progress on the course dashboard, which shows completed lessons, quiz scores, and overall course completion percentage.'
  }, {
    question: 'What kind of support is available if I have questions?',
    answer: 'We offer multiple support channels including a comprehensive help center, community forums where you can ask questions, and direct messaging with instructors for premium courses.'
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