"use client";

import { Send } from "lucide-react";

export default function ContactForm() {
  return (
    <div className="max-w-5xl bg-bg mx-auto rounded-xl my-10 shadow-lg shadow-black/20 inset-shadow-md inset-shadow-fg/20 p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <h2 className="text-xl font-semibold text-fg">Jetzt Kontaktieren</h2>
        <input
          type="text"
          name="Name"
          id="name"
          placeholder="Name *"
          className="bg-bg-light rounded-lg text-lg p-2 focus:outline-fg text-fg block w-full my-2 inset-shadow-sm inset-shadow-bg-dark/20"
        />
        <input
          type="email"
          name="E-Mail"
          id="email"
          placeholder="E-Mail *"
          className="bg-bg-light rounded-lg text-lg p-2 focus:outline-fg text-fg w-full my-2 inset-shadow-sm inset-shadow-bg-dark/20"
        />
        <input
          type="tel"
          name="Telefon"
          id="phone"
          placeholder="Telefon"
          className="bg-bg-light rounded-lg text-lg p-2 focus:outline-fg text-fg w-full my-2 inset-shadow-sm inset-shadow-bg-dark/20"
        />
      </div>
      <div className="py-2">
        <textarea
          name="Message"
          id="message"
          placeholder="Nachricht"
          className="bg-bg-light rounded-lg text-lg p-2 focus:outline-fg text-fg block w-full resize-none inset-shadow-sm inset-shadow-bg-dark/20 h-full"
        ></textarea>
      </div>
      <button
        type="button"
        className="bg-fg text-bg rounded-lg px-6 py-3 font-semibold shadow-lg shadow-bg-dark/20 hover:opacity-90 transition md:col-span-2 right-0 inset-shadow-sm inset-shadow-white cursor-pointer"
        onClick={() => {
          alert("Nachricht gesendet");
        }}
      >
        Nachricht senden
        <span>
          <Send className="inline ml-2" />
        </span>
      </button>
    </div>
  );
}
