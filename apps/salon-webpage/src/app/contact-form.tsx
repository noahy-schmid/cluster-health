"use client";

import FormField from "@/components/form-field";
import { Send } from "lucide-react";

export default function ContactForm() {
  return (
    <div className="max-w-5xl bg-bg mx-auto rounded-xl my-10 shadow-lg shadow-black/20 inset-shadow-sm inset-shadow-fg/20 p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
      <div>
        <h2 className="text-xl font-semibold text-fg">Jetzt Kontaktieren</h2>
        <FormField
          label="Name"
          type="text"
          value=""
          onChange={() => undefined}
          placeholder="Name"
          required
        />
        <FormField
          label="E-Mail"
          type="email"
          value=""
          onChange={() => undefined}
          placeholder="E-Mail"
          required
        />
        <FormField
          label="Telefon"
          type="tel"
          value=""
          onChange={() => undefined}
          placeholder="Telefon"
        />
      </div>
      <div className="py-2">
        <textarea
          name="Message"
          id="message"
          placeholder="Nachricht"
          className="border-2 border-fg/20 focus:border-fg outline-none transition bg-bg-light rounded-lg text-lg p-3 focus:outline-fg text-fg w-full mb-2 inset-shadow-xs inset-shadow-bg-dark/20 h-full resize-none"
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
