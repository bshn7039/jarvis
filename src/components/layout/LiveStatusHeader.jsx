import { useState, useEffect, useMemo } from 'react';
import { useProfileStore } from '../../store/profileStore';
import { useTaskStore } from '../../store/taskStore';
import { MapPin, AlertTriangle, Moon } from 'lucide-react';

/* ─── helpers ─── */

function formatTime(date) {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function parseSleepTime(sleepStr) {
  // Expects "HH:MM" or "10:00 PM" etc.
  if (!sleepStr) return null;
  // Try 24h first
  const match24 = sleepStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return { hours: parseInt(match24[1], 10), minutes: parseInt(match24[2], 10) };
  }
  // Try 12h
  const match12 = sleepStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let h = parseInt(match12[1], 10);
    const m = parseInt(match12[2], 10);
    const period = match12[3].toUpperCase();
    if (period === 'PM' && h !== 12) h += 12;
    if (period === 'AM' && h === 12) h = 0;
    return { hours: h, minutes: m };
  }
  return null;
}

function getSleepDebt(sleepTimeStr, wakeTimeStr) {
  const parsedSleep = parseSleepTime(sleepTimeStr || '00:00');
  const parsedWake = parseSleepTime(wakeTimeStr || '08:00');
  if (!parsedSleep || !parsedWake) return null;

  const now = new Date();
  const currentMins = now.getHours() * 60 + now.getMinutes();
  const sleepMins = parsedSleep.hours * 60 + parsedSleep.minutes;
  const wakeMins = parsedWake.hours * 60 + parsedWake.minutes;

  // Determine if current time falls within the sleep window
  let inWindow = false;
  if (sleepMins < wakeMins) {
    inWindow = currentMins >= sleepMins && currentMins < wakeMins;
  } else {
    inWindow = currentMins >= sleepMins || currentMins < wakeMins;
  }

  // If outside the sleep/wake window, hide the sleep debt indicator
  if (!inWindow) return null;

  const sleepDate = new Date(now);
  sleepDate.setHours(parsedSleep.hours, parsedSleep.minutes, 0, 0);

  // If current time is in the morning before wake-up, and sleep started yesterday evening
  if (currentMins < wakeMins && sleepMins >= wakeMins) {
    sleepDate.setDate(sleepDate.getDate() - 1);
  }

  // If sleep time is in the future relative to the calculated date, no debt
  if (now <= sleepDate) return null;

  const diffMs = now - sleepDate;
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins <= 0) return null;

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  return { hours, mins, totalMinutes: diffMins };
}

/* ─── component ─── */

export default function LiveStatusHeader() {
  const [now, setNow] = useState(new Date());

  const profile = useProfileStore((s) => s.profile);
  const tasks = useTaskStore((s) => s.tasks);

  // Tick every second
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Derived data
  const location = profile?.identity?.location || 'Earth';
  const sleepTimeStr = profile?.productivity?.sleepTime;
  const wakeTimeStr = profile?.productivity?.wakeTime;
  const sleepDebt = useMemo(() => getSleepDebt(sleepTimeStr, wakeTimeStr), [sleepTimeStr, wakeTimeStr, now]);

  const pendingPriorities = useMemo(() => {
    return tasks.filter(
      (t) =>
        !t.completed &&
        t.bucket !== 'completed' &&
        (t.priority === 'high' || t.priority === 'critical')
    ).length;
  }, [tasks]);

  const timeStr = formatTime(now);

  return (
    <div className="jarvis-status-strip" id="jarvis-live-status">
      {/* Animated background scanline */}
      <div className="status-scanline" />

      <div className="status-content">
        {/* Left cluster: status + time */}
        <div className="status-cluster">
          <div className="status-online">
            <span className="status-dot" />
            <span className="status-label">JARVIS ONLINE</span>
          </div>

          <span className="status-divider" />

          <span className="status-time">{timeStr}</span>
        </div>

        {/* Center: location */}
        <div className="status-cluster status-location">
          <MapPin className="status-icon" />
          <span>{location}</span>
        </div>

        {/* Right cluster: priorities + sleep debt */}
        <div className="status-cluster">
          {pendingPriorities > 0 && (
            <div className="status-priorities">
              <AlertTriangle className="status-icon status-icon-warn" />
              <span>
                {pendingPriorities} Pending{' '}
                {pendingPriorities === 1 ? 'Priority' : 'Priorities'}
              </span>
            </div>
          )}

          {sleepDebt && (
            <>
              {pendingPriorities > 0 && <span className="status-divider" />}
              <div className="status-sleep-debt">
                <Moon className="status-icon status-icon-sleep" />
                <span>
                  Sleep Debt:{' '}
                  {sleepDebt.hours > 0 ? `${sleepDebt.hours}h ` : ''}
                  {sleepDebt.mins}m
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
