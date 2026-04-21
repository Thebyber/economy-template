import React, { useState } from "react";
import Decimal from "decimal.js-light";
import { Modal } from "components/ui/Modal";
import { OuterPanel } from "components/ui/Panel";
import { Box } from "components/ui/Box";
import { Label } from "components/ui/Label";
import { useMinigameSession } from "lib/portal";
import { DD_SUNNYSIDE } from "../lib/deepDungeonSunnyside";
import { PIXEL_SCALE } from "lib/constants";
import { DD_ITEM } from "../lib/deepDungeonItemIds";

interface Props {
  onClose: () => void;
}

interface ItemSlot {
  id: string;
  name: string;
  image: string;
  count: number;
}

const deepCoinImg = "/world/DeepDungeonAssets/deep_token.png";

// Direct ID → { name, image } map — independent of API key names
const ID_TO_ASSET: Record<string, { name: string; image: string }> = {
  [DD_ITEM.DEEP_COIN]:        { name: "Deep Coin",          image: "/world/DeepDungeonAssets/deep_token.png" },
  [DD_ITEM.POTION]:           { name: "Energy Potion",       image: "/world/DeepDungeonAssets/potion.png" },
  [DD_ITEM.KEY_CHEST]:        { name: "Chest Key",           image: "/world/DeepDungeonAssets/key_chest.png" },
  [DD_ITEM.PINK_CRYSTAL_1]:   { name: "Pink Crystal I",      image: "/world/DeepDungeonAssets/pink_crystal_1.png" },
  [DD_ITEM.PINK_CRYSTAL_2]:   { name: "Pink Crystal II",     image: "/world/DeepDungeonAssets/pink_crystal_2.png" },
  [DD_ITEM.PINK_CRYSTAL_3]:   { name: "Pink Crystal III",    image: "/world/DeepDungeonAssets/pink_crystal_3.png" },
  [DD_ITEM.PINK_CRYSTAL_4]:   { name: "Pink Crystal IV",     image: "/world/DeepDungeonAssets/pink_crystal_4.png" },
  [DD_ITEM.PINK_CRYSTAL_5]:   { name: "Pink Crystal V",      image: "/world/DeepDungeonAssets/pink_crystal_5.png" },
  [DD_ITEM.WHITE_CRYSTAL_1]:  { name: "White Crystal I",     image: "/world/DeepDungeonAssets/white_crystal_1.png" },
  [DD_ITEM.WHITE_CRYSTAL_2]:  { name: "White Crystal II",    image: "/world/DeepDungeonAssets/white_crystal_2.png" },
  [DD_ITEM.WHITE_CRYSTAL_3]:  { name: "White Crystal III",   image: "/world/DeepDungeonAssets/white_crystal_3.png" },
  [DD_ITEM.WHITE_CRYSTAL_4]:  { name: "White Crystal IV",    image: "/world/DeepDungeonAssets/white_crystal_4.png" },
  [DD_ITEM.WHITE_CRYSTAL_5]:  { name: "White Crystal V",     image: "/world/DeepDungeonAssets/white_crystal_5.png" },
  [DD_ITEM.BLUE_CRYSTAL_1]:   { name: "Blue Crystal I",      image: "/world/DeepDungeonAssets/blue_crystal_1.png" },
  [DD_ITEM.BLUE_CRYSTAL_2]:   { name: "Blue Crystal II",     image: "/world/DeepDungeonAssets/blue_crystal_2.png" },
  [DD_ITEM.BLUE_CRYSTAL_3]:   { name: "Blue Crystal III",    image: "/world/DeepDungeonAssets/blue_crystal_3.png" },
  [DD_ITEM.BLUE_CRYSTAL_4]:   { name: "Blue Crystal IV",     image: "/world/DeepDungeonAssets/blue_crystal_4.png" },
  [DD_ITEM.BLUE_CRYSTAL_5]:   { name: "Blue Crystal V",      image: "/world/DeepDungeonAssets/blue_crystal_5.png" },
  [DD_ITEM.PRISMORA_CRYSTAL_1]: { name: "Prismora Crystal I",   image: "/world/DeepDungeonAssets/prismora_crystal_1.png" },
  [DD_ITEM.PRISMORA_CRYSTAL_2]: { name: "Prismora Crystal II",  image: "/world/DeepDungeonAssets/prismora_crystal_2.png" },
  [DD_ITEM.PRISMORA_CRYSTAL_3]: { name: "Prismora Crystal III", image: "/world/DeepDungeonAssets/prismora_crystal_3.png" },
  [DD_ITEM.PRISMORA_CRYSTAL_4]: { name: "Prismora Crystal IV",  image: "/world/DeepDungeonAssets/prismora_crystal_4.png" },
  [DD_ITEM.PRISMORA_CRYSTAL_5]: { name: "Prismora Crystal V",   image: "/world/DeepDungeonAssets/prismora_crystal_5.png" },
};

const CRYSTAL_IDS = new Set([
  DD_ITEM.PINK_CRYSTAL_1, DD_ITEM.PINK_CRYSTAL_2, DD_ITEM.PINK_CRYSTAL_3, DD_ITEM.PINK_CRYSTAL_4, DD_ITEM.PINK_CRYSTAL_5,
  DD_ITEM.WHITE_CRYSTAL_1, DD_ITEM.WHITE_CRYSTAL_2, DD_ITEM.WHITE_CRYSTAL_3, DD_ITEM.WHITE_CRYSTAL_4, DD_ITEM.WHITE_CRYSTAL_5,
  DD_ITEM.BLUE_CRYSTAL_1, DD_ITEM.BLUE_CRYSTAL_2, DD_ITEM.BLUE_CRYSTAL_3, DD_ITEM.BLUE_CRYSTAL_4, DD_ITEM.BLUE_CRYSTAL_5,
  DD_ITEM.PRISMORA_CRYSTAL_1, DD_ITEM.PRISMORA_CRYSTAL_2, DD_ITEM.PRISMORA_CRYSTAL_3, DD_ITEM.PRISMORA_CRYSTAL_4, DD_ITEM.PRISMORA_CRYSTAL_5,
]);

const CONSUMABLE_IDS = new Set([DD_ITEM.POTION, DD_ITEM.KEY_CHEST]);

export const LobbyInventoryModal: React.FC<Props> = ({ onClose }) => {
  const { playerEconomy } = useMinigameSession();
  const [selectedItem, setSelectedItem] = useState<ItemSlot | null>(null);

  const buildSlot = (id: string): ItemSlot | null => {
    const count = playerEconomy.balances[id] ?? 0;
    if (count <= 0) return null;
    const asset = ID_TO_ASSET[id];
    if (!asset) return null;
    return {
      id,
      name: asset.name,
      image: asset.image,
      count,
    };
  };

  const deepCoinCount = playerEconomy.balances[DD_ITEM.DEEP_COIN] ?? 0;
  const consumables = Array.from(CONSUMABLE_IDS).map(buildSlot).filter(Boolean) as ItemSlot[];
  const crystals = Array.from(CRYSTAL_IDS).map(buildSlot).filter(Boolean) as ItemSlot[];

  const isEmpty = deepCoinCount === 0 && consumables.length === 0 && crystals.length === 0;

  const toggle = (slot: ItemSlot) => {
    setSelectedItem((prev) => (prev?.id === slot.id ? null : slot));
  };

  return (
    <Modal show>
      <OuterPanel className="flex flex-col h-[500px] max-h-[80vh] w-full max-w-lg p-1">
        {/* Header */}
        <div className="flex items-center pl-1 mb-2">
          <div className="flex items-center grow">
            <img src={DD_SUNNYSIDE.icons.basket} className="h-6 mr-3 ml-1" alt="" />
            <p className="font-bold text-sm uppercase text-brown-1100">{"Inventory"}</p>
          </div>
          <img
            src={DD_SUNNYSIDE.icons.close}
            className="cursor-pointer"
            onClick={onClose}
            style={{ width: `${PIXEL_SCALE * 11}px` }}
            alt="close"
          />
        </div>

        <OuterPanel className="flex-1 bg-[#e4a672] border-2 border-[#754733] rounded-sm overflow-hidden p-2">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center h-full opacity-70 gap-2">
              <img src={DD_SUNNYSIDE.icons.basket} className="w-10" alt="" />
              <p className="font-bold text-xs text-brown-1100">{"Your inventory is empty"}</p>
            </div>
          ) : (
            <div className="flex h-full gap-2">
              {/* Item grid */}
              <div className="flex-1 overflow-y-auto scrollable space-y-3 pr-1">
                {/* Deep Coins */}
                {deepCoinCount > 0 && (
                  <section>
                    <Label type="formula" icon={deepCoinImg} className="ml-1 uppercase text-xs mb-2">
                      {"Coins"}
                    </Label>
                    <div className="flex flex-wrap">
                      <Box
                        image={deepCoinImg}
                        count={new Decimal(deepCoinCount)}
                        fillImage
                        isSelected={selectedItem?.id === DD_ITEM.DEEP_COIN}
                        onClick={() => toggle({ id: DD_ITEM.DEEP_COIN, name: "Deep Coin", image: deepCoinImg, count: deepCoinCount })}
                      />
                    </div>
                  </section>
                )}

                {/* Consumables */}
                {consumables.length > 0 && (
                  <section>
                    <Label type="formula" icon={DD_SUNNYSIDE.icons.hammer} className="ml-1 uppercase text-xs mb-2">
                      {"Items"}
                    </Label>
                    <div className="flex flex-wrap">
                      {consumables.map((slot) => (
                        <Box
                          key={slot.id}
                          image={slot.image}
                          count={new Decimal(slot.count)}
                          fillImage
                          isSelected={selectedItem?.id === slot.id}
                          onClick={() => toggle(slot)}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Crystals */}
                {crystals.length > 0 && (
                  <section>
                    <Label type="formula" icon="/world/DeepDungeonAssets/bag_crystal.png" className="ml-1 uppercase text-xs mb-2">
                      {"Crystals"}
                    </Label>
                    <div className="flex flex-wrap">
                      {crystals.map((slot) => (
                        <Box
                          key={slot.id}
                          image={slot.image}
                          count={new Decimal(slot.count)}
                          fillImage
                          isSelected={selectedItem?.id === slot.id}
                          onClick={() => toggle(slot)}
                        />
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Detail panel */}
              {selectedItem && (
                <OuterPanel className="w-[40%] flex-shrink-0 self-start bg-[#f3d28a] border-2 border-[#754733] flex flex-col p-2">
                  <div className="flex flex-col items-center gap-2">
                    <p className="font-bold text-sm text-brown-1100 text-center">{selectedItem.name}</p>
                    <div
                      className="flex items-center justify-center bg-brown-600 rounded"
                      style={{ width: 56, height: 56, border: "2px solid #754733" }}
                    >
                      <img
                        src={selectedItem.image}
                        alt={selectedItem.name}
                        className="w-[80%] h-[80%] object-contain"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>
                    <Label type="formula">{`x${selectedItem.count}`}</Label>
                  </div>
                </OuterPanel>
              )}
            </div>
          )}
        </OuterPanel>
      </OuterPanel>
    </Modal>
  );
};
