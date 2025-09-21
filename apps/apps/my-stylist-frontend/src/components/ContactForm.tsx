"use client";

import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";

const ContactForm: React.FC = () => {
	const [submitted, setSubmitted] = useState(false);

	const [formData, setFormData] = useState({
		name: "",
		email: "",
		url: "",
		message: "",
	});

	const [errors, setErrors] = useState({
		name: "",
		email: "",
		url: "",
		message: "",
	});

	const validate = () => {
		const newErrors: typeof errors = {
			name: "",
			email: "",
			url: "",
			message: "",
		};

		if (!formData.name.trim()) newErrors.name = "Ihr Name ist erforderlich.";
		if (
			!formData.email.trim() ||
			!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
		) {
			newErrors.email = "Eine gültige E-Mail-Adresse ist erforderlich.";
		}
		if (!formData.message.trim())
			newErrors.message = "Sie müssen uns etwas über Ihren Salon erzählen.";

		setErrors(newErrors);
		return Object.values(newErrors).every((error) => !error);
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (validate()) {
			alert(
				"Vielen Dank für Ihre Nachricht! Wir werden uns in Kürze bei Ihnen melden."
			);
			setSubmitted(true);
		}
	};

	return (
		<AnimatePresence mode="wait">
			{!submitted ? (
				<motion.form
					key="form"
					layoutId="form"
					onSubmit={handleSubmit}
					exit={{ opacity: 0 }}
					className="space-y-4"
				>
					<div className="my-4">
						<label
							htmlFor="name"
							className="text-xl font-semibold text-gray-700"
						>
							Name *
						</label>
						<input
							type="text"
							id="name"
							name="name"
							value={formData.name}
							onChange={handleChange}
							placeholder="Ihr vollständiger Name"
							className="mt-1 p-3 text-lg w-full border border-primary-dark/30 rounded-md shadow-sm text-gray-700"
						/>
						{errors.name && (
							<p className="text-red-500 text-sm mt-1">{errors.name}</p>
						)}
					</div>

					<div className="my-4">
						<label
							htmlFor="email"
							className="text-xl font-semibold text-gray-700"
						>
							E-Mail Adresse *
						</label>
						<input
							type="email"
							id="email"
							name="email"
							placeholder="Ihre E-Mail Adresse"
							value={formData.email}
							onChange={handleChange}
							className="mt-1 p-3 text-lg w-full border border-primary-dark/30 rounded-md shadow-sm focus:border-primary text-gray-700"
						/>
						{errors.email && (
							<p className="text-red-500 text-sm mt-1">{errors.email}</p>
						)}
					</div>

					<div className="my-4">
						<label
							htmlFor="url"
							className="text-xl font-semibold text-gray-700"
						>
							Aktuelle Website
						</label>
						<input
							type="url"
							id="url"
							name="url"
							placeholder="Die URL Ihrer aktuellen Website falls vorhanden"
							value={formData.url}
							onChange={handleChange}
							className="mt-1 p-3 text-lg w-full border border-primary-dark/30 rounded-md shadow-sm text-gray-700"
						/>
						{errors.url && (
							<p className="text-red-500 text-sm mt-1">{errors.url}</p>
						)}
					</div>

					<div className="my-4">
						<label
							htmlFor="message"
							className="text-xl font-semibold text-gray-700"
						>
							Nachricht *
						</label>
						<textarea
							id="message"
							name="message"
							value={formData.message}
							onChange={handleChange}
							placeholder="Erzählen Sie uns mehr über Ihren Salon und wie wir Ihnen helfen können..."
							className="mt-1 p-3 text-lg w-full border border-primary-dark/30 rounded-md shadow-sm text-gray-700 min-h-[150px]"
						/>
						{errors.message && (
							<p className="text-red-500 text-sm mt-1">{errors.message}</p>
						)}
					</div>

					<div>
						<button
							type="submit"
							className="w-full bg-primary-dark text-white text-lg py-3 px-8 rounded-md hover:bg-primary"
						>
							Absenden
						</button>
					</div>
				</motion.form>
			) : (
				<motion.div
					key="result"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className="text-center"
				>
					<h2 className="text-2xl font-bold text-gray-800">Danke!</h2>
					<p className="text-gray-600">
						Ihre Nachricht wurde erfolgreich gesendet.
					</p>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default ContactForm;
