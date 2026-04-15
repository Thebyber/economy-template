import React from "react";
import { useNavigate } from "react-router-dom";
import { Modal } from "components/ui/Modal";
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { closePortal, useMinigameSession } from "lib/portal";
import { getAttemptsLeft } from "./lib/DeepDungeonUtils";
import { useDeepDungeonLifecycleDispatch } from "./lib/useDeepDungeonLifecycleDispatch";

export const DeepDungeonHome: React.FC = () => {
  const navigate = useNavigate();
  const { playerEconomy, clearApiError, apiError } = useMinigameSession();
  const { startGame } = useDeepDungeonLifecycleDispatch();

  const attemptsLeft = getAttemptsLeft(playerEconomy);
  const canPlay = attemptsLeft > 0;

  const onPlay = () => {
    // Burns 1 attempt, returns trophy-boosted stats. Must be called in an
    // event handler, NOT during render — commitLocalPlayerEconomySync uses flushSync internally.
    const stats = startGame();
    if (!stats) return;
    navigate("/game", { state: { initialStats: stats } });
  };

  const onClose = () => {
    clearApiError();
    closePortal(navigate);
  };

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
            <Button
              className="w-full mb-1"
              onClick={onPlay}
              disabled={!canPlay}
            >
              Play
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
