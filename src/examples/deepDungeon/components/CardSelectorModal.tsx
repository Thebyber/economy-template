import React, { useState } from "react";
import { Modal } from "components/ui/Modal";
import { OuterPanel, InnerPanel } from "components/ui/Panel";
import { Button } from "components/ui/Button";
import { Label } from "components/ui/Label";
import { DD_SUNNYSIDE } from "../lib/deepDungeonSunnyside";
import { type Card, getRandomCard, CARD_POOL } from "../DeepDungeonConstants";

// ── Rarity info ───────────────────────────────────────────────────────────────

const RARITY_INFO: { type: Card["type"]; label: string; chance: string; color: string; bg: string }[] = [
  { type: "Legendary", label: "LEGENDARY", chance: "3%",  color: "#ff8c00", bg: "#fce46b" },
  { type: "Epic",      label: "EPIC",      chance: "12%", color: "#b145e5", bg: "#ca67ff" },
  { type: "Rare",      label: "RARE",      chance: "25%", color: "#4592e5", bg: "#6985ff" },
  { type: "Common",    label: "COMMON",    chance: "60%", color: "#aaaaaa", bg: "#c7c7c7" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const getCardIcon = (icon: Card["icon"]): string => {
  switch (icon) {
    case "attack":    return DD_SUNNYSIDE.icons.sword;
    case "lightning": return DD_SUNNYSIDE.icons.lightning;
    case "crit":      return "/world/DeepDungeonAssets/crit.png";
    case "defense":   return "/world/DeepDungeonAssets/shield.png";
    case "pickaxe":   return "/world/DeepDungeonAssets/pickaxe.png";
    default:          return DD_SUNNYSIDE.icons.expression_confused;
  }
};

const getCardGlow = (card: Card) => {
  if (card.type !== "Common") return `0 0 20px ${card.color}`;
  return "none";
};

const getCardBackground = (type: Card["type"]): string => {
  switch (type) {
    case "Rare":      return "#6985ff";
    case "Epic":      return "#ca67ff";
    case "Legendary": return "#fce46b";
    default:          return "#c7c7c7";
  }
};

const playUISound = (fileName: string) => {
  const audio = new Audio(`/world/DeepDungeonAssets/${fileName}.mp3`);
  audio.volume = 0.4;
  audio.play().catch(() => {});
};

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  score: number;
  rerollPoints: number;
  rerollCost: number;
  onRerollPointsDeduct: (amount: number) => void;
  onRerollCostChange: (newCost: number) => void;
  onSelect: (card: Card) => void;
}

export const CardSelectorModal: React.FC<Props> = ({
  score,
  rerollPoints,
  rerollCost,
  onRerollPointsDeduct,
  onRerollCostChange,
  onSelect,
}) => {
  const [cards, setCards] = useState<Card[]>(() => [
    getRandomCard(),
    getRandomCard(),
    getRandomCard(),
  ]);
  const [showCatalog, setShowCatalog] = useState(false);

  const canReroll = rerollPoints >= rerollCost;

  const handleReroll = () => {
    if (!canReroll) return;
    playUISound("reroll_cards");
    onRerollPointsDeduct(rerollCost);
    setCards([getRandomCard(), getRandomCard(), getRandomCard()]);
    onRerollCostChange(rerollCost * 2);
  };

  const handleSelect = (card: Card) => {
    playUISound("card_sound");
    onSelect(card);
  };

  return (
    <>
      <Modal show>
        <OuterPanel className="bg-[#ead4aa] p-3 text-center relative w-full max-w-lg overflow-y-auto max-h-[90vh] scrollable">
          {/* ? catalog button */}
          <div
            className="absolute top-2 right-2 cursor-pointer hover:scale-110 transition-transform"
            style={{
              width: "22px",
              height: "22px",
              borderRadius: "50%",
              backgroundColor: "#4592e5",
              border: "2px solid #2a5fa0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowCatalog(true)}
          >
            <span
              style={{
                color: "#fff",
                fontSize: "13px",
                fontFamily: "monospace",
                fontWeight: "bold",
                lineHeight: 1,
              }}
            >
              {"?"}
            </span>
          </div>

          <Label type="formula" className="mb-4 uppercase tracking-wide font-bold">
            {"Choose one of the three benefits!"}
          </Label>

          <div className="flex gap-3 justify-center mb-5 font-bold">
            {cards.map((card, i) => (
              <OuterPanel
                key={`${card.name}-${i}`}
                onClick={() => handleSelect(card)}
                className="w-[30vw] max-w-[160px] min-w-[100px] p-2 cursor-pointer hover:scale-105 transition-all flex flex-col items-center"
                style={{
                  borderColor: card.color,
                  borderStyle: "solid",
                  borderWidth: "4px",
                  boxShadow: getCardGlow(card),
                  backgroundColor: getCardBackground(card.type),
                }}
              >
                {/* Rarity label */}
                <p
                  className="mb-1 uppercase font-bold"
                  style={{
                    color: card.color,
                    fontSize: "clamp(13px, 4vw, 20px)",
                    textAlign: "center",
                    textShadow: "1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000",
                    letterSpacing: "1.5px",
                  }}
                >
                  {card.type}
                </p>

                {/* Icon */}
                <img
                  src={getCardIcon(card.icon)}
                  className="w-9 my-2"
                  alt={card.icon}
                />

                {/* Benefit name */}
                <div className="text-[12px] font-bold text-brown-800 bg-black/5 w-full py-1 px-1 rounded mt-auto text-center">
                  {card.name}
                </div>
              </OuterPanel>
            ))}
          </div>

          {/* Reroll panel */}
          <InnerPanel className="p-3 bg-[#ead4aa] flex flex-col items-center font-bold">
            <Button
              disabled={!canReroll}
              onClick={handleReroll}
              className="mb-2 w-full"
            >
              <div className="flex items-center gap-2 justify-center font-bold">
                <span>{"REROLL"}</span>
                <span className={canReroll ? "text-green-900" : "text-red-900"}>
                  {rerollCost}{" pts"}
                </span>
              </div>
            </Button>
            <p className="text-[12px] text-brown-1100 font-bold">
              {"Reroll pts: "}<span className="text-brown-1100 font-bold">{rerollPoints}</span>
              {"  |  Score: "}<span className="text-brown-1100 font-bold">{score}</span>
            </p>
          </InnerPanel>
        </OuterPanel>
      </Modal>

      {/* Card catalog modal */}
      <Modal show={showCatalog}>
        <OuterPanel className="bg-[#ead4aa] p-3 w-full max-w-lg max-h-[90vh] overflow-y-auto scrollable">
          <div className="flex items-center justify-between mb-3 font-bold">
            <Label type="formula" className="uppercase">{"Card Drop Catalog"}</Label>
            <img
              src={DD_SUNNYSIDE.icons.close}
              className="cursor-pointer"
              style={{ width: "22px" }}
              onClick={() => setShowCatalog(false)}
              alt="close"
            />
          </div>

          <div className="overflow-y-auto scrollable pr-1" style={{ maxHeight: "min(380px, 70vh)" }}>
            {RARITY_INFO.map((rarity) => {
              const cardsOfRarity = CARD_POOL.filter((c) => c.type === rarity.type);
              const perCard =
                cardsOfRarity.length > 0
                  ? (parseFloat(rarity.chance) / cardsOfRarity.length).toFixed(1)
                  : "0";

              return (
                <div key={rarity.type} className="mb-4">
                  {/* Rarity header */}
                  <div
                    className="flex items-center gap-2 px-2 py-1 rounded mb-2 font-bold"
                    style={{ backgroundColor: rarity.bg }}
                  >
                    <span
                      className="uppercase text-[12px] font-bold"
                      style={{
                        color: rarity.color,
                        textShadow: "1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000",
                      }}
                    >
                      {rarity.label}
                    </span>
                    <span
                      className="text-[12px] text-white ml-auto font-bold"
                      style={{ textShadow: "1px 1px 0 #000" }}
                    >
                      {rarity.chance}{" rarity"}
                    </span>
                  </div>

                  {/* Cards of this rarity */}
                  <div className="flex flex-wrap gap-1 px-1 font-bold">
                    {cardsOfRarity.map((card) => (
                      <div
                        key={card.name}
                        className="flex items-center gap-1 px-2 py-1 rounded font-bold"
                        style={{
                          backgroundColor: rarity.bg + "55",
                          border: `1px solid ${rarity.color}`,
                          minWidth: "120px",
                        }}
                      >
                        <img
                          src={getCardIcon(card.icon)}
                          style={{ width: "24px", height: "24px" }}
                          alt={card.icon}
                        />
                        <span className="text-[12px] text-brown-900 font-bold">{card.name}</span>
                        <span
                          className="text-[11px] ml-auto font-bold"
                          style={{ color: rarity.color }}
                        >
                          {perCard}{"%"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </OuterPanel>
      </Modal>
    </>
  );
};
