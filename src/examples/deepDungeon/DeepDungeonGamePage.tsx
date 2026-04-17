import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Modal } from "components/ui/Modal";
import { OuterPanel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { useMinigameSession } from "lib/portal";
import { DeepDungeonGame } from "./DeepDungeonGame";
import { DeepDungeonRunProvider, useDeepDungeonRun, type RunProgress } from "./lib/DeepDungeonRunContext";
import { useDeepDungeonLifecycleDispatch } from "./lib/useDeepDungeonLifecycleDispatch";
import type { DeepDungeonPhaserApi, DeepDungeonRunStats } from "./DeepDungeonScene";
import type { DeepDungeonPlayerStats, DeepDungeonRunResult } from "./lib/deepDungeonLifecycle";
import type { EnemyType } from "./lib/Enemies";
import type { Card } from "./DeepDungeonConstants";
import { DUNGEON_POINTS } from "./DeepDungeonConstants";
import { CardSelectorModal } from "./components/CardSelectorModal";
import { DeepDungeonHUD } from "./components/DeepDungeonHUD";
import { DD_SUNNYSIDE } from "./lib/deepDungeonSunnyside";

const ENEMY_TYPES_ORDER = ["slime", "skeleton", "knight", "frankenstein", "devil"] as const;

function formatName(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Summary row ───────────────────────────────────────────────────────────────

const SummaryRow: React.FC<{ icon: string; label: string; value: string }> = ({
  icon,
  label,
  value,
}) => (
  <div className="flex items-center gap-2 px-1 py-0.5 rounded bg-black/5">
    <img
      src={icon}
      className="w-6 h-6 object-contain flex-shrink-0"
      style={{ imageRendering: "pixelated" }}
      alt=""
    />
    <span className="text-xs font-bold text-[#3e2731] flex-1">{label}</span>
    <span className="text-xs font-bold text-[#7b3f00]">{value}</span>
  </div>
);

// ── Inner component (needs RunContext) ────────────────────────────────────────

interface GameContentProps {
  initialStats: DeepDungeonPlayerStats;
}

const GameContent: React.FC<GameContentProps> = ({ initialStats }) => {
  const navigate = useNavigate();
  const { farm, farmId } = useMinigameSession();
  const { endRun } = useDeepDungeonLifecycleDispatch();
  const { addCrystal, addEnemyKill, addDeepCoin, setLevel, buildResult, getProgress } = useDeepDungeonRun();

  const [hudStats, setHudStats] = useState<DeepDungeonRunStats>({
    energy: initialStats.energy,
    maxEnergy: initialStats.energy,
    attack: initialStats.attack,
    defense: initialStats.defense,
    criticalChance: initialStats.criticalChance,
    inventory: { pickaxe: initialStats.startingPickaxes },
    currentLevel: 1,
  });
  const [hudEnemies, setHudEnemies] = useState(0);
  const [hudCrystals, setHudCrystals] = useState(0);
  const [hudScore, setHudScore] = useState(0);
  const [rerollPoints, setRerollPoints] = useState(0);
  const [rerollCost, setRerollCost] = useState(50);
  const [phase, setPhase] = useState<"playing" | "dead">("playing");
  const [showCardSelector, setShowCardSelector] = useState(false);
  const [runSnapshot, setRunSnapshot] = useState<{ result: DeepDungeonRunResult; progress: RunProgress } | null>(null);
  const gameOverShown = useRef(false);
  const gameRef = useRef<Phaser.Game | undefined>(undefined);

  const handleGameReady = useCallback((game: Phaser.Game) => {
    gameRef.current = game;
  }, []);

  // Stable phaserApi object — callbacks updated via useLayoutEffect every render.
  const phaserApi = useMemo<DeepDungeonPhaserApi>(
    () => ({
      onStatsChanged: (_stats) => {},
      onGameOver: () => {},
      onNextLevel: (_level) => {},
      onOpenCardSelector: () => {},
      onCrystalMined: (_key) => {},
      onEnemyKilled: (_type: EnemyType) => {},
      onDeepCoinDropped: () => {},
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useLayoutEffect(() => {
    phaserApi.onStatsChanged = (stats) => setHudStats(stats);
    phaserApi.onGameOver = () => {
      if (gameOverShown.current) return;
      gameOverShown.current = true;
      setRunSnapshot({ result: buildResult(), progress: getProgress() });
      setPhase("dead");
    };
    phaserApi.onNextLevel = (level) => {
      setLevel(level);
      const levelPts = level * 50;
      setHudScore((s) => s + levelPts);
      setRerollPoints((s) => s + levelPts);
    };
    phaserApi.onCrystalMined = (key) => {
      addCrystal(key);
      setHudCrystals((n) => n + 1);
      const pts = DUNGEON_POINTS.CRYSTALS[key as keyof typeof DUNGEON_POINTS.CRYSTALS] ?? 10;
      setHudScore((s) => s + pts);
      setRerollPoints((s) => s + pts);
    };
    phaserApi.onEnemyKilled = (type: EnemyType) => {
      addEnemyKill(type);
      setHudEnemies((n) => n + 1);
      const pts = DUNGEON_POINTS.ENEMIES[type as keyof typeof DUNGEON_POINTS.ENEMIES] ?? 20;
      setHudScore((s) => s + pts);
      setRerollPoints((s) => s + pts);
    };
    phaserApi.onDeepCoinDropped = () => {
      addDeepCoin();
    };
    phaserApi.onOpenCardSelector = () => setShowCardSelector(true);
  });

  const handleCardSelected = useCallback((card: Card) => {
    setShowCardSelector(false);
    const game = gameRef.current;
    if (game) {
      const scene = game.scene.getScene("deep-dungeon") as import("./DeepDungeonScene").DeepDungeonScene | null;
      scene?.applyCardBonus(card.bonus);
    }
  }, []);

  const [claimError, setClaimError] = useState(false);

  const handleClaim = useCallback(() => {
    const result = buildResult();
    const ok = endRun(result);
    if (!ok) {
      setClaimError(true);
      return;
    }
    navigate("/home", { replace: true });
  }, [buildResult, endRun, navigate]);

  return (
    <div className="relative min-h-screen w-full bg-black">
      <DeepDungeonGame
        bumpkin={farm?.bumpkin}
        farmId={farmId}
        phaserApi={phaserApi}
        initialStats={initialStats}
        onGameReady={handleGameReady}
      />

      {/* Full HUD (energy bar, codex, inventory) */}
      {phase === "playing" && (
        <DeepDungeonHUD
          stats={hudStats}
          enemiesKilled={hudEnemies}
          crystalsMined={hudCrystals}
          score={hudScore}
          progress={getProgress()}
        />
      )}

      {/* Card selector — shown between levels */}
      {showCardSelector && (
        <CardSelectorModal
          score={hudScore}
          rerollPoints={rerollPoints}
          rerollCost={rerollCost}
          onRerollPointsDeduct={(amount) => setRerollPoints((s) => Math.max(0, s - amount))}
          onRerollCostChange={(newCost) => setRerollCost(newCost)}
          onSelect={handleCardSelected}
        />
      )}

      {/* Game Over modal */}
      {phase === "dead" && runSnapshot && (
        <Modal show>
          <OuterPanel className="flex flex-col w-full max-w-sm max-h-[90vh] p-1">
            {/* Header */}
            <div className="p-2 pb-1 text-center">
              <Label type="danger" className="mb-2 mx-auto">
                Game Over
              </Label>
              <p className="font-bold text-sm text-[#3e2731]">
                {"Congratulations! You reached floor "}
                <span className="text-[#7b3f00]">{hudStats.currentLevel}</span>
                {" with "}
                <span className="text-[#7b3f00]">{hudScore.toLocaleString()}</span>
                {" points"}
              </p>
            </div>

            {/* Summary */}
            <div className="flex-1 overflow-y-auto scrollable px-2 py-1">
              <Label type="formula" className="mb-2 uppercase text-xs">
                Adventure Summary
              </Label>

              <div className="space-y-1">
                {/* Player XP */}
                <SummaryRow
                  icon="/world/DeepDungeonAssets/xp.png"
                  label="Player XP"
                  value={`+${runSnapshot.result.playerXp}`}
                />

                {/* Deep Coins */}
                {runSnapshot.result.deepCoins > 0 && (
                  <SummaryRow
                    icon="/world/DeepDungeonAssets/deep_token.png"
                    label="Deep Coins"
                    value={`+${runSnapshot.result.deepCoins}`}
                  />
                )}

                {/* Enemies Killed (total) */}
                {runSnapshot.result.stats.enemiesKilled > 0 && (
                  <SummaryRow
                    icon="/world/DeepDungeonAssets/skull.png"
                    label="Enemies Killed"
                    value={`+${runSnapshot.result.stats.enemiesKilled}`}
                  />
                )}

                {/* Crystals Mined (total) */}
                {runSnapshot.result.stats.crystalsMined > 0 && (
                  <SummaryRow
                    icon="/world/DeepDungeonAssets/crystals_mined.png"
                    label="Crystals Mined"
                    value={`+${runSnapshot.result.stats.crystalsMined}`}
                  />
                )}

                {/* Crystals */}
                {Object.entries(runSnapshot.progress.crystals)
                  .filter(([, n]) => n > 0)
                  .map(([key, n]) => (
                    <SummaryRow
                      key={key}
                      icon={`world/DeepDungeonAssets/${key}.png`}
                      label={formatName(key)}
                      value={`+${n}`}
                    />
                  ))}

                {/* Enemies by type */}
                {ENEMY_TYPES_ORDER.filter(
                  (t) => (runSnapshot.progress.totalEnemiesByType[t] ?? 0) > 0,
                ).map((t) => (
                  <SummaryRow
                    key={t}
                    icon={`world/DeepDungeonAssets/${t}s_killed.png`}
                    label={`${formatName(t)} killed`}
                    value={String(runSnapshot.progress.totalEnemiesByType[t])}
                  />
                ))}
              </div>
            </div>

            {/* Footer */}
            {claimError ? (
              <p className="text-center text-xs text-red-700 font-bold py-1 px-2">
                {"Could not save progress. Please try again."}
              </p>
            ) : (
              <p className="text-center text-xs text-[#3e2731] font-bold py-1 px-2">
                {"Your progress has been saved."}
              </p>
            )}

            <div className="px-2 pb-2">
              <Button className="w-full" onClick={handleClaim}>
                {claimError ? "Retry" : "Continue"}
              </Button>
            </div>
          </OuterPanel>
        </Modal>
      )}
    </div>
  );
};

// ── Page wrapper ──────────────────────────────────────────────────────────────

export const DeepDungeonGamePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [initialStats] = useState<DeepDungeonPlayerStats | null>(
    () =>
      (location.state as { initialStats?: DeepDungeonPlayerStats } | null)
        ?.initialStats ?? null,
  );

  useEffect(() => {
    if (!initialStats) {
      navigate("/home", { replace: true });
    }
  }, [initialStats, navigate]);

  if (!initialStats) {
    return null;
  }

  return (
    <DeepDungeonRunProvider>
      <GameContent initialStats={initialStats} />
    </DeepDungeonRunProvider>
  );
};
