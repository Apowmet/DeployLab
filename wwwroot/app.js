'use strict';

const $ = (id) => document.getElementById(id);
const safeText = (id, text) => { $(id).textContent = String(text ?? '—'); };

function formatUptime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours ? `${hours} ч ${minutes} мин` : `${minutes} мин ${seconds % 60} сек`;
}

async function refreshEnvironment() {
  try {
    const response = await fetch('/api/info', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const info = await response.json();
    const isLinux = /linux|debian/i.test(info.os ?? '');
    safeText('os-value', info.os);
    safeText('os-symbol', isLinux ? '⟩_' : '⊞');
    safeText('dotnet-value', info.dotnet);
    safeText('host-value', info.host);
    safeText('environment-value', info.environment);
    safeText('uptime-value', formatUptime(info.uptimeSeconds));
    safeText('arch-value', info.architecture);
    $('connection-label').innerHTML = '<span class="pulse-dot"></span> API ONLINE';
  } catch (error) {
    safeText('os-value', 'API недоступен');
    safeText('connection-label', 'OFFLINE');
    safeText('dotnet-value', '—');
    safeText('host-value', '—');
    safeText('environment-value', '—');
    safeText('uptime-value', '—');
  }
}

async function checkHealth() {
  const button = $('health-button');
  button.disabled = true;
  safeText('response-status', 'Запрос выполняется…');
  try {
    const response = await fetch('/health', { cache: 'no-store' });
    const body = await response.json();
    safeText('response-status', `${response.status} ${response.ok ? 'OK' : 'ERROR'}`);
    safeText('api-output', JSON.stringify(body, null, 2));
  } catch (error) {
    safeText('response-status', 'Network error');
    safeText('api-output', `Не удалось выполнить запрос: ${error.message}`);
  } finally {
    button.disabled = false;
  }
}

$('health-button').addEventListener('click', checkHealth);
refreshEnvironment();
setInterval(refreshEnvironment, 10000);
