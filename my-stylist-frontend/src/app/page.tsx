import FeatureCard from "@/components/FeatureCard";
import Navigation from "../components/Navigation";
import Link from "next/link";
import ContactForm from "@/components/ContactForm";
import { LayoutGroup } from "motion/react";

export default function Home() {
	return (
		<div className="min-h-screen bg-white">
			<Navigation />

			{/* Main content with top padding to account for fixed navigation */}
			<main className="">
				{/* Hero Section */}
				<section
					id="hero"
					className="bg-gradient-to-br from-primary to-secondary text-white py-20 pt-40 h-dvh flex items-center px-10 md:px-40 text-center md:text-left"
				>
					<div>
						<h1 className="text-4xl md:text-5xl font-bold font-sans mb-6">
							Revolutionieren Sie Ihren Friseursalon mit
							<span className="text-highlight-strong">
								{" "}
								intelligenter Terminbuchung
							</span>
						</h1>
						<p className="text-xl mb-8 max-w-2xl">
							Professionelle Terminverwaltung speziell für Friseure. Akzeptieren
							Sie Online-Buchungen rund um die Uhr. Erweiteren Sie Ihre
							Kundenbasis und sparen Sie sich lästige Telefonbuchungen.
						</p>
						<Link
							href="#start"
							className="bg-primary-dark hover:bg-primary text-white px-8 py-3 rounded-md font-medium text-lg transition-colors duration-200 inline-block"
						>
							Jetzt kostenlos testen
						</Link>
					</div>
				</section>

				{/* Features Section */}
				<section id="features" className="py-20 bg-white">
					<div className="max-w-6xl mx-auto px-6">
						<h2 className="text-3xl md:text-4xl font-bold font-sans text-primary-dark mb-8 text-center">
							Bringen Sie ihren Salon auf das nächste Level
						</h2>
						<p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto">
							Mit unseren leistungsstarken Lösungen verbessern Sie das Erlebnis
							Ihrer Kunden und steigern gleichzeitig die Effizienz Ihres Salons.
						</p>
						<div className="grid md:grid-cols-3 gap-8">
							<FeatureCard
								icon={"fi fi-br-window-alt"}
								header={"Website"}
								content={
									"Hosten und Verwalten Sie Ihre Website mit Leichtigkeit. Erlauben Sie Kunden direkt über Ihre Website Termine zu buchen."
								}
							/>
							<FeatureCard
								icon={"fi fi-br-bell-ring"}
								header={"Erinnerungen"}
								content={
									"Minimieren Sie No-Shows mit automatisierten SMS- und E-Mail-Erinnerungen."
								}
							/>
							<FeatureCard
								icon={"fi fi-br-calendar-clock"}
								header={"Kalender"}
								content={
									"Behalten Sie Ihren Kalender jederzeit im Blick und verwalten Sie von überall Ihre Termine."
								}
							/>
						</div>
					</div>
				</section>

				{/* Time Savings Section */}
				<section className="py-20 bg-gray-50">
					<div className="max-w-6xl mx-auto px-6">
						<h2 className="text-3xl md:text-4xl font-bold font-sans text-primary-dark mb-8 text-center">
							Sparen Sie sich Zeit
						</h2>
						<p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto">
							Denn Ihre Zeit ist kostbar. Konzentrieren Sie sich auf das, was
							Sie am besten können - das Stylen Ihrer Kunden.
						</p>
						<div className="grid md:grid-cols-2 gap-8 mb-12">
							<div className="from-secondary to-primary bg-gradient-to-br rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center gap-6">
								<h1 className="text-5xl font-bold font-sans shrink-0">
									30 Min.
								</h1>
								<p className="text-gray-100 text-lg">
									Verbringen Friseure im Durchschnitt pro Tag mit der Verwaltung
									von Terminen.
								</p>
							</div>
							<div className="from-accent-1 to-accent-2 bg-gradient-to-br rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center gap-6">
								<h1 className="text-5xl font-bold font-sans shrink-0">
									5 Kunden
								</h1>
								<p className="text-gray-100 text-lg">
									Können Sie zusätzlich pro Woche bedienen indem Sie sich die
									Buchungszeit sparen.
								</p>
							</div>
						</div>
						<div className="text-center">
							<Link
								href="#start"
								className="bg-primary-dark hover:bg-primary text-white px-8 py-3 rounded-md font-medium text-lg transition-colors duration-200  mx-auto"
							>
								Fangen Sie jetzt an
							</Link>
						</div>
					</div>
				</section>

				{/* Pricing Section */}
				<section id="pricing" className="py-20 bg-white">
					<div className="max-w-6xl mx-auto px-6">
						<h2 className="text-3xl md:text-4xl font-bold font-sans text-primary-dark mb-8 text-center">
							Einfache transparente Preise
						</h2>
						<p className="text-lg text-gray-600 mb-12 text-center max-w-2xl mx-auto">
							Zahlen Sie nur für das, was Sie wirklich brauchen. Keine
							Versteckten Gebühren oder langfristigen Verträge. Und das Beste:
							Testen Sie uns 3 Monate kostenlos und unverbindlich.
						</p>
						<div className="grid md:grid-cols-2 gap-8">
							<div className="p-6 rounded-3xl border-2 border-secondary text-center shadow-2xl">
								<h3 className="text-3xl font-semibold text-primary-dark mb-4 text-center">
									Für alle Friseure
								</h3>
								<h4 className="text-6xl font-bold font-sans text-secondary">
									3 Monate <br />
									<span className="text-xl text-gray-600">
										kostenlos testen
									</span>
								</h4>
								<ul className="text-lg text-gray-700 my-6 px-6">
									<li className="border-b border-gray-300 py-4">
										Volle Funktionalität
									</li>
									<li className="border-b border-gray-300 py-4">
										Eigene Website
									</li>
									<li className="border-b border-gray-300 py-4">
										Unbegrenzte Buchungen
									</li>
									<li className="py-4">Keine Zahlungsdaten erforderlich</li>
								</ul>
								<div className="my-10">
									<Link
										href="#start"
										className="bg-primary-dark hover:bg-primary text-white px-8 py-3 rounded-md font-medium text-lg transition-colors duration-200"
									>
										Jetzt kostenlos testen
									</Link>
								</div>
							</div>
							<div className="p-6 rounded-3xl text-center shadow-lg">
								<h3 className="text-3xl font-semibold text-primary-dark mb-4 text-center">
									Nach der Testphase
								</h3>
								<h4 className="text-6xl font-bold font-sans text-accent-1">
									20 Cent <br />
									<span className="text-xl text-gray-600">pro Buchung</span>
								</h4>
								<ul className="text-lg text-gray-700 mt-6 px-6">
									<li className="border-b border-gray-300 py-4">
										Keine Mindestgebühr
									</li>
									<li className="border-b border-gray-300 py-4">
										Keine Zahlung für Stornierungen
									</li>
									<li className="border-b border-gray-300 py-4">
										Keine Zahlung für Umbuchungen
									</li>
									<li className="py-4">Jederzeit kündbar</li>
								</ul>
								<div className="my-10">
									<Link
										href="#contact"
										className="bg-primary-dark hover:bg-primary text-white px-8 py-3 rounded-md font-medium text-lg transition-colors duration-200"
									>
										Mehr erfahren
									</Link>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* How It Works Section */}
				<section id="start" className="px-6 md:px-20 py-20 bg-gray-50">
					<div className="max-w-6xl mx-auto bg-white rounded-2xl p-6">
						<h2 className="text-3xl md:text-4xl font-bold font-sans text-primary-dark mb-8 text-center">
							So einfach geht es
						</h2>
						<div className="grid md:grid-cols-3 gap-8">
							<div className="flex flex-col items-center text-center">
								<div className="rounded-full from-accent-1 to-accent-2 bg-gradient-to-br text-white font-bold text-lg p-3 aspect-square">
									1
								</div>
								<h4 className="font-sans text-2xl font-bold text-primary-dark mt-4">
									Anfrage senden
								</h4>
								<p className="text-gray-600 text-lg mt-2">
									Füllen Sie das Kontaktformular aus und teilen Sie uns Ihre
									Bedürfnisse mit.
								</p>
							</div>
							<div className="flex flex-col items-center text-center">
								<div className="rounded-full from-accent-1 to-accent-2 bg-gradient-to-br text-white font-bold text-lg p-3 aspect-square">
									2
								</div>
								<h4 className="font-sans text-2xl font-bold text-primary-dark mt-4">
									Persönliche Kontaktaufnahme
								</h4>
								<p className="text-gray-600 text-lg mt-2">
									Wir kontaktieren Sie direkt, um alles für Ihren Salon
									einzurichten.
								</p>
							</div>
							<div className="flex flex-col items-center text-center">
								<div className="rounded-full from-accent-1 to-accent-2 bg-gradient-to-br text-white font-bold text-lg p-3 aspect-square">
									3
								</div>
								<h4 className="font-sans text-2xl font-bold text-primary-dark mt-4">
									Sofort loslegen
								</h4>
								<p className="text-gray-600 text-lg mt-2">
									Nach der Einrichtung können Sie sofort mit der
									Terminverwaltung beginnen.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Contact Form Section */}
				<section
					id="contact"
					className="py-20 bg-gradient-to-br from-accent-2 to-accent-1 px-6"
				>
					<h2 className="text-3xl md:text-4xl font-bold font-sans text-white mb-8 text-center">
						Jetzt Starten
					</h2>
					<p className="text-lg text-gray-200 mb-12 text-center max-w-2xl mx-auto">
						Füllen Sie das Formular aus und wir kontaktieren Sie um alles
						einzurichten.
					</p>

					<div className="max-w-2xl mx-auto px-6 bg-white rounded-2xl p-10 shadow-2xl">
						<ContactForm />
					</div>
				</section>
			</main>

			{/* Footer */}
			<footer className="bg-gray-100 py-6">
				<div className="max-w-6xl mx-auto px-6 text-center text-gray-600">
					&copy; {new Date().getFullYear()} Mein Stylist. Alle Rechte
					vorbehalten.
				</div>
			</footer>
		</div>
	);
}
