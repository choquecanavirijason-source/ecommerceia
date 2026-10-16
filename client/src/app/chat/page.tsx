"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, MessageCircle, RefreshCw, Send, Sparkles, ArrowRight } from "lucide-react";
import { recommendAgents } from "@/application/agents/recommend";
import { agents } from "@/demo/agents";
import type { Agent } from "@/domain/entities/Agent";

interface ChatMessage {
  id: number;
  role: "assistant" | "user";
  text: string;
  agents?: Agent[];
  query?: string;
  total?: number;
}

const suggestions = [
  { label: "Ventas", text: "Necesito automatizar las ventas y captar leads" },
  { label: "Soporte", text: "Necesito responder consultas por WhatsApp" },
  { label: "Operaciones", text: "Quiero analizar datos y generar reportes" },
];

const WELCOME: ChatMessage = {
  id: 0,
  role: "assistant",
  text: "¡Hola! Soy el asesor de AGENTES.IA. Te ayudo a explorar nuestro catálogo de prueba y entender qué agente podría encajar en tu negocio.\n\n¿Qué tarea quieres mejorar y qué herramientas usas actualmente?\n\nLas capacidades e integraciones mostradas son ejemplos; todavía no ejecutamos agentes ni procesamos compras.",
};

function buildResponse(userText: string): Omit<ChatMessage, "id"> {
  const result = recommendAgents(agents, userText);
  if (result.items.length > 0) {
    const extra = result.total > result.items.length
      ? `\n\nEncontré ${result.total} agentes relacionados. Aquí tienes los primeros ${result.items.length}:`
      : `\n\nEncontré ${result.items.length} agente${result.items.length > 1 ? "s" : ""} que puede${result.items.length > 1 ? "n" : ""} ayudarte:`;
    return {
      role: "assistant",
      text: `Entendido, buscas algo relacionado con "${result.query}".${extra}`,
      agents: result.items,
      query: result.query,
      total: result.total,
    };
  }
  return {
    role: "assistant",
    text: "No encontré agentes que coincidan con esa descripción. Prueba con otras palabras como \"ventas\", \"soporte\", \"datos\", \"WhatsApp\" o \"Slack\".\n\nTambién puedes explorar el catálogo completo para ver todos los agentes disponibles en la demo.",
  };
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"ai" | "local">("ai");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<AbortController | null>(null);
  const nextId = useRef(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => () => pending.current?.abort(), []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => bottomRef.current?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    }));
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 800 || pending.current) return;

    const userMsg: ChatMessage = { id: nextId.current++, role: "user", text: trimmed };
    setError(null);
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    scrollToBottom();
    if (mode === "local") {
      setMessages(prev => [...prev, { id: nextId.current++, ...buildResponse(trimmed) }]);
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    setSending(true);
    try {
      const response = await fetch("/api/advisor/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ messages: [...messages.filter(m => m.id !== 0), userMsg].slice(-8)
          .map(m => ({ role: m.role, content: m.text })) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "El asesor no está disponible.");
      if (pending.current !== controller) return;
      setMessages(prev => [...prev, { id: nextId.current++, role: "assistant", text: data.text,
        agents: (data.agentSlugs as string[]).flatMap(slug => agents.find(a => a.slug === slug) ?? []),
      }]);
    } catch (cause) {
      if (controller.signal.aborted || pending.current !== controller) return;
      setError(cause instanceof Error && cause.message !== "Failed to fetch" ? cause.message : "No se pudo conectar con el asesor. Intenta nuevamente.");
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      setInput(trimmed);
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        setSending(false);
        scrollToBottom();
      }
    }
  }, [messages, mode, scrollToBottom]);

  const reset = useCallback(() => {
    pending.current?.abort();
    pending.current = null;
    setSending(false);
    setError(null);
    setMessages([WELCOME]);
    nextId.current = 1;
    setInput("");
    inputRef.current?.focus();
  }, []);

  return (
    <div className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-3xl flex-col px-4 py-8">
      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#42C7E8]/25 bg-[#42C7E8]/5 px-3 py-1.5 text-xs font-medium text-[#42C7E8]">
          <Sparkles size={14} aria-hidden="true" />
          {mode === "ai" ? "Asesor de agentes · IA" : "Exploración · Simulación local"}
        </div>
        <h1 className="text-2xl font-bold text-[#EAF2F8] sm:text-3xl">Chat guiado</h1>
        <p className="mt-2 text-sm text-[#91A7BC]">
          Describe tu necesidad y te recomiendo agentes del catálogo de demo.
          {mode === "ai" ? "Tus mensajes y el catálogo se envían a OpenRouter y al proveedor del modelo. No compartas datos sensibles."
            : "Este modo usa reglas locales, sin IA ni envío de mensajes a servicios externos."}
        </p>
        <div className="mt-4 inline-flex gap-2" role="group" aria-label="Modo del asesor">
          {(["ai", "local"] as const).map(value => <button key={value} type="button"
            aria-pressed={mode === value} onClick={() => { if (value !== mode) { reset(); setMode(value); } }}
            className="min-h-11 rounded-full border border-[#1a3353] px-4 text-sm text-[#91A7BC] aria-pressed:border-[#42C7E8] aria-pressed:text-[#42C7E8]">
            {value === "ai" ? "Asesor IA" : "Demo local"}
          </button>)}
        </div>
      </div>

      {/* Suggestions */}
      <div className="mb-6 flex flex-wrap justify-center gap-2">
        {suggestions.map(s => (
          <button
            key={s.label}
            type="button"
            onClick={() => sendMessage(s.text)}
            disabled={sending}
            className="rounded-full border border-[#287FF0]/30 bg-[#0B1D34] px-4 py-2 text-xs font-semibold text-[#42C7E8] transition-colors hover:border-[#42C7E8] hover:bg-[#123352] disabled:opacity-40"
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-[#1a3353] bg-[#0B1D34]/50 p-4" role="log" aria-live="polite" aria-label="Conversación con el asistente">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#287FF0]/20 text-[#42C7E8]">
                <Bot size={16} aria-hidden="true" />
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user"
              ? "bg-[#287FF0] text-white"
              : "bg-[#05080C] border border-[#1a3353] text-[#EAF2F8]"
              }`}>
              {msg.text.split("\n").map((line, i) => (
                <p key={i} className={i > 0 ? "mt-2" : ""}>{line}</p>
              ))}
              {msg.agents && msg.agents.length > 0 && (
                <div className="mt-3 space-y-2">
                  {msg.agents.map(agent => (
                    <Link
                      key={agent.slug}
                      href={`/agentes/${agent.slug}`}
                      className="group flex items-center gap-3 rounded-xl border border-[#1a3353] bg-[#0B1D34] p-3 transition-colors hover:border-[#42C7E8]"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#287FF0]/15 text-[#42C7E8]">
                        <Bot size={18} aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#EAF2F8] group-hover:text-[#42C7E8]">{agent.name}</p>
                        <p className="mt-0.5 text-xs text-[#91A7BC] line-clamp-1">{agent.desc}</p>
                      </div>
                      <ArrowRight size={14} className="shrink-0 text-[#91A7BC] group-hover:text-[#42C7E8]" aria-hidden="true" />
                    </Link>
                  ))}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {msg.query && (
                      <Link
                        href={`/agentes?q=${encodeURIComponent(msg.query)}`}
                        className="text-xs font-semibold text-[#42C7E8] hover:underline"
                      >
                        Ver catálogo filtrado →
                      </Link>
                    )}
                    <Link
                      href="/solicitar-demo"
                      className="text-xs font-semibold text-[#42C7E8] hover:underline"
                    >
                      Solicitar demo →
                    </Link>
                  </div>
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#42C7E8]/20 text-[#42C7E8]">
                <MessageCircle size={16} aria-hidden="true" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {sending && <p role="status" className="mt-3 text-sm text-[#42C7E8]">El asesor está preparando una respuesta…</p>}
      {error && <p role="alert" className="mt-3 rounded-xl border border-amber-400/30 p-3 text-sm text-amber-200">{error}</p>}

      {/* Input */}
      <form
        onSubmit={e => { e.preventDefault(); sendMessage(input); }}
        className="mt-4 flex items-center gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe tu necesidad..."
          maxLength={800}
          disabled={sending}
          aria-label="Mensaje al asistente"
          className="min-w-0 flex-1 rounded-xl border border-[#1a3353] bg-[#05080C] px-4 py-3 text-sm text-[#EAF2F8] placeholder-[#91A7BC] outline-none transition-colors focus:border-[#42C7E8]"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          aria-label="Enviar mensaje"
          className="flex size-11 items-center justify-center rounded-xl bg-[#287FF0] text-white transition-colors hover:bg-[#216bd0] disabled:opacity-40"
        >
          <Send size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={reset}
          aria-label="Reiniciar conversación"
          className="flex size-11 items-center justify-center rounded-xl border border-[#1a3353] text-[#91A7BC] transition-colors hover:border-[#42C7E8] hover:text-[#42C7E8]"
        >
          <RefreshCw size={16} aria-hidden="true" />
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-[#91A7BC]">
        {mode === "ai" ? "IA real sobre un catálogo de prueba · Puede equivocarse · Historial solo en esta pestaña; el proveedor aplica sus políticas de datos"
          : "Simulación local · Sin modelos de IA ni almacenamiento · Los agentes mostrados son ejemplos de demo"}
      </p>
    </div>
  );
}
