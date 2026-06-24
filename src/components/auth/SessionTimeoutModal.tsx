import { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { selectAuthStatus, clearSession } from '../../redux/slices/authSlice';
import { authService } from '../../services/authService';
import { Modal, Button } from '../common/ui';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 mins
const WARNING_BEFORE_MS = 5 * 60 * 1000; // Warn 5 mins before timeout

export const SessionTimeoutModal = () => {
  const status = useAppSelector(selectAuthStatus);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const lastActive = useRef(0);
  const timerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);
  // Mirror state/props into refs so the idle effect does not need them as
  // dependencies (otherwise navigating or toggling the warning would tear down
  // the listeners and reset the idle clock, defeating the timeout entirely).
  const showWarningRef = useRef(false);
  const locationRef = useRef(location);
  useEffect(() => {
    locationRef.current = location;
  }, [location]);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    dispatch(clearSession());
    navigate('/login', { state: { from: locationRef.current }, replace: true });
  }, [dispatch, navigate]);

  const resetTimer = useCallback(() => {
    if (showWarningRef.current) return; // Don't reset if warning is already showing
    lastActive.current = Date.now();
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') return;

    // Initialize
    lastActive.current = Date.now();

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    const handleActivity = () => resetTimer();
    events.forEach((evt) => window.addEventListener(evt, handleActivity));

    const checkIdle = () => {
      const idleTime = Date.now() - lastActive.current;

      if (idleTime >= IDLE_TIMEOUT_MS) {
        handleLogout();
      } else if (idleTime >= IDLE_TIMEOUT_MS - WARNING_BEFORE_MS && !showWarningRef.current) {
        showWarningRef.current = true;
        setShowWarning(true);
        setTimeLeft(Math.ceil((IDLE_TIMEOUT_MS - idleTime) / 1000));
      }
    };

    timerRef.current = window.setInterval(checkIdle, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, resetTimer, handleLogout]);

  useEffect(() => {
    if (!showWarning) return;
    if (timeLeft <= 0) {
      handleLogout();
      return;
    }
    countdownRef.current = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [showWarning, timeLeft, handleLogout]);

  const handleStayLoggedIn = async () => {
    try {
      await authService.refreshSession();
      showWarningRef.current = false;
      setShowWarning(false);
      lastActive.current = Date.now();
    } catch {
      handleLogout();
    }
  };

  return (
    <Modal
      isOpen={showWarning}
      onClose={() => {}} // Disallow closing by clicking outside
      title="Session Expiring Soon"
    >
      <div style={{ padding: '1rem' }}>
        <p>Your session will expire in {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} due to inactivity.</p>
        <p>Do you want to stay logged in?</p>
      </div>
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <Button variant="secondary" onClick={handleLogout}>Log out</Button>
        <Button variant="primary" onClick={handleStayLoggedIn}>Stay Logged In</Button>
      </div>
    </Modal>
  );
};
