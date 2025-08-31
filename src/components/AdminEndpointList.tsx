// Auto-updated by patch_shadowcheck_ui_v1.sh (original backed up if existed)
import { useState } from "react";

export default function AdminEndpointList({ endpoints = [] as string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-slate-900 rounded-2xl p-4">
      <button className="w-full text-left font-semibold" onClick={() => setOpen(v => !v)}>
        API Endpoint Status {open ? "▾" : "▸"}
      </button>
      {open && (
        <ul className="mt-2 grid sm:grid-cols-2 gap-2">
          {endpoints.map((e) => (
            <li key={e} className="rounded-lg bg-slate-800 px-3 py-2 text-[12px]">{e}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
