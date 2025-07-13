import { useState } from 'react';
import { isValidSetInput } from '../../domain/timer';

const DEFAULT_SETS = 3;

export function useSets() {
  const [sets, setSets] = useState(DEFAULT_SETS);
  const [editSets, setEditSets] = useState(String(DEFAULT_SETS));
  const [showSetModal, setShowSetModal] = useState(false);

  const openSetModal = () => setShowSetModal(true);
  const closeSetModal = () => setShowSetModal(false);

  const saveSets = () => {
    if (isValidSetInput(editSets)) {
      setSets(Math.max(1, parseInt(editSets) || 1));
      setShowSetModal(false);
    }
  };

  return {
    sets,
    setSets,
    editSets,
    setEditSets,
    showSetModal,
    openSetModal,
    closeSetModal,
    saveSets,
  };
} 