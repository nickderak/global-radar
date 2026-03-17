"use client";

import { useState } from "react";

export default function AdminPage() {
  const [formData, setFormData] = useState({
    id: "",
    time: "",
    category: "",
    title: "",
    description: "",
    confidence: "Medium",
    sourceCount: "1",
    status: "Developing",
    region: "",
    sources: "",
    timeline: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const formattedEvent = {
      ...formData,
      sourceCount: Number(formData.sourceCount),
      sources: formData.sources
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      timeline: formData.timeline
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    console.log("New Event Draft:", formattedEvent);
    alert("Event draft captured in browser console.");
  }

  return (
    <main className="min-h-screen bg-black px-8 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 border-b border-gray-800 pb-6">
          <p className="mb-2 text-sm uppercase tracking-[0.2em] text-gray-400">
            Global Radar
          </p>
          <h1 className="text-4xl font-bold">Admin Event Entry</h1>
          <p className="mt-3 text-gray-300">
            Create a new event draft for the platform.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-gray-400">Event ID</label>
              <input
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder="red-sea-shipping-corridor"
                className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">Time</label>
              <input
                name="time"
                value={formData.time}
                onChange={handleChange}
                placeholder="14:32 UTC"
                className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">Category</label>
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Infrastructure"
                className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">Region</label>
              <input
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="Middle East"
                className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">Confidence</label>
              <select
                name="confidence"
                value={formData.confidence}
                onChange={handleChange}
                className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-white"
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-white"
              >
                <option>Confirmed</option>
                <option>Developing</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-400">Source Count</label>
              <input
                name="sourceCount"
                value={formData.sourceCount}
                onChange={handleChange}
                placeholder="3"
                className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Explosion reported near Red Sea shipping corridor"
              className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Initial reports indicate a possible disruption near a major shipping route."
              className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Sources (one per line)
            </label>
            <textarea
              name="sources"
              value={formData.sources}
              onChange={handleChange}
              rows={4}
              placeholder={`Reuters\nBBC\nRegional Maritime Authority`}
              className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-400">
              Timeline (one per line)
            </label>
            <textarea
              name="timeline"
              value={formData.timeline}
              onChange={handleChange}
              rows={4}
              placeholder={`14:32 UTC — Initial report\n14:41 UTC — Reuters confirmation\n14:55 UTC — Authority statement`}
              className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-white"
            />
          </div>

          <button
            type="submit"
            className="rounded border border-gray-700 bg-white px-5 py-2 font-semibold text-black hover:bg-gray-200"
          >
            Save Event Draft
          </button>
        </form>
      </div>
    </main>
  );
}