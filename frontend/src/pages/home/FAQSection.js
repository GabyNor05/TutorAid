import React, { useState } from "react";

const faqs = [
	{
		question: "How do I book a lesson?",
		answer: "Log in to your account, go to the dashboard, and click 'Book Lesson'. Choose your tutor and preferred time slot.",
	},
	{
		question: "Can I view my progress notes?",
		answer:
			"Yes! Progress notes are available upon request. Go to the 'Request Form' page and submit your progress note request for an Admin to publish it. After it has been published, you will be notified.",
	},
	{
		question: "How do I contact my tutor?",
		answer: "You can message your tutor directly from your dashboard or via the lesson details page.",
	},
	{
		question: "What payment methods are accepted?",
		answer: "We accept EFT, credit/debit cards, and selected mobile payment options.",
	},
	{
		question: "How do I reset my password?",
		answer: "Click 'Forgot Password' on the login page and follow the instructions to reset your password.",
	},
	{
		question: "How may I request for a new Subject?",
		answer: "Go to the 'Request Form' page and submit your subject request for review.",
	},
	{
		question: "How do I update my profile information?",
		answer: "Go to your profile page and click 'Edit Profile' to update your information.",
	},
];

function FAQSection() {
	const [openIndex, setOpenIndex] = useState(null);
	const toggleFAQ = (idx) => setOpenIndex(openIndex === idx ? null : idx);

	return (
		<section className="mx-auto my-8 sm:my-12 max-w-2xl sm:max-w-3xl lg:max-w-4xl px-4 sm:px-6">
			<div className="bg-white rounded-lg shadow p-4 sm:p-6">
				<div className="space-y-3 sm:space-y-4">
					{faqs.map((faq, idx) => {
						const open = openIndex === idx;
						return (
							<div key={idx} className="border-b pb-3">
								<button
									className="w-full text-left font-semibold text-cyan-700 focus:outline-none flex justify-between items-center"
									onClick={() => toggleFAQ(idx)}
									aria-expanded={open}
									aria-controls={`faq-panel-${idx}`}
								>
									<span className="pr-3">{faq.question}</span>
									<span className="ml-2 text-xl leading-none select-none">
										{open ? "−" : "+"}
									</span>
								</button>
								{open && (
									<p
										id={`faq-panel-${idx}`}
										className="mt-2 text-gray-700 text-sm sm:text-base"
									>
										{faq.answer}
									</p>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

export default FAQSection;