import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "components/ui/Modal";
import { Panel, OuterPanel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { closePortal, useMinigameSession } from "lib/portal";
import { getAttemptsLeft } from "./lib/DeepDungeonUtils";
import { useDeepDungeonLifecycleDispatch } from "./lib/useDeepDungeonLifecycleDispatch";
import { DungeonGuide } from "./components/DeepDungeonHUD";
import { DD_SUNNYSIDE } from "./lib/deepDungeonSunnyside";
import { PIXEL_SCALE } from "lib/constants";

const COOLDOWN_SECONDS = 43200; // 12 hours

function lsKey(farmId: number) {
  return `dd_free_attempts_last_claim_${farmId}`;
}

function getSecondsLeft(farmId: number): number {
  const raw = localStorage.getItem(lsKey(farmId));
  if (!raw) return 0;
  const elapsed = Math.floor((Date.now() - Number(raw)) / 1000);
  return Math.max(0, COOLDOWN_SECONDS - elapsed);
}

function formatCountdown(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const DeepDungeonHome: React.FC = () => {
  const navigate = useNavigate();
  const { playerEconomy, clearApiError, apiError, farmId } = useMinigameSession();
  const { startGame, claimFreeAttempts } = useDeepDungeonLifecycleDispatch();

  const [secondsLeft, setSecondsLeft] = useState(() => getSecondsLeft(farmId));
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => {
      const left = getSecondsLeft(farmId);
      setSecondsLeft(left);
      if (left <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [farmId, secondsLeft]);

  const attemptsLeft = getAttemptsLeft(playerEconomy);
  const canPlay = attemptsLeft > 0;
  const canClaim = secondsLeft <= 0;

  const onPlay = () => {
    const stats = startGame();
    if (!stats) return;
    navigate("/game", { state: { initialStats: stats } });
  };

  const onClaim = () => {
    const ok = claimFreeAttempts();
    if (ok) {
      localStorage.setItem(lsKey(farmId), String(Date.now()));
      setSecondsLeft(COOLDOWN_SECONDS);
    }
  };

  const onClose = () => {
    clearApiError();
    closePortal(navigate);
  };

  if (showGuide) {
    return (
      <div className="relative min-h-screen w-full bg-black flex items-center justify-center">
        <Modal show>
          <OuterPanel className="flex flex-col h-[500px] max-h-[80vh] w-full max-w-lg p-1">
            <div className="flex items-center pl-1 mb-2">
              <p className="font-bold text-sm uppercase text-brown-1100 grow">Guide</p>
              <img
                src={DD_SUNNYSIDE.icons.close}
                className="cursor-pointer"
                onClick={() => setShowGuide(false)}
                style={{ width: `${PIXEL_SCALE * 11}px` }}
                alt="close"
              />
            </div>
            <div className="flex-1 overflow-y-auto scrollable">
              <DungeonGuide />
            </div>
          </OuterPanel>
        </Modal>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-black flex items-center justify-center">
      <Modal show>
        <Panel>
          <div className="p-2">
            <Label type="default" className="mb-2">
              Deep Dungeon
            </Label>
            <p className="text-sm mb-3 text-[#3e2731]">
              Descend into the depths. Survive as long as you can.
            </p>
            <div className="flex items-center gap-2 mb-3">
              <Label type={canPlay ? "warning" : "danger"}>
                {attemptsLeft} attempt{attemptsLeft !== 1 ? "s" : ""} remaining
              </Label>
            </div>
            {apiError && (
              <p className="text-xs text-red-600 mb-2 break-words">{apiError}</p>
            )}
            <Button className="w-full mb-1" onClick={onPlay} disabled={!canPlay}>
              Play
            </Button>
            <Button className="w-full mb-1" onClick={onClaim} disabled={!canClaim}>
              {canClaim
                ? "Claim 3 attempts"
                : `Next claim in ${formatCountdown(secondsLeft)}`}
            </Button>
            <Button className="w-full mb-1" onClick={() => setShowGuide(true)}>
              Guide
            </Button>
            <Button className="w-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </Panel>
      </Modal>
    </div>
  );
};
