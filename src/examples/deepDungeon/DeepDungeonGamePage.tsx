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
import { Panel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { useMinigameSession } from "lib/portal";
import { DeepDungeonGame } from "./DeepDungeonGame";
import { DeepDungeonRunProvider, useDeepDungeonRun } from "./lib/DeepDungeonRunContext";
import { useDeepDungeonLifecycleDispatch } from "./lib/useDeepDungeonLifecycleDispatch";
import type { DeepDungeonPhaserApi, DeepDungeonRunStats } from "./DeepDungeonScene";
import type { DeepDungeonPlayerStats } from "./lib/deepDungeonLifecycle";
import type { EnemyType } from "./lib/Enemies";
import type { Card } from "./DeepDungeonConstants";
import { DUNGEON_POINTS } from "./DeepDungeonConstants";
import { CardSelectorModal } from "./components/CardSelectorModal";
import { DeepDungeonHUD } from "./components/DeepDungeonHUD";

// ── Inner component (needs RunContext) ────────────────────────────────────────

interface GameContentProps {
  initialStats: DeepDungeonPlayerStats;
}

const GameContent: React.FC<GameContentProps> = ({ initialStats }) => {
  const navigate = useNavigate();
  const { farm, farmId } = useMinigameSession();
  const { endRun } = useDeepDungeonLifecycleDispatch();
  const { addCrystal, addEnemyKill, setLevel, buildResult, getProgress } = useDeepDungeonRun();

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
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useLayoutEffect(() => {
    phaserApi.onStatsChanged = (stats) => setHudStats(stats);
    phaserApi.onGameOver = () => {
      if (gameOverShown.current) return;
      gameOverShown.current = true;
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

  const handleClaim = useCallback(() => {
    const result = buildResult();
    endRun(result);
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
      {phase === "dead" && (
        <Modal show>
          <Panel>
            <div className="p-2">
              <Label type="danger" className="mb-2">
                Game Over
              </Label>
              <p className="text-sm mb-3 text-[#3e2731]">
                You reached floor {hudStats.currentLevel}. Your progress has been saved.
              </p>
            </div>
            <Button className="w-full" onClick={handleClaim}>
              Continue
            </Button>
          </Panel>
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
