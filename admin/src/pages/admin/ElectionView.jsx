import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiUsers,
  FiTrash2, FiUpload, FiDownload,
  FiActivity, FiLayers, FiChevronRight
} from 'react-icons/fi';
import electionService from '../../services/electionService';
import Loader from '../../components/Loader';

/* ---------------- Helpers ---------------- */

const formatIST = (utc) => {
  if (!utc) return '—';
  return new Date(utc).toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};

/* ---------------- Main Component ---------------- */

const ElectionView = () => {
  const [elections, setElections] = useState([]);
  const [selected, setSelected] = useState(null);
  const [ballots, setBallots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  /* ------------ Fetch Elections ------------ */

  useEffect(() => {
    loadElections();
  }, []);

  useEffect(() => {
    if (selected) loadBallots(selected.id);
  }, [selected]);

  const loadElections = async () => {
    try {
      const res = await electionService.getAdminElections();
      setElections(res || []);

      if (res?.length > 0 && !selected) {
        setSelected(res[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadBallots = async (electionId) => {
    try {
      const res = await electionService.getElectionBallots(electionId);
      setBallots(res || []);
    } catch {
      setBallots([]);
    }
  };

  /* ------------ Action Handler ------------ */

  const handleAction = async (actionFn) => {
    setActionLoading(true);
    try {
      await actionFn();
      await loadElections();
      if (selected) await loadBallots(selected.id);
    } catch (err) {
      alert("Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader message="Loading dashboard..." />;

  const stats = {
    total: elections.length,
    published: elections.filter(e => e.status === "PUBLISHED").length,
    draft: elections.filter(e => e.status === "DRAFT").length,
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Election Dashboard</h1>

      {/* Stats */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <div>Total: {stats.total}</div>
        <div>Published: {stats.published}</div>
        <div>Draft: {stats.draft}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "2rem" }}>

        {/* -------- Left List -------- */}
        <div>
          {elections.map((e) => {
            const isActive = selected?.id === e.id;

            return (
              <div
                key={e.id}
                onClick={() => setSelected(e)}
                style={{
                  border: isActive ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                  padding: "1rem",
                  marginBottom: "1rem",
                  cursor: "pointer",
                  borderRadius: "8px"
                }}
              >
                <h3>{e.title}</h3>
                <p>Status: {e.status}</p>
              </div>
            );
          })}

          {elections.length === 0 && <p>No elections found.</p>}
        </div>

        {/* -------- Right Detail -------- */}
        <div>
          {selected ? (
            <div style={{ border: "1px solid #e2e8f0", padding: "2rem", borderRadius: "8px" }}>
              <h2>{selected.title}</h2>
              <p><strong>ID:</strong> {selected.id.slice(-6)}</p>
              <p>{selected.description}</p>

              <p>
                <strong>Start:</strong> {formatIST(selected.startDate)}
              </p>
              <p>
                <strong>End:</strong> {formatIST(selected.endDate)}
              </p>

              {/* Buttons */}
              <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                {selected.status !== "PUBLISHED" ? (
                  <button
                    disabled={actionLoading}
                    onClick={() =>
                      handleAction(() =>
                        electionService.publishElection(selected.id)
                      )
                    }
                  >
                    <FiUpload /> Publish
                  </button>
                ) : (
                  <button
                    disabled={actionLoading}
                    onClick={() =>
                      handleAction(() =>
                        electionService.unpublishElection(selected.id)
                      )
                    }
                  >
                    <FiDownload /> Unpublish
                  </button>
                )}

                <button
                  disabled={actionLoading}
                  onClick={() => {
                    if (window.confirm("Delete this election?")) {
                      handleAction(() =>
                        electionService.deleteElection(selected.id)
                      );
                    }
                  }}
                >
                  <FiTrash2 /> Delete
                </button>
              </div>

              {/* Ballots */}
              <h3 style={{ marginTop: "2rem" }}>Ballots</h3>
              {ballots.length === 0 ? (
                <p>No ballots available.</p>
              ) : (
                ballots.map(b => (
                  <div key={b.id} style={{ marginBottom: "0.5rem" }}>
                    {b.title} — {b.status}
                  </div>
                ))
              )}
            </div>
          ) : (
            <p>Select an election to view details.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ElectionView;
