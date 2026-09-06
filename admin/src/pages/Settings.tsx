"use client";

import React from 'react';
import { Database, ExternalLink } from 'lucide-react';

const PMA_URL = 'http://localhost:8081';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
        <p className="text-slate-500 mt-1">System configuration and database management</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Database Management</h3>
        <p className="text-sm text-slate-500 mb-6">
          Access the database directly using phpMyAdmin. Only admins can view this link.
          Click below to open phpMyAdmin in a new tab.
        </p>

        <a
          href={PMA_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          <Database className="w-4 h-4" />
          Open phpMyAdmin
          <ExternalLink className="w-4 h-4" />
        </a>

        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <p className="text-xs text-slate-500 font-mono">
            URL: {PMA_URL}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Credentials: Use your MySQL root / application DB credentials configured in backend/.env
          </p>
        </div>
      </div>
    </div>
  );
}
