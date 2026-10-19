/* =====================================================================
   AgroSuite 360° · Gestor Multi-Predio ("Mis Fincas") y Bóveda de Respaldo
   Permite gestionar múltiples haciendas o unidades de producción independientes.
   ===================================================================== */

const AgroFarms = (() => {
  const STORAGE_FARMS_LIST = 'agro-farms-registry';
  const STORAGE_ACTIVE_FARM = 'agro-active-farm-id';

  function getFarms() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_FARMS_LIST));
      if (Array.isArray(data) && data.length) return data;
    } catch (e) {}
    // Finca por defecto inicial
    const def = [{ id: 'finca_principal', name: 'Hacienda Principal', desc: 'Unidad de producción base', created: Date.now() }];
    saveFarms(def);
    return def;
  }

  function saveFarms(farms) {
    localStorage.setItem(STORAGE_FARMS_LIST, JSON.stringify(farms));
  }

  function getActiveFarmId() {
    return localStorage.getItem(STORAGE_ACTIVE_FARM) || 'finca_principal';
  }

  function getActiveFarm() {
    const list = getFarms();
    const id = getActiveFarmId();
    return list.find((f) => f.id === id) || list[0];
  }

  function setActiveFarmId(id) {
    localStorage.setItem(STORAGE_ACTIVE_FARM, id);
    window.dispatchEvent(new CustomEvent('farmchange', { detail: { farmId: id } }));
  }

  function addFarm(name, desc = '') {
    const list = getFarms();
    const id = 'finca_' + Date.now();
    list.push({ id, name: name.trim() || 'Nueva Finca', desc: desc.trim(), created: Date.now() });
    saveFarms(list);
    setActiveFarmId(id);
    return id;
  }

  function removeFarm(id) {
    if (id === 'finca_principal') return false; // Proteger la principal
    let list = getFarms();
    list = list.filter((f) => f.id !== id);
    saveFarms(list);
    // Limpiar storage de esa finca
    Object.keys(localStorage).forEach((k) => {
      if (k.startsWith(id + ':')) localStorage.removeItem(k);
    });
    if (getActiveFarmId() === id) setActiveFarmId('finca_principal');
    return true;
  }

  /**
   * Resuelve la clave en localStorage según la finca activa
   */
  function farmKey(key) {
    const actId = getActiveFarmId();
    if (actId === 'finca_principal') return key; // Retrocompatibilidad directa
    return `${actId}:${key}`;
  }

  /**
   * Exporta toda la base de datos de todas las fincas en un solo archivo JSON
   */
  function exportBackup() {
    const backup = {
      app: 'AgroSuite 360°',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
      farms: getFarms(),
      activeFarm: getActiveFarmId(),
      data: {}
    };

    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('calc-') || k.startsWith('finca_') || k.startsWith('hub-') || k.startsWith('agro-'))) {
        backup.data[k] = localStorage.getItem(k);
      }
    }

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AgroSuite_Backup_${new Date().toISOString().slice(0, 10)}.agrobackup.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Importa un respaldo validado
   */
  function importBackup(jsonString) {
    try {
      const backup = JSON.parse(jsonString);
      if (!backup || !backup.data) throw new Error('Formato de archivo inválido.');

      // Guardar fincas
      if (Array.isArray(backup.farms)) saveFarms(backup.farms);
      if (backup.activeFarm) localStorage.setItem(STORAGE_ACTIVE_FARM, backup.activeFarm);

      // Restaurar claves
      Object.keys(backup.data).forEach((k) => {
        localStorage.setItem(k, backup.data[k]);
      });

      window.dispatchEvent(new CustomEvent('farmchange', { detail: { farmId: getActiveFarmId() } }));
      return { ok: true, count: Object.keys(backup.data).length };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  return { getFarms, getActiveFarm, getActiveFarmId, setActiveFarmId, addFarm, removeFarm, farmKey, exportBackup, importBackup };
})();

if (typeof module !== 'undefined') module.exports = AgroFarms;
